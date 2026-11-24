#!/usr/bin/env python3
"""Provision isolated app projects and copy/verify live Oskar Lab assets without printing secrets."""
import argparse
import hashlib
import json
import mimetypes
import os
import re
from pathlib import Path
import subprocess
import time
import urllib.error
import urllib.request

ROOT = Path('/opt/oskar-lab')
KEYS = ROOT / 'storage-config' / 'orbit-projects.json'
MANIFEST = ROOT / 'storage-config' / 'orbit-assets.json'
APPS = ('oskar-lab', 'chess', 'cloth-lab', 'neon-vault', 'portfolio', 'core-design',
        'workout', 'room-studio', '2d-lab', 'inside-llm', 'tierlist-matcher', 'thailand', 'traveltime')
TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/x-icon',
         'image/vnd.microsoft.icon', 'application/pdf', 'application/json', 'text/plain']


def inspect(name):
    return json.loads(subprocess.check_output(['docker', 'inspect', name]))[0]


def atomic_json(path, content, secret=False):
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chown(path.parent, 10001, 10001)
    os.chmod(path.parent, 0o500)
    temporary = path.with_suffix(path.suffix + '.next')
    fd = os.open(temporary, os.O_CREAT | os.O_TRUNC | os.O_WRONLY, 0o600)
    with os.fdopen(fd, 'w') as stream:
        json.dump(content, stream, indent=2)
        stream.flush()
        os.fsync(stream.fileno())
    os.chown(temporary, 10001, 10001)
    os.chmod(temporary, 0o400 if secret else 0o444)
    temporary.replace(path)


class Orbit:
    def __init__(self):
        info = inspect('orbitstorage-orbit-storage-1')
        env = dict(item.split('=', 1) for item in info['Config']['Env'])
        self.admin = env['ORBIT_ADMIN_KEY']
        self.base = 'http://127.0.0.1:18080'

    def request(self, method, path, key=None, data=None, headers=None, binary=False):
        request_headers = {'Authorization': 'Bearer ' + (key or self.admin), **(headers or {})}
        if isinstance(data, dict):
            data = json.dumps(data).encode()
            request_headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(self.base + path, data=data, headers=request_headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                body = response.read(10 * 1024 * 1024 + 1)
                return body if binary else (json.loads(body) if body else None)
        except urllib.error.HTTPError as error:
            # Never print upstream bodies: provider diagnostics may contain private configuration.
            raise RuntimeError('Orbit request rejected with HTTP ' + str(error.code)) from None


def provision(orbit):
    keys = json.loads(KEYS.read_text()) if KEYS.exists() else {}
    providers = [p for p in orbit.request('GET', '/api/v1/admin/providers') if p.get('kind') == 'S3' and p.get('available')]
    if len(providers) != 1:
        raise RuntimeError('Expected one available S3 provider; review provider selection')
    projects = orbit.request('GET', '/api/v1/admin/projects')
    for app in APPS:
        name = 'oskar-lab/' + app
        matches = [p for p in projects if p['name'] == name]
        if len(matches) > 1:
            raise RuntimeError('Ambiguous app project; manual review required')
        project = matches[0] if matches else orbit.request('POST', '/api/v1/admin/projects', data={
            'name': name, 'providerId': providers[0]['id'], 'quotaBytes': 256 * 1024 * 1024,
            'maxFileBytes': 10 * 1024 * 1024, 'dailyUploadBytes': 200 * 1024 * 1024,
            'uploadsPerMinute': 20, 'concurrentUploads': 2, 'allowedTypes': TYPES})
        if app not in keys:
            key = orbit.request('POST', '/api/v1/admin/projects/' + project['id'] + '/keys',
                                data={'permissions': ['files:read', 'files:write', 'files:delete', 'usage:read']})
            keys[app] = {'projectId': project['id'], 'key': key['key']}
            atomic_json(KEYS, keys, secret=True)
        elif keys[app]['projectId'] != project['id']:
            raise RuntimeError('Stored project credentials disagree with provisioning')
    return keys


def sources(container):
    listing = subprocess.check_output(['docker', 'exec', container, 'find', '/app/apps',
        '-type', 'f', '-path', '*/public/*'], text=True).splitlines()
    listing.append('/app/apps/oskar-lab/src/app/favicon.ico')
    for source in sorted(set(listing)):
        parts = Path(source).parts
        if len(parts) < 6 or parts[:3] != ('/', 'app', 'apps') or parts[3] not in APPS:
            raise RuntimeError('Unexpected source path; refusing migration')
        app = parts[3]
        if parts[4] == 'public':
            asset_path = '/' + '/'.join(parts[5:])
        elif source == '/app/apps/oskar-lab/src/app/favicon.ico':
            asset_path = '/favicon.ico'
        else:
            raise RuntimeError('Source outside approved public assets')
        data = subprocess.check_output(['docker', 'exec', container, 'cat', source])
        yield 'publicAssets', app, asset_path, data
    private_root = ROOT / 'private' / 'thailand'
    if private_root.is_dir():
        for source in sorted(private_root.iterdir()):
            if source.is_symlink() or not source.is_file():
                continue
            yield 'privateAssets', 'thailand', '/' + source.name, source.read_bytes()


def synchronize(orbit, keys, container):
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {'publicAssets': {}, 'privateAssets': {}}
    copied = 0
    verified = 0
    private_count = 0
    for section, app, path, data in sources(container):
        if not data or len(data) > 10 * 1024 * 1024:
            raise RuntimeError('Source file violates the configured size policy')
        digest = hashlib.sha256(data).hexdigest()
        key = app + ':' + path
        previous = manifest[section].get(key)
        credential = keys[app]['key']
        if previous and previous['sha256'] == digest:
            downloaded = orbit.request('GET', '/api/v1/files/' + previous['fileId'], key=credential, binary=True)
            if hashlib.sha256(downloaded).hexdigest() != digest:
                raise RuntimeError('Previously migrated object failed integrity verification')
            verified += 1
        else:
            filename = Path(path).name
            media = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            if media not in TYPES:
                raise RuntimeError('Unapproved source file type; manual review required')
            uploaded = orbit.request('POST', '/api/v1/files', key=credential, data=data,
                headers={'X-Filename': filename, 'Content-Type': media})
            downloaded = orbit.request('GET', '/api/v1/files/' + uploaded['id'], key=credential, binary=True)
            if len(downloaded) != len(data) or hashlib.sha256(downloaded).hexdigest() != digest:
                raise RuntimeError('Uploaded object failed round-trip verification')
            manifest[section][key] = {'fileId': uploaded['id'], 'sha256': digest, 'size': len(data), 'mediaType': media}
            atomic_json(MANIFEST, manifest)
            copied += 1
        private_count += section == 'privateAssets'
    print(json.dumps({'projects': len(keys), 'copied': copied, 'alreadyVerified': verified, 'privateSources': private_count}))


def configure():
    import yaml
    network = 'oskar-lab-storage'
    if subprocess.run(['docker', 'network', 'inspect', network], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        subprocess.run(['docker', 'network', 'create', network], check=True, stdout=subprocess.DEVNULL)
    service = inspect('orbitstorage-orbit-storage-1')
    if network not in service['NetworkSettings']['Networks']:
        subprocess.run(['docker', 'network', 'connect', '--alias', 'orbit-storage-oskar', network, 'orbitstorage-orbit-storage-1'], check=True)
    compose = Path('/opt/orbitstorage/docker-compose.yml')
    original = compose.read_text()
    config = yaml.safe_load(original)
    networks = config['services']['orbit-storage'].setdefault('networks', {'default': {}})
    if not isinstance(networks, dict):
        raise RuntimeError('Review OrbitStorage network representation before updating')
    networks['oskar-storage'] = {'aliases': ['orbit-storage-oskar']}
    config.setdefault('networks', {})['oskar-storage'] = {'external': True, 'name': network}
    backup = compose.with_name('docker-compose.pre-oskar-storage-' + str(int(time.time())) + '.yml')
    backup.write_text(original)
    os.chmod(backup, 0o600)
    compose.write_text(yaml.safe_dump(config, sort_keys=False))
    overlay = {
        'services': {
            'backend': {'environment': {'ORBIT_BASE_URL': 'http://orbit-storage-oskar:8080',
                'ORBIT_PROJECT_KEYS_FILE': '/run/oskar-lab/orbit-projects.json', 'ORBIT_ASSET_MANIFEST': '/run/oskar-lab/orbit-assets.json'},
                'volumes': ['./storage-config:/run/oskar-lab:ro'],
                'networks': ['app', 'data', 'storage']},
            'thailand': {'environment': {'AUTH_BRIDGE_SECRET': '${AUTH_BRIDGE_SECRET}'}, 'healthcheck': {
                'test': ['CMD', 'node', '-e', "fetch('http://127.0.0.1:3000/apps/thailand/health?probe=liveness').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]}}},
        'networks': {'storage': {'external': True, 'name': network}}}
    overlay_file = ROOT / 'compose.orbit.yml'
    overlay_file.write_text(yaml.safe_dump(overlay, sort_keys=False))
    script = ROOT / 'bin' / 'deploy.sh'
    text = script.read_text()
    if '-f compose.orbit.yml' not in text or 'orbit_storage.py" --image' not in text:
        backup = script.with_name('deploy.pre-orbit-' + str(int(time.time())) + '.sh')
        backup.write_text(text)
        os.chmod(backup, 0o600)
        if '-f compose.orbit.yml' not in text:
            if '-f compose.yml)' not in text:
                raise RuntimeError('Deployment script layout changed; manual review required')
            text = text.replace('-f compose.yml)', '-f compose.yml -f compose.orbit.yml)')
        if 'orbit_storage.py" --image' not in text:
            anchor = '    # Start the platform first'
            if anchor not in text:
                raise RuntimeError('Frontend deployment anchor changed; manual review required')
            text = text.replace(anchor, '    python3 "$root/bin/orbit_storage.py" --image "$image"\n' + anchor, 1)
        script.write_text(text)
    print('Storage network and persistent deployment configuration prepared; no app container restarted.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--configure', action='store_true')
    parser.add_argument('--image', help='Verified frontend image whose assets are synchronized before rollout')
    args = parser.parse_args()
    if os.geteuid() != 0:
        raise RuntimeError('Run on the deployment host as the operator')
    orbit = Orbit()
    container = 'oskar-lab-production-platform-1'
    temporary = None
    if args.image:
        if not re.fullmatch(r'oskar-lab-frontend:[0-9a-f]{40}', args.image):
            raise RuntimeError('Expected an exact Oskar Lab frontend revision image')
        temporary = subprocess.check_output(['docker', 'run', '--detach', '--rm', '--network', 'none',
            '--read-only', '--memory', '32m', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true',
            '--entrypoint', 'sleep', args.image, '600'], text=True).strip()
        if not re.fullmatch(r'[0-9a-f]{64}', temporary):
            raise RuntimeError('Unexpected temporary container identifier')
        container = temporary
    try:
        synchronize(orbit, provision(orbit), container)
    finally:
        if temporary:
            subprocess.run(['docker', 'rm', '--force', temporary], check=True, stdout=subprocess.DEVNULL)
    if args.configure:
        configure()


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Migration stopped safely:', str(error) if isinstance(error, RuntimeError) else type(error).__name__)
        raise SystemExit(1)

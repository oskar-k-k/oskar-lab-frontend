"""Add the Oskar Lab route and persist its edge network on the audited Lilsi host."""
import datetime
from pathlib import Path
import subprocess


def configure():
    """Back up existing files, validate candidates and gracefully reload only Caddy."""
    directory = Path('/opt/lilsi')
    caddy = directory / 'Caddyfile'
    compose = directory / 'docker-compose.yml'
    old_caddy = caddy.read_text()
    old_compose = compose.read_text()
    if 'oskarlab.dev' in old_caddy:
        raise SystemExit('Oskar Lab route already exists; inspect it before changing ingress.')
    if '  caddy:\n' not in old_compose or '\nnetworks:' in old_compose:
        raise SystemExit('Compose differs from the audited layout; inspect before editing.')
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    for file in (caddy, compose):
        backup = Path('/opt/oskar-lab/backups') / f'{file.name}.before-ingress-{stamp}'
        backup.write_bytes(file.read_bytes())
        backup.chmod(0o600)
    new_compose = old_compose.replace('  caddy:\n', '  caddy:\n    networks: [default, oskar-lab-edge]\n', 1)
    new_compose += '\nnetworks:\n  oskar-lab-edge:\n    external: true\n    name: oskar-lab-edge\n'
    new_caddy = old_caddy + '\noskarlab.dev {\n    encode gzip zstd\n    reverse_proxy oskar-lab-platform:3000\n}\n\nwww.oskarlab.dev {\n    redir https://oskarlab.dev{uri} permanent\n}\n'
    try:
        # Write in-place: Caddy bind-mounts this exact inode.
        caddy.write_text(new_caddy)
        compose.write_text(new_compose)
        subprocess.run(['docker', 'compose', '-f', str(compose), 'config', '--quiet'], cwd=directory, check=True)
        subprocess.run(['docker', 'exec', 'lilsi-caddy', 'caddy', 'validate', '--config', '/etc/caddy/Caddyfile'], check=True)
        networks = subprocess.check_output(['docker', 'inspect', 'lilsi-caddy', '--format', '{{json .NetworkSettings.Networks}}'], text=True)
        if 'oskar-lab-edge' not in networks:
            subprocess.run(['docker', 'network', 'connect', 'oskar-lab-edge', 'lilsi-caddy'], check=True)
        subprocess.run(['docker', 'exec', 'lilsi-caddy', 'caddy', 'reload', '--config', '/etc/caddy/Caddyfile'], check=True)
    except Exception:
        caddy.write_text(old_caddy)
        compose.write_text(old_compose)
        raise
    print('Added Oskar Lab ingress; Lilsi routes retained and containers not restarted.')


if __name__ == '__main__':
    configure()

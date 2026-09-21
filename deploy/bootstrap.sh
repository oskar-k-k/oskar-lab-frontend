#!/usr/bin/env bash
# One-time root setup on the audited Lilsi host. Does not start or alter Lilsi services.
set -Eeuo pipefail
umask 077
[[ $EUID == 0 ]] || exit 77
readonly root=/opt/oskar-lab
[[ -f "$root/compose.yml" && -f "$root/ci_ed25519.pub" ]] || exit 78
chown root:root "$root"
chmod 755 "$root"
install -d -m 700 "$root/backups" "$root/releases"
install -d -m 755 "$root/bin"
install -o root -g root -m 755 "$root/deploy.sh" "$root/bin/deploy.sh"
install -o root -g root -m 755 "$root/ci-command.sh" "$root/bin/ci-command.sh"
python3 - <<'PY'
from pathlib import Path
import secrets
root = Path('/opt/oskar-lab')
env = root / 'production.env'
if not env.exists():
    env.write_text('PUBLIC_URL=https://oskarlab.dev\n' + ''.join(
        f'{name}={secrets.token_hex(32)}\n'
        for name in ('DATABASE_PASSWORD', 'AUTH_SECRET', 'AUTH_BRIDGE_SECRET')
    ) + 'AUTH_GOOGLE_ID=\nAUTH_GOOGLE_SECRET=\n')
    env.chmod(0o600)
images = root / 'images.env'
if not images.exists():
    images.write_text('BACKEND_IMAGE=oskar-lab-backend:pending\nFRONTEND_IMAGE=oskar-lab-frontend:pending\n')
    images.chmod(0o600)
PY
if ! id oskar-lab-ci >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash oskar-lab-ci
fi
install -d -m 700 -o oskar-lab-ci -g oskar-lab-ci /home/oskar-lab-ci/.ssh
printf 'restrict,command="/opt/oskar-lab/bin/ci-command.sh" %s\n' "$(cat "$root/ci_ed25519.pub")" > /home/oskar-lab-ci/.ssh/authorized_keys
chown oskar-lab-ci:oskar-lab-ci /home/oskar-lab-ci/.ssh/authorized_keys
chmod 600 /home/oskar-lab-ci/.ssh/authorized_keys
printf 'oskar-lab-ci ALL=(root) NOPASSWD: /opt/oskar-lab/bin/deploy.sh\n' > /etc/sudoers.d/oskar-lab-ci
chmod 440 /etc/sudoers.d/oskar-lab-ci
visudo -cf /etc/sudoers.d/oskar-lab-ci
docker network inspect oskar-lab-edge >/dev/null 2>&1 || docker network create oskar-lab-edge
cd "$root"
docker compose --env-file production.env --env-file images.env -f compose.yml config --quiet
echo 'Oskar Lab deployment prepared; no existing project restarted.'

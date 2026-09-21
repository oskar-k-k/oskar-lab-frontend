#!/usr/bin/env bash
# Forced SSH command: no shell, forwarding, arbitrary arguments, or Docker group membership.
set -euo pipefail
if [[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ (frontend|backend)\ ([0-9a-f]{40})$ ]]; then
    exec sudo -n /opt/oskar-lab/bin/deploy.sh "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
fi
echo 'Only deploy frontend|backend <40-character commit SHA> is permitted.' >&2
exit 64

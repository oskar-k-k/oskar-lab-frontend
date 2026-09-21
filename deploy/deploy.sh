#!/usr/bin/env bash
# Load a CI-built image from stdin and update only the selected Oskar Lab component.
set -Eeuo pipefail
umask 077
readonly root=/opt/oskar-lab
component=${1:-}
revision=${2:-}
[[ "$component" =~ ^(frontend|backend)$ && "$revision" =~ ^[0-9a-f]{40}$ ]] || exit 64
[[ $EUID == 0 && -f "$root/production.env" && -f "$root/images.env" ]] || exit 78
exec 9>"$root/deploy.lock"
flock -w 900 9
cd "$root"
candidate=$(mktemp "$root/images.XXXXXX")
trap 'rm -f "$candidate"' EXIT
cp images.env "$candidate"
image="oskar-lab-$component:$revision"
variable=FRONTEND_IMAGE
[[ "$component" != backend ]] || variable=BACKEND_IMAGE
sed -i "s|^$variable=.*|$variable=$image|" "$candidate"
compose=(docker compose --project-name oskar-lab-production --env-file production.env --env-file "$candidate" -f compose.yml)
"${compose[@]}" config --quiet
# Validate and load before changing any running service; never prune shared Docker state.
gzip -dc | docker image load
docker image inspect "$image" > /dev/null
if [[ "$component" == backend ]]; then
    if [[ -n "$("${compose[@]}" ps --status running -q postgres)" ]]; then
        backup="$root/backups/pre-$revision-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
        "${compose[@]}" exec -T postgres pg_dump -U oskarlab -d oskarlab | gzip > "$backup"
        gzip -t "$backup"
    fi
    "${compose[@]}" up -d --wait --wait-timeout 180 postgres backend
else
    # Start the platform first so product authentication calls resolve during health checks.
    "${compose[@]}" up -d --no-deps --wait --wait-timeout 120 platform
    for service in workout chess cloth-lab neon-vault portfolio core-design; do
        "${compose[@]}" up -d --no-deps --wait --wait-timeout 120 "$service"
    done
fi
cp images.env "releases/$(date -u +%Y%m%dT%H%M%SZ)-$component.previous.env"
mv "$candidate" images.env
printf '%s %s %s\n' "$(date -u +%FT%TZ)" "$component" "$revision" >> releases/history.log
printf 'Deployed %s %s\n' "$component" "$revision"

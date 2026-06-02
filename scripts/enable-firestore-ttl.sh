#!/usr/bin/env bash
# Enable Firestore TTL policies on short-lived collections.
# Run once per environment after deploy. Requires gcloud CLI authenticated
# against the target project.
#
# Usage:
#   GCP_PROJECT=aularo-prod ./scripts/enable-firestore-ttl.sh
#
# Collections managed here:
#   - rateLimits     ttlAt  (swept ~24h after window expiry)
#   - stripeEvents   ttlAt  (swept 30d after receipt — long enough for any retry)
#   - pairingCodes   ttlAt  (swept ~24h after the 10-minute code expires)
#
# Docs: https://cloud.google.com/firestore/docs/ttl

set -euo pipefail

PROJECT="${GCP_PROJECT:?set GCP_PROJECT}"

enable_ttl() {
  local COLLECTION="$1"
  echo "[ttl] enabling on ${COLLECTION}.ttlAt"
  gcloud firestore fields ttls update ttlAt \
    --collection-group="${COLLECTION}" \
    --enable-ttl \
    --project="${PROJECT}" \
    --quiet
}

enable_ttl rateLimits
enable_ttl stripeEvents
enable_ttl pairingCodes

echo "[ttl] done. Verify in console: https://console.cloud.google.com/firestore/ttl?project=${PROJECT}"

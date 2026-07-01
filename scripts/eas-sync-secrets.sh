#!/usr/bin/env bash
# Upload .env values and Firebase native config files to EAS (preview + production).
# Requires: eas CLI logged in, .env and google-services files present locally.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-$ROOT/.env}"
ANDROID_JSON="${ANDROID_JSON:-$ROOT/google-services.json}"
IOS_PLIST="${IOS_PLIST:-$ROOT/GoogleService-Info.plist}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi
if [[ ! -f "$ANDROID_JSON" ]]; then
  echo "Missing $ANDROID_JSON" >&2
  exit 1
fi
if [[ ! -f "$IOS_PLIST" ]]; then
  echo "Missing $IOS_PLIST" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

upsert_string() {
  local name="$1"
  local value="$2"
  local visibility="${3:-sensitive}"
  shift 3
  local -a envs=("$@")

  for env in "${envs[@]}"; do
    eas env:create "$env" \
      --name "$name" \
      --value "$value" \
      --type string \
      --visibility "$visibility" \
      --scope project \
      --non-interactive \
      --force
    echo "Set $name ($visibility) for $env"
  done
}

upsert_app_env() {
  local env="$1"
  local value="$2"
  eas env:create "$env" \
    --name EXPO_PUBLIC_APP_ENV \
    --value "$value" \
    --type string \
    --visibility plaintext \
    --scope project \
    --non-interactive \
    --force
  echo "Set EXPO_PUBLIC_APP_ENV=$value for $env"
}

upsert_file() {
  local name="$1"
  local path="$2"
  shift 2
  local -a envs=("$@")

  for env in "${envs[@]}"; do
    eas env:create "$env" \
      --name "$name" \
      --value "$path" \
      --type file \
      --visibility secret \
      --scope project \
      --non-interactive \
      --force
    echo "Uploaded $name (secret file) for $env"
  done
}

SHARED_ENVS=(preview production)

STRING_VARS=(
  EXPO_PUBLIC_FIREBASE_API_KEY
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  EXPO_PUBLIC_FIREBASE_PROJECT_ID
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  EXPO_PUBLIC_FIREBASE_APP_ID
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
  EXPO_PUBLIC_WEB_CLIENT_ID
)

for var in "${STRING_VARS[@]}"; do
  value="${!var:-}"
  if [[ -z "$value" ]]; then
    echo "Skip $var (empty in .env)" >&2
    continue
  fi
  upsert_string "$var" "$value" sensitive "${SHARED_ENVS[@]}"
done

if [[ -n "${GOOGLE_MAPS_API_KEY:-}" ]]; then
  upsert_string GOOGLE_MAPS_API_KEY "$GOOGLE_MAPS_API_KEY" secret "${SHARED_ENVS[@]}"
else
  echo "Skip GOOGLE_MAPS_API_KEY (empty in .env)" >&2
fi

upsert_app_env preview preview
upsert_app_env production production

upsert_file GOOGLE_SERVICES_JSON "$ANDROID_JSON" "${SHARED_ENVS[@]}"
upsert_file GOOGLE_SERVICE_INFO_PLIST "$IOS_PLIST" "${SHARED_ENVS[@]}"

echo "Done. Verify with: eas env:list --environment preview"

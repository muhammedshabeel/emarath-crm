#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${PROJECT_DIR}/meta_whatsapp_optimizer.zip"

if [[ ! -d "${PROJECT_DIR}/app" ]]; then
  echo "Expected app/ directory under ${PROJECT_DIR}. Are you in meta_whatsapp_optimizer?" >&2
  exit 1
fi

cd "${PROJECT_DIR}/.."
zip -r "${OUTPUT_PATH}" "$(basename "${PROJECT_DIR}")"

echo "Created ${OUTPUT_PATH}"

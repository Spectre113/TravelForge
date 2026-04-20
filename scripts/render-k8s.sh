#!/usr/bin/env bash
set -euo pipefail

: "${NAMESPACE:?NAMESPACE is required}"
: "${APP_HOST:?APP_HOST is required}"
: "${PUBLIC_SCHEME:?PUBLIC_SCHEME is required}"
: "${BACKEND_IMAGE:?BACKEND_IMAGE is required}"
: "${FRONTEND_IMAGE:?FRONTEND_IMAGE is required}"

OUT_DIR=".rendered-k8s"
SRC_DIR="k8s"

rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}"

cp -R "${SRC_DIR}/." "${OUT_DIR}/"

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&|]/\\&/g'
}

NAMESPACE_ESCAPED="$(escape_sed_replacement "${NAMESPACE}")"
APP_HOST_ESCAPED="$(escape_sed_replacement "${APP_HOST}")"
PUBLIC_SCHEME_ESCAPED="$(escape_sed_replacement "${PUBLIC_SCHEME}")"
BACKEND_IMAGE_ESCAPED="$(escape_sed_replacement "${BACKEND_IMAGE}")"
FRONTEND_IMAGE_ESCAPED="$(escape_sed_replacement "${FRONTEND_IMAGE}")"

find "${OUT_DIR}" -type f \( -name "*.yaml" -o -name "*.yml" \) -print0 | while IFS= read -r -d '' file; do
  sed -i \
    -e "s|CHANGE_ME_NAMESPACE|${NAMESPACE_ESCAPED}|g" \
    -e "s|CHANGE_ME_HOST|${APP_HOST_ESCAPED}|g" \
    -e "s|CHANGE_ME_PUBLIC_SCHEME|${PUBLIC_SCHEME_ESCAPED}|g" \
    -e "s|CHANGE_ME_BACKEND_IMAGE|${BACKEND_IMAGE_ESCAPED}|g" \
    -e "s|CHANGE_ME_FRONTEND_IMAGE|${FRONTEND_IMAGE_ESCAPED}|g" \
    "$file"
done

echo "Rendered manifests written to ${OUT_DIR}"

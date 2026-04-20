#!/usr/bin/env bash
set -euo pipefail

: "${NAMESPACE:=travelforge}"
: "${JWT_SECRET:?Set JWT_SECRET}"
: "${GIGACHAT_CLIENT_ID:?Set GIGACHAT_CLIENT_ID}"
: "${GIGACHAT_SECRET:?Set GIGACHAT_SECRET}"
: "${GRAFANA_ADMIN_USER:=admin}"
: "${GRAFANA_ADMIN_PASSWORD:?Set GRAFANA_ADMIN_PASSWORD}"

kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 || kubectl create namespace "$NAMESPACE"

kubectl delete secret travelforge-secret -n "$NAMESPACE" --ignore-not-found
kubectl create secret generic travelforge-secret \
  -n "$NAMESPACE" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=GIGACHAT_CLIENT_ID="$GIGACHAT_CLIENT_ID" \
  --from-literal=GIGACHAT_SECRET="$GIGACHAT_SECRET"

kubectl delete secret travelforge-grafana-admin -n "$NAMESPACE" --ignore-not-found
kubectl create secret generic travelforge-grafana-admin \
  -n "$NAMESPACE" \
  --from-literal=GF_SECURITY_ADMIN_USER="$GRAFANA_ADMIN_USER" \
  --from-literal=GF_SECURITY_ADMIN_PASSWORD="$GRAFANA_ADMIN_PASSWORD"

kubectl create configmap gigachat-ca \
  -n "$NAMESPACE" \
  --from-file=gigachat-ca-bundle.crt="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/k8s/gigachat-ca-bundle.crt" \
  --dry-run=client -o yaml | kubectl apply -f -

printf 'Secrets and CA config map are ready in namespace %s\n' "$NAMESPACE"

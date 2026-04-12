#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "Starting TravelForge..."

# ── env checks ────────────────────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "WARN: backend/.env not found — copying from env.example"
  cp "$BACKEND_DIR/env.example" "$BACKEND_DIR/.env"
fi

if [ ! -f "$FRONTEND_DIR/.env" ]; then
  echo "WARN: frontend/.env not found — copying from .env.example"
  cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
fi

# ── graceful shutdown ──────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "Stopping servers (PID backend=$BACKEND_PID frontend=$FRONTEND_PID)..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo "Done."
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── start backend ─────────────────────────────────────────────────────────
echo "[backend] Starting on http://localhost:5000 ..."
cd "$BACKEND_DIR"
npm run dev &
BACKEND_PID=$!

# Wait until health endpoint responds (max 15 s)
echo "[backend] Waiting for health check..."
for i in $(seq 1 15); do
  sleep 1
  if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo "[backend] Ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "ERROR: backend did not start in 15s. Check logs above."
    kill "$BACKEND_PID" 2>/dev/null
    exit 1
  fi
done

# ── start frontend ────────────────────────────────────────────────────────
echo "[frontend] Starting on http://localhost:3000 ..."
cd "$FRONTEND_DIR"
npm start &
FRONTEND_PID=$!

echo ""
echo "TravelForge is running:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5000"
echo "  Health:    http://localhost:5000/health"
echo "  Metrics:   http://localhost:5000/metrics"
echo "  Prometheus:http://localhost:5000/metrics/prometheus"
echo ""
echo "Press Ctrl+C to stop all servers."

wait

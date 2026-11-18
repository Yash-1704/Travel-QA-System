#!/usr/bin/env bash
set -e

# Change to project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=== Starting Travel QA Project ==="

# 1. Check .env file
if [ ! -f .env ]; then
  echo "Error: .env file not found in $ROOT_DIR. Please create it first."
  exit 1
fi

# 2. Ensure Docker Desktop context is used if available
if docker context inspect desktop-linux >/dev/null 2>&1; then
  docker context use desktop-linux >/dev/null 2>&1 || true
fi

# 3. Check Docker daemon availability
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not reachable. Please ensure Docker Desktop is running."
  exit 1
fi

# 4. Start Docker services (Chroma only, or MongoDB if needed)
# Check if local MongoDB is already running on 27017
if ss -tulpn 2>/dev/null | grep -q ":27017 "; then
  echo "Detected MongoDB already running on port 27017 (using local MongoDB instance)."
  echo "Starting Chroma vector store container..."
  docker compose up -d chroma
else
  echo "Starting Chroma and MongoDB containers..."
  docker compose up -d
fi

# Wait briefly for containers to initialize
echo "Waiting for background services to be ready..."
sleep 2

# 5. Handle cleanup on script termination (Ctrl+C)
cleanup() {
  echo ""
  echo "Shutting down servers..."
  if [ -n "$BACKEND_PID" ]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
  if [ -n "$FRONTEND_PID" ]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
  wait 2>/dev/null || true
  echo "Servers stopped. (Docker containers remain running in background. Run 'docker compose down' if you wish to stop them)."
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 6. Start Backend Server
echo "Starting Backend API on http://localhost:3001..."
node server/src/index.js &
BACKEND_PID=$!

# 7. Start Frontend Client
echo "Starting Frontend Client on http://localhost:5173..."
(cd client && npm run dev) &
FRONTEND_PID=$!

echo "============================================="
echo " Travel QA System is running!"
echo " - Frontend: http://localhost:5173"
echo " - Backend API: http://localhost:3001"
echo " Press Ctrl+C in this terminal to stop both."
echo "============================================="

# Keep script running and wait for background jobs
wait


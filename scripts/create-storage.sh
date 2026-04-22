#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$ROOT_DIR/storage/uploads" "$ROOT_DIR/storage/outputs" "$ROOT_DIR/storage/jobs"
printf '[OK] prepared storage directories in %s
' "$ROOT_DIR/storage"

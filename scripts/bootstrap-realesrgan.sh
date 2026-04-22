#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TARGET_DIR=${1:-"$ROOT_DIR/external/Real-ESRGAN"}

if [ -d "$TARGET_DIR/.git" ]; then
  echo "[OK] Real-ESRGAN repo already exists at $TARGET_DIR"
  exit 0
fi

mkdir -p "$(dirname -- "$TARGET_DIR")"
git clone https://github.com/xinntao/Real-ESRGAN.git "$TARGET_DIR"

echo "[OK] cloned Real-ESRGAN to $TARGET_DIR"
echo "Next steps:"
echo "  1. review dependency needs inside external/Real-ESRGAN"
echo "  2. set UPSCALE_PROVIDER=realesrgan or auto"
echo "  3. rebuild the worker if you install optional AI deps"

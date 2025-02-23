#!/bin/bash

# Usage: ./build-demo-zip.sh source_directory output_zipfile.zip

SOURCE_DIR="$1"
OUTPUT_ZIP="$2"

if [ -z "$SOURCE_DIR" ] || [ -z "$OUTPUT_ZIP" ]; then
  echo "Usage: $0 source_directory output_zipfile.zip"
  exit 1
fi

CWD=$(pwd)

(cd "$SOURCE_DIR" && zip -rq -o "$CWD/$OUTPUT_ZIP" . -x "**/.DS_Store" "pnpm-lock.yaml" "node_modules/*" ".*")
echo "Created $OUTPUT_ZIP"
#!/usr/bin/env bash
# Vercel build step: the Flutter web app plus the static legal pages in web/
# (privacy, terms, support, delete-account), output to build/web.
# Set INSTAGRAM_ENABLED=true in Vercel once Meta approves the Instagram app.
set -euo pipefail
export PATH="$PWD/.flutter-sdk/bin:$PATH"
flutter build web --release \
  --dart-define=INSTAGRAM_ENABLED="${INSTAGRAM_ENABLED:-false}"

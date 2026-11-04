#!/usr/bin/env bash
# Vercel install step: fetches the Flutter SDK (Vercel's build machines don't
# have it) at the version the app is developed and tested with.
set -euo pipefail

FLUTTER_VERSION="3.38.9"
SDK="$PWD/.flutter-sdk"

# Flutter unpacks its Dart SDK with unzip.
if ! command -v unzip >/dev/null 2>&1; then
  dnf install -y unzip >/dev/null 2>&1 || yum install -y unzip >/dev/null 2>&1
fi

if [ ! -x "$SDK/bin/flutter" ]; then
  git clone --depth 1 --branch "$FLUTTER_VERSION" https://github.com/flutter/flutter.git "$SDK"
fi

export PATH="$SDK/bin:$PATH"
flutter config --no-analytics >/dev/null
flutter --version
flutter pub get

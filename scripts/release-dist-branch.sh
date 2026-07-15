#!/usr/bin/env bash
# Rebuilds the library and force-pushes the built output as the single-commit
# "dist" branch, so consumers can install it directly with:
#
#   npm install github:rishabh-synclovis/ng-full-calendar#dist
#
# Run this from the repo root after merging changes to main that should be released.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

WORKTREE_DIR="$(mktemp -d)/ng-full-calendar-dist"

echo "==> Building library"
npm run build:lib

echo "==> Preparing dist worktree at $WORKTREE_DIR"
git worktree add --orphan -b dist-release-tmp "$WORKTREE_DIR" >/dev/null

echo "==> Copying built package"
rm -rf "${WORKTREE_DIR:?}"/*
cp -r dist/ng-full-calendar/. "$WORKTREE_DIR"/

VERSION=$(node -p "require('$REPO_ROOT/dist/ng-full-calendar/package.json').version")

pushd "$WORKTREE_DIR" >/dev/null
git add -A
git commit -m "Release v$VERSION" >/dev/null
popd >/dev/null

echo "==> Force-pushing to origin/dist"
git push origin "dist-release-tmp:dist" --force

echo "==> Cleaning up worktree"
git worktree remove "$WORKTREE_DIR" --force
git branch -D dist-release-tmp

echo "Done. Consumers can install with:"
echo "  npm install github:rishabh-synclovis/ng-full-calendar#dist"

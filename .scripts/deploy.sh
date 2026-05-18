#!/usr/bin/env sh
set -eu

REPO_ROOT="$(git rev-parse --show-toplevel)"
APPROVED_FILE="$REPO_ROOT/approved.yaml"

if [ ! -f "$APPROVED_FILE" ]; then
  echo "Error: approved.yaml not found at $APPROVED_FILE" >&2
  exit 1
fi

# Read folder names from approved.yaml
FOLDERS=$(yq e '.folders | keys | .[]' "$APPROVED_FILE")

if [ -z "$FOLDERS" ]; then
  echo "Error: No folders found in approved.yaml" >&2
  exit 1
fi

COUNT=0
echo "Select a sheet to deploy:"
echo ""
echo "$FOLDERS" | while IFS= read -r folder; do
  COUNT=$((COUNT + 1))
  printf "  %d) %s\n" "$COUNT" "$folder"
done
COUNT=$(echo "$FOLDERS" | wc -l | tr -d ' ')
echo ""

printf "Enter number (1-%s): " "$COUNT"
read -r CHOICE

if ! echo "$CHOICE" | grep -qE '^[0-9]+$' || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "$COUNT" ]; then
  echo "Error: Invalid selection" >&2
  exit 1
fi

SELECTED=$(echo "$FOLDERS" | sed -n "${CHOICE}p")
echo ""
echo "Deploying: $SELECTED"
gh workflow run "Deploy on PR Merge" -f "folder=$SELECTED"
echo "Workflow triggered. View status: gh run list --workflow=deploy-on-merge.yml"

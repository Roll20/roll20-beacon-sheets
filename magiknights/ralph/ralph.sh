#!/bin/bash

# Ralph Wiggum - Autonomous Claude Code Loop
# Usage: ./ralph.sh [max_iterations]
# Each iteration runs Claude Code with a fresh context window

MAX_ITERATIONS=${1:-20}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROMPT_FILE="$SCRIPT_DIR/PROMPT.md"

echo "=== Ralph Wiggum Starting ==="
echo "Max iterations: $MAX_ITERATIONS"
echo "Project dir: $PROJECT_DIR"
echo ""

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo "--- Iteration $i/$MAX_ITERATIONS ---"

    # Run Claude Code with the prompt file content
    OUTPUT=$(cd "$PROJECT_DIR" && claude --print -p "$(cat "$PROMPT_FILE")" 2>&1)

    # Check for completion signal
    if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
        echo ""
        echo "=== ALL TASKS COMPLETE ==="
        echo "Finished in $i iteration(s)"
        exit 0
    fi

    echo "Task completed, continuing..."
    echo ""
done

echo ""
echo "=== Max iterations reached ($MAX_ITERATIONS) ==="
echo "Some tasks may still be incomplete. Check activity.md for status."
exit 1

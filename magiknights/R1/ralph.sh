#!/bin/bash

# Ralph Wiggum - Autonomous Claude Code Loop
# With Playwright MCP support for visual verification

MAX_ITERATIONS=${1:-20}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROMPT_FILE="$SCRIPT_DIR/PROMPT.md"
LOG_DIR="$SCRIPT_DIR/logs"
DEV_SERVER_PID=""

mkdir -p "$LOG_DIR"

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up..."
    if [ -n "$DEV_SERVER_PID" ] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        echo "Stopping dev server (PID: $DEV_SERVER_PID)"
        kill "$DEV_SERVER_PID" 2>/dev/null
    fi
    exit
}

trap cleanup EXIT INT TERM

echo "=== Ralph Wiggum Starting ==="
echo "Max iterations: $MAX_ITERATIONS"
echo "Project dir: $PROJECT_DIR"
echo "Logs: $LOG_DIR"
echo ""

# Start dev server
echo "Starting dev server..."
cd "$PROJECT_DIR"
npm run dev > "$LOG_DIR/dev-server.log" 2>&1 &
DEV_SERVER_PID=$!
echo "Dev server PID: $DEV_SERVER_PID"

# Wait for dev server to be ready
echo "Waiting for dev server..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "Dev server ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: Dev server failed to start"
        cat "$LOG_DIR/dev-server.log"
        exit 1
    fi
    sleep 1
done

echo ""

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║       Iteration $i/$MAX_ITERATIONS"
    echo "╚════════════════════════════════════════╝"

    LOG_FILE="$LOG_DIR/iteration_$i.log"

    # Run Claude and stream output while also saving to log
    cd "$PROJECT_DIR"
    claude -p "$(cat "$PROMPT_FILE")" 2>&1 | tee "$LOG_FILE"

    # Check for completion
    if grep -q "<promise>COMPLETE</promise>" "$LOG_FILE"; then
        echo ""
        echo "✓ ALL TASKS COMPLETE - Finished in $i iteration(s)"
        exit 0
    fi

    # Show quick status from activity.md if it exists
    if [ -f "$SCRIPT_DIR/activity.md" ]; then
        echo ""
        echo "--- Current Status ---"
        head -10 "$SCRIPT_DIR/activity.md"
    fi

    echo ""
    echo "--- Iteration complete, continuing ---"
done

echo ""
echo "⚠ Max iterations reached ($MAX_ITERATIONS)"
exit 1
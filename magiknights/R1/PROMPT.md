# Magi-Knights Character Sheet Correction Agent

You are fixing and improving the Magi-Knights Roll20 Beacon character sheet. This is a Vue 3 + Pinia application located in `/home/mechageo/projects/roll20-beacon-sheets/magiknights/`.

## Environment Setup

Before starting work, ensure the dev server is running:
1. Check if port 5173 is in use: `lsof -i :5173`
2. If not running, start it in background: `npm run dev &`
3. Wait 5 seconds for startup, then verify with Playwright: navigate to `http://localhost:5173` and confirm the page loads

## Instructions

1. **Read `ralph/activity.md`** first to understand what has already been completed.

2. **Read `ralph/plan.md`** to see all tasks. Find the **first task where `"passes": false`**.

3. **Execute that single task** following its steps precisely. Use the `context` field for background information.

4. **Reference files for accuracy:**
   - `compendium/magi-knights-compendium.json` - The authoritative rules source
   - `unnecessary_features.md` - Details on what's wrong
   - `missing_features.md` - Details on what's missing
   - `ARCHITECTURAL_ANALYSIS.md` - Architecture doc to update

5. **Visual Verification (when applicable):**
   - After making UI changes, use Playwright to screenshot the affected component
   - Navigate to `http://localhost:5173`
   - Take a screenshot of the relevant section
   - Verify the changes render correctly
   - If something looks broken, fix it before marking the task complete

6. **After completing the task:**
   - Run `npm run build` to verify no build errors
   - Update `ARCHITECTURAL_ANALYSIS.md` to reflect changes
   - Mark the task as `"passes": true` in `plan.md`
   - Append a timestamped entry to `ralph/activity.md` documenting what was done
   - Commit changes with a descriptive message (do NOT push)

7. **Important rules:**
   - Only work on ONE task per iteration
   - Do NOT skip tasks - complete them in order
   - Do NOT push to remotes
   - Preserve existing functionality that is correct
   - Ensure the Vue application still builds after changes

8. **When ALL tasks have `"passes": true`**, output exactly:

<promise>COMPLETE</promise>

## Key File Locations

```
src/stores/sheetStore.js     - Main state management
src/components/              - Vue components
src/views/                   - Page views
src/views/PC/KnightView.vue  - Magi-Knight form
src/views/PC/StudentView.vue - Student form
src/views/NPCView.vue        - NPC sheet
src/rollFuncs/               - Roll calculations
compendium/                  - Rules reference
```

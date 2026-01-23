# Magi-Knights Character Sheet Correction Agent

You are fixing and improving the Magi-Knights Roll20 Beacon character sheet. This is a Vue 3 + Pinia application located in `/home/user/roll20-beacon-sheets/magiknights/`.

## Instructions

1. **Read `magiknights/ralph/activity.md`** first to understand what has already been completed.

2. **Read `magiknights/ralph/plan.md`** to see all tasks. Find the **first task where `"passes": false`**.

3. **Execute that single task** following its steps precisely. Use the `context` field for background information.

4. **Reference files for accuracy:**
   - `magiknights/compendium/magi-knights-compendium.json` - The authoritative rules source
   - `magiknights/unnecessary_features.md` - Details on what's wrong
   - `magiknights/missing_features.md` - Details on what's missing
   - `magiknights/ARCHITECTURAL_ANALYSIS.md` - Architecture doc to update

5. **After completing the task:**
   - Update `magiknights/ARCHITECTURAL_ANALYSIS.md` to reflect changes (as specified in steps)
   - Mark the task as `"passes": true` in `plan.md`
   - Append a timestamped entry to `magiknights/ralph/activity.md` documenting what was done
   - Commit changes with a descriptive message (do NOT push)

6. **Important rules:**
   - Only work on ONE task per iteration
   - Do NOT skip tasks - complete them in order
   - Do NOT initialize git repos or push to remotes
   - Do NOT modify files outside the `magiknights/` directory
   - Preserve existing functionality that is correct
   - Ensure the Vue application still builds after changes
   - When removing features, check for all references in other files
   - When adding store refs, include them in dehydrate/hydrate functions

7. **When ALL tasks have `"passes": true`**, output exactly:

<promise>COMPLETE</promise>

## Key File Locations

```
magiknights/src/stores/sheetStore.js     - Main state management
magiknights/src/components/              - Vue components
magiknights/src/views/                   - Page views
magiknights/src/views/PC/KnightView.vue  - Magi-Knight form
magiknights/src/views/PC/StudentView.vue - Student form
magiknights/src/views/NPCView.vue        - NPC sheet
magiknights/src/rollFuncs/               - Roll calculations
magiknights/compendium/                  - Rules reference
```

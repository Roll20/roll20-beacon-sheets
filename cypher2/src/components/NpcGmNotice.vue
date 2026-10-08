<!-- spec §7.5: a viewer without GM rights sees this line and nothing else on an NPC
     sheet. It hides the DISPLAY only. Journal permissions are the real barrier, because
     headless runs still execute computed values (spec §2.3). isGM is read once at load,
     so a player promoted to GM must reopen the sheet. -->
<template>
  <p class="npc-notice panel" role="note">This sheet is an NPC. Only the GM can view it.</p>
</template>

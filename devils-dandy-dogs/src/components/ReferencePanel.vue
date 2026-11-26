<script setup>
// Static back-page reference, transcribed from the official character sheet insert.
const dogBasics = [
  ['Ghostsense', 'Discern and interact with supernatural and magical creatures of all kinds.'],
  ['Pack Speak', 'Communicate with packmates through vocalizations and body language.'],
  ['Ride the Lines', 'Move nearly instantly through place and time via leylines.'],
  ['Shadowwalk', 'While shadowwalking you can\'t be seen by most creatures.'],
  ['Speak & Read', 'You can speak and read many languages.'],
  ['Soulspeak', 'Interact with any creature who wants to, or has, made a deal with the Devil.']
]
</script>

<template>
  <details class="reference ddd-section">
    <summary class="ddd-banner">Reference</summary>
    <div class="ddd-panel">
      <h3>Devil&rsquo;s Dice Rolls</h3>
      <table>
        <thead><tr><th>d6</th><th>Narrative</th><th>Combat</th></tr></thead>
        <tbody>
          <tr><td>6</td><td>Devil&rsquo;s Eyebrow</td><td>Devil&rsquo;s Tooth &amp; Claw</td></tr>
          <tr><td>2&ndash;5</td><td>Devil&rsquo;s Duty</td><td>Devil&rsquo;s Duty</td></tr>
          <tr><td>1</td><td>Devil&rsquo;s Delight</td><td>Devil&rsquo;s Concern</td></tr>
        </tbody>
      </table>
      <p class="note">Three 1s <em>used</em> in a scene draws Fate&rsquo;s Folly; three 6s
      <em>used</em> opens the Devil&rsquo;s Door. Rolling them isn&rsquo;t enough &mdash; they
      have to be spent.</p>

      <h3>Temptation Die <small>(must be used immediately)</small></h3>
      <table>
        <tbody>
          <tr><td>3&ndash;6</td><td>Use your Drive successfully &middot; Something awesome happens</td></tr>
          <tr><td>1&ndash;2</td><td>Your Drive overtakes you &middot; Gain a Temptation card &middot; No more actions until packmate/s aid you</td></tr>
        </tbody>
      </table>

      <h3>Things All Dogs Can Do</h3>
      <dl>
        <template v-for="[name, text] in dogBasics" :key="name">
          <dt>{{ name }}</dt><dd>{{ text }}</dd>
        </template>
      </dl>

      <h3>Shadow</h3>
      <p>At 3 Temptation cards, gain 1 Shadow Rend. At 3 Shadow Rends you are Shadow Riven: the
      die pool for Best and Very Good is reduced by 1. Shadow Rends can be removed with Shards or
      certain Pact of the Pack cards.</p>
    </div>
  </details>
</template>

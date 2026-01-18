<script setup>
import { computed, onMounted } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';

const sheet = useSheetStore();

// Initialize deck on mount if empty
onMounted(() => {
  if (sheet.releaseMagicDeck.length === 0) {
    sheet.initializeReleaseDeck();
  }
});

// Summary text for collapsed state
const collapsedSummary = computed(() => {
  return `Hand: ${sheet.cardsInHand.length}/${sheet.handLimit} | Deck: ${sheet.cardsInDeck.length} | Discard: ${sheet.cardsInDiscard.length}`;
});

// Card colors based on triumvirate
const triumvirateStyles = {
  'Era of Royalty': { color: '#c62828', icon: '👑' },
  'Era of Heroism': { color: '#1565c0', icon: '⚔️' },
  'Era of Potential': { color: '#2e7d32', icon: '✨' },
  'The Chiaroscuro': { color: '#6a1b9a', icon: '🌙' },
  'The Collective Cycle': { color: '#f57c00', icon: '♻️' },
  'The Endless Battle': { color: '#5d4037', icon: '⚡' },
  'The Eternal Phase': { color: '#0277bd', icon: '🔮' },
  'The Arduous Judgment': { color: '#00695c', icon: '⚖️' },
  'The Dynamic Tale': { color: '#d81b60', icon: '❤️' }
};

// Get card style
const getCardStyle = (card) => {
  return triumvirateStyles[card.triumvirate] || { color: '#666', icon: '🃏' };
};

// Check if card is playable (in hand)
const isCardInHand = (card) => {
  return card.location === 'hand';
};

// Available cards for signature selection (excluding Love)
const availableSignatureCards = computed(() => {
  return sheet.releaseCardDefinitions.filter(c => c.id !== 'love');
});
</script>

<template>
  <NotchContainer class="release-magic-container" width="thick" notchType="curve">
    <h4>Release Magic</h4>
    <Collapsible
      class="release-magic-collapsible"
      :default="sheet.releaseMagicCollapsed"
      @collapse="sheet.releaseMagicCollapsed = !sheet.releaseMagicCollapsed"
    >
      <template v-slot:collapsed>
        <div class="release-magic-summary">
          <span class="summary-icon">🃏</span>
          <span class="summary-text">{{ collapsedSummary }}</span>
        </div>
      </template>
      <template v-slot:expanded>
        <div class="release-magic-header">
          <p class="release-magic-info">
            Card-based magic system. Draw Pool: {{ sheet.handLimit }} cards (3 + Rep Level)
          </p>
          <div class="scaling-value-display">
            <span class="sv-label">Scaling Value (X):</span>
            <span class="sv-value">{{ sheet.scalingValue }}</span>
            <span class="sv-detail">(max of Rep or MAM)</span>
          </div>
        </div>

        <!-- Signature Card Selection (Level 5+) -->
        <div v-if="sheet.level >= 5" class="signature-cards-section">
          <h5>Signature Cards</h5>
          <div class="signature-selection">
            <div class="signature-slot">
              <label>Level 5 Signature:</label>
              <select v-model="sheet.signatureCard1">
                <option value="">None</option>
                <option v-for="card in availableSignatureCards" :key="card.id" :value="card.id">
                  {{ card.name }}
                </option>
              </select>
            </div>
            <div v-if="sheet.level >= 10" class="signature-slot">
              <label>Level 10 Signature:</label>
              <select v-model="sheet.signatureCard2">
                <option value="">None</option>
                <option v-for="card in availableSignatureCards" :key="card.id" :value="card.id">
                  {{ card.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Deck Management -->
        <div class="deck-management">
          <div class="deck-stats">
            <div class="stat-item">
              <span class="stat-label">Hand:</span>
              <span class="stat-value">{{ sheet.cardsInHand.length }}/{{ sheet.handLimit }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Deck:</span>
              <span class="stat-value">{{ sheet.cardsInDeck.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Discard:</span>
              <span class="stat-value">{{ sheet.cardsInDiscard.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Removed:</span>
              <span class="stat-value">{{ sheet.cardsRemoved.length }}</span>
            </div>
          </div>
          <div class="deck-actions">
            <button
              class="deck-action-btn"
              @click="sheet.drawInitialHand()"
              :disabled="sheet.cardsInDeck.length === 0"
            >
              Draw Initial Hand
            </button>
            <button
              class="deck-action-btn"
              @click="sheet.drawReleaseCards(1)"
              :disabled="sheet.cardsInDeck.length === 0 || sheet.cardsInHand.length >= sheet.handLimit"
            >
              Draw Card
            </button>
            <button
              class="deck-action-btn"
              @click="sheet.resetReleaseDeck()"
              :disabled="sheet.cardsInDiscard.length === 0"
            >
              Reset Deck
            </button>
            <button
              class="deck-action-btn cycle-btn"
              @click="sheet.cycleReleaseSpellDeck()"
              :disabled="sheet.cardsInDeck.length > 0"
              title="Costs 2 Stress"
            >
              Cycle Deck (+2 Stress)
            </button>
          </div>
        </div>

        <!-- Card Display -->
        <div class="cards-section">
          <!-- Hand -->
          <div class="card-zone hand-zone">
            <h5>Hand</h5>
            <div class="cards-grid">
              <div
                v-for="card in sheet.cardsInHand"
                :key="card.id"
                class="card"
                :class="{ 'signature': (card.id === sheet.signatureCard1 || card.id === sheet.signatureCard2) }"
                :style="{ borderColor: getCardStyle(card).color }"
                @click="sheet.playReleaseCard(card.id)"
              >
                <div class="card-header">
                  <span class="card-icon">{{ getCardStyle(card).icon }}</span>
                  <span class="card-name">{{ card.name }}</span>
                </div>
                <div class="card-triumvirate" :style="{ color: getCardStyle(card).color }">
                  {{ card.triumvirate }}
                </div>
                <div class="card-effect">
                  {{ card.effect }}
                </div>
                <div class="card-tags">
                  <span v-if="card.isFateDie" class="tag fate-die">Fate Die</span>
                  <span v-if="card.isEphemeral" class="tag ephemeral">Ephemeral</span>
                </div>
                <button class="play-btn" :style="{ backgroundColor: getCardStyle(card).color }">
                  Play Card
                </button>
              </div>
            </div>
            <div v-if="sheet.cardsInHand.length === 0" class="empty-zone">
              No cards in hand
            </div>
          </div>

          <!-- All Cards Reference -->
          <details class="all-cards-reference">
            <summary>All Release Magic Cards (Reference)</summary>
            <div class="cards-grid reference-grid">
              <div
                v-for="card in sheet.releaseCardDefinitions"
                :key="card.id"
                class="card card-reference"
                :class="{
                  'in-deck': sheet.releaseMagicDeck.find(c => c.id === card.id)?.location === 'deck',
                  'in-hand': sheet.releaseMagicDeck.find(c => c.id === card.id)?.location === 'hand',
                  'in-discard': sheet.releaseMagicDeck.find(c => c.id === card.id)?.location === 'discard',
                  'removed': sheet.releaseMagicDeck.find(c => c.id === card.id)?.location === 'removed'
                }"
                :style="{ borderColor: getCardStyle(card).color }"
              >
                <div class="card-header">
                  <span class="card-icon">{{ getCardStyle(card).icon }}</span>
                  <span class="card-name">{{ card.name }}</span>
                </div>
                <div class="card-location-badge">
                  {{ sheet.releaseMagicDeck.find(c => c.id === card.id)?.location || 'deck' }}
                </div>
                <div class="card-triumvirate" :style="{ color: getCardStyle(card).color }">
                  {{ card.triumvirate }}
                </div>
                <div class="card-effect">
                  {{ card.effect }}
                </div>
                <div class="card-tags">
                  <span v-if="card.isFateDie" class="tag fate-die">Fate Die</span>
                  <span v-if="card.isEphemeral" class="tag ephemeral">Ephemeral</span>
                </div>
              </div>
            </div>
          </details>
        </div>

        <!-- Special Abilities Info -->
        <div class="special-abilities-info">
          <h5>Special Abilities</h5>
          <div class="ability-item">
            <strong>Discharge Energy:</strong> Bonus Action, discard top card for 30ft Weapon Attack (1d20 + DEX + Prof). Deals 1d6 + MAM Magical. At Level 5: +1d8. At Level 10: double MAM.
          </div>
          <div class="ability-item">
            <strong>Explosive Trinity:</strong> Full-Round, discard 3 matching Triumvirate or 3 Court Cards. Make 3 Magic Attacks (1d20 + MAM + Prof), 30ft, 3d6 + MAM each. Damage increases: 3d8 (5th), 3d10 (10th), 3d12 (15th).
          </div>
        </div>
      </template>
    </Collapsible>
  </NotchContainer>
</template>

<style lang="scss">
.release-magic-container {
  h4 {
    color: var(--header-blue);
    margin-bottom: var(--tiny-gap);
  }

  .release-magic-collapsible {
    min-height: 1.5em;
  }

  .release-magic-summary {
    display: flex;
    align-items: center;
    gap: var(--tiny-gap);
    padding: var(--tiny-gap) 0;

    .summary-icon {
      font-size: 1.2rem;
    }

    .summary-text {
      font-size: 0.9rem;
      color: var(--header-blue);
      font-weight: bold;
    }
  }

  .release-magic-header {
    margin-bottom: var(--half-gap);
  }

  .release-magic-info {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
    margin-bottom: var(--tiny-gap);
  }

  .scaling-value-display {
    display: flex;
    align-items: baseline;
    gap: var(--tiny-gap);
    padding: var(--tiny-gap);
    background: rgba(var(--header-blue-rgb, 33, 150, 243), 0.1);
    border-radius: 4px;
    margin-bottom: var(--half-gap);

    .sv-label {
      font-weight: bold;
      font-size: 0.9rem;
    }

    .sv-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--header-blue);
    }

    .sv-detail {
      font-size: 0.75rem;
      color: #666;
    }
  }

  .signature-cards-section {
    margin-bottom: var(--half-gap);
    padding: var(--half-gap);
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;

    h5 {
      margin-top: 0;
      margin-bottom: var(--tiny-gap);
      color: var(--header-blue);
      font-size: 0.9rem;
    }

    .signature-selection {
      display: flex;
      gap: var(--half-gap);
      flex-wrap: wrap;

      .signature-slot {
        display: flex;
        align-items: center;
        gap: var(--tiny-gap);

        label {
          font-size: 0.85rem;
          font-weight: bold;
        }

        select {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--borderColor);
          background: var(--masterBack);
          font-size: 0.85rem;
        }
      }
    }
  }

  .deck-management {
    margin-bottom: var(--half-gap);
    padding: var(--half-gap);
    border: 2px solid var(--borderColor);
    border-radius: 8px;

    .deck-stats {
      display: flex;
      gap: var(--half-gap);
      margin-bottom: var(--half-gap);
      flex-wrap: wrap;

      .stat-item {
        display: flex;
        align-items: baseline;
        gap: 4px;

        .stat-label {
          font-weight: bold;
          font-size: 0.85rem;
        }

        .stat-value {
          font-size: 1.1rem;
          color: var(--header-blue);
          font-weight: bold;
        }
      }
    }

    .deck-actions {
      display: flex;
      gap: var(--tiny-gap);
      flex-wrap: wrap;

      .deck-action-btn {
        padding: 6px 12px;
        border: 1px solid var(--borderColor);
        border-radius: 4px;
        background: var(--header-blue);
        color: white;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.85rem;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        &:disabled {
          background: #999;
          cursor: not-allowed;
          opacity: 0.6;
        }

        &.cycle-btn {
          background: #d32f2f;
        }
      }
    }
  }

  .cards-section {
    margin-bottom: var(--half-gap);

    .card-zone {
      margin-bottom: var(--half-gap);

      h5 {
        margin-top: 0;
        margin-bottom: var(--half-gap);
        color: var(--header-blue);
      }

      .empty-zone {
        padding: var(--half-gap);
        text-align: center;
        color: #666;
        font-style: italic;
        border: 2px dashed var(--borderColor);
        border-radius: 4px;
      }
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--half-gap);

    &.reference-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }

  .card {
    border: 2px solid;
    border-radius: 8px;
    padding: var(--half-gap);
    background: var(--masterBack);
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
    position: relative;

    &:not(.card-reference) {
      cursor: pointer;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }
    }

    &.signature {
      border-width: 3px;
      border-style: double;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
    }

    &.card-reference {
      opacity: 0.8;

      &.in-hand {
        background: rgba(76, 175, 80, 0.1);
      }

      &.in-discard {
        opacity: 0.5;
      }

      &.removed {
        opacity: 0.3;
        border-style: dashed;
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--tiny-gap);
      margin-bottom: var(--tiny-gap);

      .card-icon {
        font-size: 1.2rem;
      }

      .card-name {
        font-weight: bold;
        font-size: 0.95rem;
        flex: 1;
      }
    }

    .card-location-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.2);
      color: white;
      text-transform: uppercase;
      font-weight: bold;
    }

    .card-triumvirate {
      font-size: 0.7rem;
      font-weight: bold;
      margin-bottom: var(--tiny-gap);
      text-transform: uppercase;
    }

    .card-effect {
      font-size: 0.75rem;
      line-height: 1.3;
      margin-bottom: var(--tiny-gap);
      flex: 1;
      color: #333;
    }

    .card-tags {
      display: flex;
      gap: 4px;
      margin-bottom: var(--tiny-gap);
      flex-wrap: wrap;

      .tag {
        font-size: 0.65rem;
        padding: 2px 6px;
        border-radius: 3px;
        text-transform: uppercase;
        font-weight: bold;

        &.fate-die {
          background: #e3f2fd;
          color: #1976d2;
        }

        &.ephemeral {
          background: #fce4ec;
          color: #c2185b;
        }
      }
    }

    .play-btn {
      width: 100%;
      padding: 6px;
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .all-cards-reference {
    margin-top: var(--half-gap);

    summary {
      cursor: pointer;
      font-weight: bold;
      padding: var(--tiny-gap);
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin-bottom: var(--half-gap);

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }

  .special-abilities-info {
    margin-top: var(--half-gap);
    padding: var(--half-gap);
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;

    h5 {
      margin-top: 0;
      margin-bottom: var(--half-gap);
      color: var(--header-blue);
      font-size: 0.9rem;
    }

    .ability-item {
      font-size: 0.75rem;
      line-height: 1.4;
      margin-bottom: var(--tiny-gap);

      strong {
        color: var(--header-blue);
      }
    }
  }
}

html.dark {
  .release-magic-container {
    .release-magic-info,
    .scaling-value-display .sv-detail {
      color: #aaa;
    }

    .card {
      .card-effect {
        color: #ccc;
      }

      &.card-reference {
        &.in-hand {
          background: rgba(76, 175, 80, 0.2);
        }
      }
    }

    .signature-cards-section,
    .special-abilities-info {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>

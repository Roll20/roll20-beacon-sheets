<template>
    <div class="accordion-item" :class="{ 'weapon--offline': props.systemOffline || props.weapon.offline }">
        <div class="accordion-header attack attack__row age-ship-weapon-header">
            <div :class="'age-row-icon age-ship-weapon-' + (weapon.type || '').toLowerCase()"></div>
            <div>
                <span>{{ weapon.name }}</span>
                <span v-if="props.systemOffline" class="age-offline-badge">System Offline</span>
                <span v-else-if="weapon.offline" class="age-offline-badge">Offline</span>
            </div>
            <div class="age-ship-weapon-range">{{ weapon.range }}</div>
            <div style="display:grid;align-items:center;height:100%;">
                <button type="button" class="config-btn age-icon-btn" @click="onRollDamage"
                    :disabled="!weapon.damage || weapon.offline || props.systemOffline"
                    v-tippy="{ content: props.systemOffline ? 'System Offline' : weapon.offline ? 'Weapon Offline' : weapon.damage ? 'Roll ' + weapon.name + ' damage (' + weapon.damage + ')' : 'No damage formula set' }">
                    <font-awesome-icon :icon="['fa', 'dice']" />
                </button>
            </div>
            <div style="display:grid;align-items:center;height:100%;">
                <button type="button" class="config-btn age-icon-btn" @click="onPrintDetails"
                    v-tippy="{ content: 'Share ' + weapon.name + ' in chat' }">
                    <font-awesome-icon :icon="['fa', 'comment']" />
                </button>
            </div>
            <div style="display:grid;align-items:center;height:100%;">
                <button type="button" class="config-btn age-icon-btn" @click="$emit('edit', weapon)"
                    v-tippy="{ content: 'Edit ' + weapon.name }">
                    <font-awesome-icon :icon="['fa', 'gear']" />
                </button>
            </div>
            <button class="accordion-button collapsed" type="button"
                data-bs-toggle="collapse" :data-bs-target="'#collapseQuality-weapon-' + index"
                aria-expanded="false" :aria-controls="'collapseQuality-weapon-' + index">
            </button>
        </div>
        <div :id="'collapseQuality-weapon-' + index"
            class="accordion-collapse age-accordion-collapse collapsed collapse"
            data-bs-parent="#age-spell-accordion">
            <div class="accordion-body">
                <div class="age-quality-accordion">
                    <div class="age-weapon-details">
                        <span><strong>Type:</strong> {{ weapon.type || '—' }}</span>
                        <span><strong>Range:</strong> {{ weapon.range || '—' }}</span>
                        <span><strong>Damage:</strong> {{ weapon.damage || '—' }}</span>
                        <span><strong>Attacks/Round:</strong> {{ weapon.attacksPerRound || 1 }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import sendToChat from '@/utility/sendToChat';
import rollToChat from '@/utility/rollToChat';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useShipStore } from '@/sheet/stores/character/shipStore';

const props = defineProps({
    weapon:       { type: Object,  required: true  },
    type:         { type: String,  default: ''     },
    index:        { type: Number,  default: 0      },
    aim:          { type: Boolean, default: false  },
    aimValue:     { type: Number,  default: 0      },
    systemOffline:{ type: Boolean, default: false  },
});

defineEmits(['edit']);

async function onRollDamage() {
    const w = props.weapon;
    if (!w.damage || w.offline || props.systemOffline) return;
    const match = w.damage.match(/^(\d+)d(\d+)$/i);
    if (!match) return;
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const ship = useShipStore();
    const wsPenalty = ship.losses.weaponsSystem;
    const components = [
        { label: w.damage, sides, count, alwaysShowInBreakdown: true },
    ];
    if (wsPenalty > 0) {
        components.push({ label: 'Weapons System Loss', value: -wsPenalty });
    }
    await rollToChat({
        characterName: useMetaStore().name,
        title: w.name + ' Damage',
        subtitle: w.type ? w.type.charAt(0).toUpperCase() + w.type.slice(1) : 'Ship Weapon',
        rollType: 'damage',
        hideSuccessText: true,
        traits: [
            w.range ? `Range: ${w.range.charAt(0).toUpperCase() + w.range.slice(1)}` : null,
        ].filter(Boolean),
        components,
    });
}

async function onPrintDetails() {
    const w = props.weapon;
    await sendToChat({
        characterName: useMetaStore().name,
        title: w.name,
        subtitle: w.type ? w.type.charAt(0).toUpperCase() + w.type.slice(1) : 'Ship Weapon',
        traits: [
            w.range ? `Range: ${w.range.charAt(0).toUpperCase() + w.range.slice(1)}` : null,
            w.offline ? 'Offline' : null,
        ].filter(Boolean),
        keyValues: {
            'Damage':          w.damage          || '—',
            'Attacks / Round': w.attacksPerRound ?? 1,
        },
    });
}
</script>

<style scoped>
    .age-ship-weapon-header {
        display: grid;
        grid-template-columns: 40px 3fr 1fr 25px 25px 25px 40px;
        align-items: center;
        min-width: 100%;
        gap: 5px;
    }
    .age-row-icon {
        background: var(--theme-primary);
        height: 35px;
        width: 35px;
        place-self: flex-end;
        opacity: .75;
    }
    .weapon--offline {
        opacity: 0.45;
    }
    .weapon--offline .accordion-header {
        pointer-events: none;
    }
    .age-offline-badge {
        font-size: 0.7rem;
        background: #c0392b;
        color: #fff;
        padding: 1px 5px;
        border-radius: 3px;
        margin-left: 6px;
        font-weight: 600;
        vertical-align: middle;
    }
    .age-weapon-details {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 0.9rem;
    }
    .age-ship-weapon-range {
        text-transform: capitalize;
    }
</style>

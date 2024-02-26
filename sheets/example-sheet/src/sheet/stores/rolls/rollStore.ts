import { dispatchRef, initValues } from '@/relay/relay';
import { createRollTemplate, type SendToChatTemplate } from '@/rolltemplates/rolltemplates';
import type { Dispatch } from '@roll20/charsheet-relay-sdk';
import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

const rollOptions = reactive({ whisper: false, secret: false });
// const secretOption = rollOptions.secret ? true : false;

const whisperToGM = computed(() => {
  return rollOptions.whisper ? 'gm' : undefined;
});

export const useRollStore = defineStore('rolls', () => {
  const rollAbilityCheck = (ability: string, prof: boolean = false) => {};
  const sendToChat = async (args: SendToChatTemplate['parameters']) => {
    const { characterName, title, subtitle, keyValues, textContent } = args;
    const dispatch = dispatchRef.value as Dispatch;
    const rollTemplate = createRollTemplate({
      type: 'chat',
      parameters: {
        characterName,
        title,
        subtitle,
        keyValues,
        textContent,
      },
    });
    dispatch.post({
      characterId: initValues.character.id,
      content: rollTemplate,
      options: {
        whisper: whisperToGM.value,
      },
    });
  };

  return {
    sendToChat,
    rollOptions,
  };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BiographyHydrateSchema, type BiographyHydrate } from '@/schemas/hydrate/biography';
import { genericDehydrate, genericHydrate } from '@/utility/store';
import { reputation_formula } from '@/system/biography/reputation';

export const biographyStore = defineStore('biography', () => {
  const civilianName = ref('');
  const rank = ref(0);
  const role = ref('');
  const reputation = ref(reputation_formula);
  const karma = ref(0);
  const activeTeam = ref('');
  const gearClass = ref('');
  const resources = ref(0);
  const avatarColors = ref({
    avatarUrl: '',
    heroColor: '',
    heroColorSecondary: '',
    heroColorBlood: '',
  });
  const appearance = ref('');
  const disableBloodOverlay = ref(false);

  const personalDossier = ref({
    occupation: '',
    personality: '',
    drive: '',
    flaw: '',
    relationships: '',
  });

  const firebase = {
    civilianName,
    rank,
    role,
    reputation,
    karma,
    personalDossier,
    activeTeam,
    gearClass,
    resources,
    avatarColors,
    appearance,
    disableBloodOverlay
  };

  const dehydrate = (): BiographyHydrate => genericDehydrate(firebase, BiographyHydrateSchema);
  const hydrate = (snapshot: BiographyHydrate) => genericHydrate(snapshot, firebase, BiographyHydrateSchema);

  return {
    civilianName,
    rank,
    role,
    reputation,
    karma,
    personalDossier,
    activeTeam,
    gearClass,
    resources,
    avatarColors,
    appearance,
    disableBloodOverlay,
    firebase,
    dehydrate,
    hydrate,
  };
});

import { createRouter, createMemoryHistory } from 'vue-router';
import CharacterView from '../views/CharacterView.vue';
import ChallengeView from '../views/ChallengeView.vue';
import ConfigurationView from '../views/ConfigurationView.vue';

const router = createRouter({
  // @ts-ignore
	history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/configuration',
      name: 'configuration',
      component: ConfigurationView,
      alias: '/',
    },
    {
      path: '/character',
      name: 'character',
      component: CharacterView,
    },
    {
      path: '/challenge',
      name: 'challenge',
      component: ChallengeView,
    }
  ],
});
export default router;

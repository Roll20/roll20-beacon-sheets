import { createRouter, createMemoryHistory } from 'vue-router';
import CoreView from '../views/CoreView.vue';
import LocalSettingsView from '../views/LocalSettingsView.vue';
import SharedSettingsView from '../views/SharedSettingsView.vue';

const router = createRouter({
  
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/core',
      name: 'core',
      component: CoreView,
      alias: '/',
    },
    {
      path: '/local-settings',
      name: 'local-settings',
      component: LocalSettingsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SharedSettingsView,
    },
  ],
});
export default router;

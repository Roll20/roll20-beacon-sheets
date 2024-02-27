import { createRouter, createWebHistory } from 'vue-router';
import SheetView from '../views/SheetView.vue';
import SettingsView from '../views/SettingsView.vue';

const router = createRouter({
  // @ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/sheet',
      name: 'sheet',
      component: SheetView,
      alias: '/',
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
});
export default router;

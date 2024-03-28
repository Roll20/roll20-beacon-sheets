import { createRouter, createWebHistory } from 'vue-router';
import SheetView from '../views/SheetView.vue';
import SettingsView from '../views/SettingsView.vue';

/*
* Vue Router is used for switching between the 2 different views in the sheet.
* It's a good solution for when using tabs, character builder, settings page, etc.
* */
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

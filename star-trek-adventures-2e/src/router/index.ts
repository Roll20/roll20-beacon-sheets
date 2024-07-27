import { createRouter, createWebHistory } from 'vue-router';
import GMView from '../views/GMView.vue';


/*
 * Vue Router is used for switching between the 2 different views in the sheet.
 * It's a good solution for when using tabs, character builder, settings page, etc.
 * */
const router = createRouter({
  // @ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/gm',
      name: 'gm',
      component: GMView,
      alias: '/',
    },
  ],
});
export default router;

import { createRouter, createMemoryHistory } from 'vue-router';
import SheetContainer from '../views/SheetContainer.vue';

/*
 * Vue Router is used for switching between the 2 different views in the sheet.
 * It's a good solution for when using tabs, character builder, settings page, etc.
 * */
const router = createRouter({
  // @ts-ignore
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/sheet',
      name: 'sheet',
      component: SheetContainer,
      alias: '/',
    },
  ],
});
export default router;

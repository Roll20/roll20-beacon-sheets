import { createRouter, createWebHistory } from 'vue-router';
import CoreView from '@/views/CoreView.vue';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import SpellsView from '@/views/SpellsView.vue';
import NpcView from '@/views/NpcView.vue';
//import SettingsView from '../views/SettingsView.vue';

/*
 * Vue Router is used for switching between the 2 different views in the sheet.
 * It's a good solution for when using tabs, character builder, settings page, etc.
 * */

const router = createRouter({
  // @ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'root' }, 
    {
      path: '/core',
      name: 'core',
      component: CoreView,
      alias: '/core',
    },
    {
      path: '/spells',
      name: 'spells',
      component: SpellsView,
    },
    {
      path: '/npcs',
      name: 'npcs',
      component: NpcView,
    }
  ],
});

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    const store = useNpcStore();
    if (store.isNpc) {
      next('/npcs');
    } else {
      next('/core');
    }
  } else {
    next();
  }
});

export default router;

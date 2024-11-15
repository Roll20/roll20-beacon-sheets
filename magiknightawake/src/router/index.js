import { createRouter, createMemoryHistory } from 'vue-router';
import BasicView from '@/views/PC/BasicView.vue';
import NPCView from '@/views/NPCView.vue';
import KnightView from '@/views/PC/KnightView.vue';
import StudentView from '@/views/PC/StudentView.vue';
import BackgroundView from '@/views/PC/BackgroundView.vue';

const router = createRouter({
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'basic',
      component: BasicView
    },
    {
      path: '/student',
      name: 'student',
      component: StudentView,
    },
    {
      path: '/knight',
      name: 'knight',
      component: KnightView,
    },
    {
      path: '/background',
      name: 'background',
      component: BackgroundView,
    },
    {
      path: '/npc',
      name: 'npc',
      component: NPCView,
    }
  ],
});
router.push('/');
export default router;

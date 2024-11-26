import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';
import "bootstrap/dist/css/bootstrap.min.css"

import './sheet/scss/index.scss';
import 'tippy.js/dist/tippy.css'
import { createRelay } from './relay/relay';

import VueTippy from 'vue-tippy'
import "bootstrap"
// @ts-ignore
const env = import.meta.env.MODE || '';
// Determines if the offline mode dev relay should be used
const isDevEnvironment = ['development', 'test'].includes(env);
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faGear, 
         faSheetPlastic,   
         faDice, 
         faUser, 
         faCircleInfo,
         faMinus, 
         faPlus, 
         faTent, 
         faBed, 
         faRotate, 
         faComment, 
         faPen, 
         faEye, 
         faEyeSlash, 
         faBars,
         faSquarePlus,
         faSquareMinus,
        faCirclePlus,
        faCircleXmark,
        faKitMedical,
        faCampground,
        faTrash,
      faTrashAlt } from '@fortawesome/free-solid-svg-icons'
/* add icons to the library */
library.add(faGear,
          faSheetPlastic,   
          faDice, 
          faUser,
          faCircleInfo, 
          faMinus, 
          faPlus, 
          faTent, 
          faBed, 
          faRotate, 
          faComment, 
          faPen, 
          faEye, 
          faEyeSlash, 
          faBars,
          faSquarePlus,
          faSquareMinus,
          faCirclePlus,
          faCircleXmark,
          faKitMedical,
          faCampground,
          faTrash,
        faTrashAlt)

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';


const main = async () => {
  const pinia = createPinia();
  const i18n = createI18n({});
  const app = createApp(App);
  const { relayPinia, relayVue } = await createRelay({ devMode: isDevEnvironment });
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.use(pinia);
  app.use(router);
  app.use(i18n);
  app.use(relayVue);
  pinia.use(relayPinia);
  app.component('QuillEditor', QuillEditor)
  app.use(
    VueTippy,
    // optional
    {
      directive: 'tippy', // => v-tippy
      component: 'tippy', // => <tippy/>
      componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
      defaultProps: {
        placement: 'top',
        allowHTML: true,
      }, // => Global default options * see all props
    }
  )
  app.mount('#app');
};

main();

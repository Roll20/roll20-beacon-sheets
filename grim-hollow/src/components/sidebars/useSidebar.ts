import { has } from 'lodash';
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
const showSidebar = shallowRef(false);
const currentComponent = shallowRef<any>(null);
const currentProps = shallowRef<Record<string, any>>({});
const sidebarTitle = shallowRef('');
const hasSave = shallowRef(false);
const hasClose = shallowRef(false);
const hasDelete = shallowRef(false);
const hasAdd = shallowRef(false);
const addLabel = shallowRef('');
const hasSum = shallowRef(false);
const sumLabel = shallowRef('');
const hasSubtract = shallowRef(false);
const subtractLabel = shallowRef('');
const componentInstance = shallowRef<any>(null);

const getScrollbarWidth = () => {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // Forces scrollbar
    (outer.style as any).msOverflowStyle = 'scrollbar'; // For IE/Edge
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    if (outer.parentNode) {
      outer.parentNode.removeChild(outer);
    }

    return scrollbarWidth;
};

export function useSidebar() {

  function open(
    component: any,
    props: Record<string, any> = {},
    options: {
      title?: string;
      hasSave?: boolean;
      hasDelete?: boolean;
      hasAdd?: boolean;
      addLabel?: string;
      hasSum?: boolean;
      sumLabel?: string;
      hasSubtract?: boolean;
      subtractLabel?: string;
      hasClose?: boolean;
    } = {},
  ) {
    currentComponent.value = component;
    currentProps.value = props;
    sidebarTitle.value = options.title ?? '';
    hasSave.value = options.hasSave ?? false;
    hasClose.value = options.hasClose ?? false;
    hasDelete.value = options.hasDelete ?? false;
    hasAdd.value = options.hasAdd ?? false;
    addLabel.value = options.addLabel ?? '';
    hasSum.value = options.hasSum ?? false;
    sumLabel.value = options.sumLabel ?? '';
    hasSubtract.value = options.hasSubtract ?? false;
    subtractLabel.value = options.subtractLabel ?? '';  
    showSidebar.value = true;
    const hasVerticalScrollbar = window.innerWidth > document.documentElement.clientWidth;
    if(hasVerticalScrollbar) document.body.style.paddingRight = `${getScrollbarWidth()}px`;
  }

  function close() {
    showSidebar.value = false;
    currentComponent.value = null;
    currentProps.value = {};
    sidebarTitle.value = '';
    hasSave.value = false;
    hasClose.value = false;
    hasDelete.value = false;
    hasAdd.value = false;
    addLabel.value = '';
    componentInstance.value = null;
    document.body.style.paddingRight = `0`;
  }
  return {
    showSidebar,
    currentComponent,
    currentProps,
    sidebarTitle,
    hasSave,
    hasClose,
    hasDelete,
    componentInstance,
    hasAdd,
    addLabel,
    hasSum,
    sumLabel,
    hasSubtract,
    subtractLabel,
    open,
    close,
  };
}

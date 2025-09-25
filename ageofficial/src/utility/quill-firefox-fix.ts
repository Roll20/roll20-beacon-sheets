// quill-firefox-fix.js
import { Quill } from "@vueup/vue-quill";

export default {
  install(app: any) {
    if (!/firefox/i.test(navigator.userAgent)) {
      return // only patch Firefox
    }

    const Keyboard = Quill.import('modules/keyboard')

    // Save original bindings
    const defaultBindings = Keyboard.DEFAULTS.bindings

    // Add a custom backspace binding
    const fixedBindings = {
      ...defaultBindings,
      backspace: {
        key: 8, // Backspace
        handler(range: any, context: any) {
          const quill = context.quill;
          if (range && range.index > 0) {
            quill.deleteText(range.index - 1, 1, 'user');
          }
          return false; // prevent native FF behavior
        },
      },
    }

    // Override keyboard defaults globally
    Keyboard.DEFAULTS = {
      ...Keyboard.DEFAULTS,
      bindings: fixedBindings,
    }
  },
}

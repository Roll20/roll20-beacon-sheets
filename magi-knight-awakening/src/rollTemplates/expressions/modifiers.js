export function makeBEMModifiers(style, modifiers) {
  return modifiers.map((modifier) => `${style}--${modifier}`).join(' ');
}

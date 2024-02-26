export function makeBEMModifiers(style: string, modifiers: string[]): string {
  return modifiers.map((modifier) => `${style}--${modifier}`).join(" ");
}

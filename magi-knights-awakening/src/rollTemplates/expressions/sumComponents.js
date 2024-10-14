export const sumComponents = (components, multiplier = 1) =>
  components.reduce((sum, component) => sum + (component.value ?? 0), 0) * multiplier;

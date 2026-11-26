export const themeOf = (colorTheme) => (colorTheme === 'dark' ? 'dark' : 'light')

export const applyTheme = (
  colorTheme,
  root = typeof document === 'undefined' ? null : document.documentElement,
) => {
  if (root) root.dataset.theme = themeOf(colorTheme)
}

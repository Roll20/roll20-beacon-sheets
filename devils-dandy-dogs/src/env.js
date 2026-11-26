/*
 * Build-environment flag, isolated in its own module on purpose.
 *
 * `import.meta.env.DEV` is inlined by Vite at build time and cannot be flipped from inside a
 * vitest run, so reading it directly at a call site makes the "hidden in a production build"
 * case untestable — and an untested guard is an unproven one. This module is the seam: tests
 * `vi.mock('@/env.js')` and drive both branches.
 *
 * DEV is true on ANY vite dev server (`npm run dev`, and `npm run sandbox` at --mode staging)
 * and under vitest; it is false only for `vite build`, which is the sole artifact players
 * receive. Do NOT swap this for a MODE check — `main.js`'s ['development','test'] recipe reads
 * 'staging' in the sandbox and would strip dev tooling out of the environment the Roll20
 * acceptance walkthroughs run in.
 */
export const isDevBuild = () => import.meta.env.DEV

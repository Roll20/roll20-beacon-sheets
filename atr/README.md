# AtR Character Sheet

## Installation

Use Node.js 26.1.0 (as specified in `.tool-versions`), then run `npm install`
from this directory. The updated dependencies do not support the previous
Node.js 20.1.0 version.

## JSON Schema generation

Run `npm run schemas:generate` to generate draft-07 input schemas in
`generatedSchemas/` from the compendium Zod schemas. Run `npm run test:schemas`
to check that the generated schemas compile and match representative inputs.

Production builds use `/` as their base path by default. For CDN deployments,
set both `VITE_SHEET_PATH` (an absolute path or HTTP(S) URL) and
`VITE_SHEET_SHORT_NAME` before running the build.
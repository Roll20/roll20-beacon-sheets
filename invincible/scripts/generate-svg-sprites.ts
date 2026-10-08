import { writeFileSync, readdirSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

try {
  const inputDir = join(process.cwd(), 'src/sprites');
  const outputFile = join(inputDir, 'SvgSprites.vue');

  // Assure input directory exists
  if (!existsSync(inputDir)) {
    mkdirSync(inputDir, { recursive: true });
  }

  // Read files and compile symbols
  const files = readdirSync(inputDir);
  const symbols: string[] = [];

  for (const file of files) {
    if (!file.endsWith('.svg')) {
      continue;
    }

    const name = basename(file, '.svg');
    const filePath = join(inputDir, file);
    const content = readFileSync(filePath, 'utf-8');

    // Extract viewBox
    const viewBoxMatch = content.match(/viewBox=["']([^"']*)["']/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '';

    // Extract inner content of svg
    const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (!svgMatch) {
      console.warn(`[generate-svg-sprites] Warning: Could not parse SVG tag in ${file}`);
      continue;
    }

    const innerContent = svgMatch[1].trim();

    symbols.push(`  <symbol id="icon-${name}"${viewBox ? ` viewBox="${viewBox}"` : ''}>
    ${innerContent}
  </symbol>`);
  }

  const fileContent = `<template>
<svg style="display: none;">
${symbols.join('\n')}
</svg>
</template>
`;

  writeFileSync(outputFile, fileContent, 'utf-8');
  console.log(`[generate-svg-sprites] Generated SvgSprites.vue with ${symbols.length} symbols.`);
} catch (error) {
  console.error('[generate-svg-sprites] Error generating SVG spritesheet:', error);
  process.exit(1);
}

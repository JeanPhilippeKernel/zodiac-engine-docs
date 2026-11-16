import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { documentMetadata, homeSchema, releasesSchema, splitFrontmatter } from './src/lib/content';
import { legacyRoutes } from './src/navigation';

const docsRoot = resolve('docs');
function sourceFiles(directory = docsRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : entry.name.endsWith('.md') ? [path] : [];
  }).sort();
}

function documentation(): Plugin {
  const virtualId = '\0virtual:documentation';
  const searchId = '\0virtual:documentation-search';
  return {
    name: 'markdown-documentation',
    resolveId(id) {
      if (id === 'virtual:documentation') return virtualId;
      if (id === 'virtual:documentation-search') return searchId;
    },
    load(id) {
      if (id !== virtualId && id !== searchId) return;
      const documents = sourceFiles().map(path => {
        this.addWatchFile(path);
        return documentMetadata(relative(docsRoot, path), readFileSync(path, 'utf8'));
      });
      if (id === searchId) {
        const sections = Object.fromEntries(documents.map(document => [document.source, document.sections]));
        return `import { documents as metadata } from 'virtual:documentation'; const sections = ${JSON.stringify(sections)}; export const documents = metadata.map(document => ({ ...document, sections: sections[document.source] }));`;
      }
      const home = homeSchema.parse(splitFrontmatter(readFileSync(resolve(docsRoot, 'index.md'), 'utf8')).data);
      const releases = releasesSchema.parse(splitFrontmatter(readFileSync(resolve(docsRoot, 'project/releases.md'), 'utf8')).data);
      return `export const documents = ${JSON.stringify(documents.map(document => ({ ...document, sections: [] })))}; export const home = ${JSON.stringify(home)}; export const releases = ${JSON.stringify(releases)};`;
    },
    handleHotUpdate(context) {
      if (!context.file.startsWith(docsRoot)) return;
      for (const id of [virtualId, searchId]) {
        const module = context.server.moduleGraph.getModuleById(id);
        if (module) context.server.moduleGraph.invalidateModule(module);
      }
      context.server.ws.send({ type: 'full-reload' });
      return [];
    },
    generateBundle: { order: 'post', handler(_, bundle) {
      const index = bundle['index.html'];
      if (!index || index.type !== 'asset') throw new Error('Missing application HTML');
      for (const path of sourceFiles()) {
        const route = documentMetadata(relative(docsRoot, path), readFileSync(path, 'utf8')).route;
        if (route !== '/') this.emitFile({ type: 'asset', fileName: `${route.slice(1)}index.html`, source: index.source });
      }
      for (const route of Object.keys(legacyRoutes)) {
        this.emitFile({ type: 'asset', fileName: `${route.slice(1)}index.html`, source: index.source });
      }
      this.emitFile({ type: 'asset', fileName: '404.html', source: index.source });
      const origin = 'https://jeanphilippekernel.github.io';
      const base = process.env.VITE_BASE_PATH ?? '/zodiac-engine-docs/';
      const urls = sourceFiles().map(path => {
        const route = documentMetadata(relative(docsRoot, path), readFileSync(path, 'utf8')).route;
        return `<url><loc>${origin}${base}${route.slice(1)}</loc></url>`;
      });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>` });
    } },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/zodiac-engine-docs/',
  plugins: [react(), documentation()],
  build: { chunkSizeWarningLimit: 900 },
});

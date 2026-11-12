import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { documentMetadata, homeSchema, normalizeMarkdown, releasesSchema, resolveDocLink, routeForSource, searchDocuments, splitFrontmatter } from '../../src/lib/content';

describe('Markdown-backed documentation', () => {
  it('keeps legacy directory URLs, including nested indexes', () => {
    expect(routeForSource('index.md')).toBe('/');
    expect(routeForSource('editor/index.md')).toBe('/editor/');
    expect(routeForSource('design/future-plan/scene-serialization.md')).toBe('/design/future-plan/scene-serialization/');
  });

  it('resolves links against source paths and preserves fragments and queries', () => {
    const known = new Set(['/editor/', '/development/build-from-source/', '/project/releases/']);
    expect(resolveDocLink('../development/build-from-source.md#cmake-presets', 'editor/index.md', known)).toBe('/development/build-from-source/#cmake-presets');
    expect(resolveDocLink('releases.md?view=stable#zengine-100', 'project/roadmap.md', known)).toBe('/project/releases/?view=stable#zengine-100');
    expect(resolveDocLink('index.md', 'editor/scenes.md', known)).toBe('/editor/');
    expect(resolveDocLink('#next-step', 'editor/scenes.md', known)).toBe('#next-step');
    expect(resolveDocLink('https://example.com/a.md', 'editor/scenes.md', known)).toBe('https://example.com/a.md');
    expect(resolveDocLink('//example.com/a.md', 'editor/scenes.md', known)).toBe('//example.com/a.md');
  });

  it('sends links outside the documentation to the original repository instead of a broken SPA route', () => {
    expect(resolveDocLink('../../README.md#build', 'editor/scenes.md', new Set())).toBe('https://github.com/JeanPhilippeKernel/RendererEngine/blob/develop/README.md#build');
  });

  it('adapts Material wrappers and notices without changing fenced source code', () => {
    const source = '<div class="grid cards" markdown>\n[Editor](editor/index.md){ .md-button }\n</div>\n\n!!! note "Project setup"\n    Keep **project.json** managed by the Hub.\n\n```html\n<div markdown>{ .example }</div>\n:material-download:\n```\n';
    const result = normalizeMarkdown(source);
    expect(result).toContain('[Editor](editor/index.md)');
    expect(result).not.toContain('.md-button');
    expect(result).toContain('> **Project setup**');
    expect(result).toContain('> Keep **project.json** managed by the Hub.');
    expect(result).toContain('```html\n<div markdown>{ .example }</div>\n:material-download:\n```');
  });

  it('derives searchable text and unique heading anchors from Markdown, not code comments', () => {
    const metadata = documentMetadata('editor/scenes.md', '# Scene **authoring**\n\nBuild a world.\n\n## Asset `IDs`\n\nImport assets.\n\n## Asset `IDs`\n\n```cpp\n# Not a heading\n```\n');
    expect(metadata.title).toBe('Scene authoring');
    expect(metadata.headings.map(heading => heading.id)).toEqual(['scene-authoring', 'asset-ids', 'asset-ids-1']);
    expect(metadata.sections[2].text).toContain('# Not a heading');
  });

  it('finds multi-word content and ranks title matches ahead of body matches', () => {
    const body = documentMetadata('reference/index.md', '# Reference\n\n## GPU\n\nThe Vulkan pipeline uses assets.\n');
    const title = documentMetadata('reference/rendering.md', '# Vulkan pipeline\n\n## Rendering\n\nDraw worlds.\n');
    expect(searchDocuments([body, title], '  vulkan PIPELINE  ').map(result => result.document.title)).toEqual(['Vulkan pipeline', 'Reference']);
    expect(searchDocuments([body], 'assets missing')).toEqual([]);
    expect(searchDocuments([body], '  ')).toEqual([]);
    expect(searchDocuments([body], 'Vulkan')[0].section.id).toBe('gpu');
  });

  it('validates the homepage frontmatter and indexes its cards', () => {
    const source = readFileSync('docs/index.md', 'utf8');
    const parsed = homeSchema.parse(splitFrontmatter(source).data);
    expect(parsed.pathways.cards).toHaveLength(3);
    expect(parsed.ecosystem.cards).toHaveLength(2);
    expect(documentMetadata('index.md', source).title).toBe(parsed.title);
    expect(searchDocuments([documentMetadata('index.md', source)], 'Panzerfaust')).toHaveLength(1);
    expect(() => homeSchema.parse({ title: 'Incomplete' })).toThrow();
  });

  it('indexes release highlights at their own anchors while retaining changelog anchors', () => {
    const source = readFileSync('docs/project/releases.md', 'utf8');
    const release = releasesSchema.parse(splitFrontmatter(source).data);
    const metadata = documentMetadata('project/releases.md', source);
    for (const feature of release.features) {
      expect(metadata.headings.some(heading => heading.id === feature.id)).toBe(true);
      expect(searchDocuments([metadata], feature.title)[0].section.id).toBe(feature.id);
    }
    expect(metadata.headings.some(heading => heading.id === 'zengine-100')).toBe(true);
    expect(metadata.headings.some(heading => heading.id === 'breaking-change-vfs-backed-asset-import')).toBe(true);
  });

  it('rejects ambiguous release section IDs and invalid publication dates', () => {
    const release = releasesSchema.parse(splitFrontmatter(readFileSync('docs/project/releases.md', 'utf8')).data);
    expect(() => releasesSchema.parse({ ...release, date: '2026-02-30' })).toThrow();
    expect(() => releasesSchema.parse({ ...release, features: [release.features[0], release.features[0]] })).toThrow();
    expect(() => releasesSchema.parse({ ...release, features: [{ ...release.features[0], id: 'changelog' }] })).toThrow();
  });
});

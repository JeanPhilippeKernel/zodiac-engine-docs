import { parse } from 'yaml';
import { z } from 'zod';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import type { Nodes } from 'mdast';

const cardSchema = z.object({
  title: z.string(),
  description: z.string(),
  href: z.string(),
  link: z.string(),
  icon: z.enum(['download', 'monitor', 'code', 'book', 'box', 'cloud']),
  subtitle: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const homeSchema = z.object({
  version: z.string(),
  title: z.string(),
  description: z.string(),
  primary: z.object({ label: z.string(), href: z.string() }),
  secondary: z.object({ label: z.string(), href: z.string() }),
  pathways: z.object({ title: z.string(), description: z.string(), cards: z.array(cardSchema) }),
  ecosystem: z.object({ title: z.string(), description: z.string(), cards: z.array(cardSchema) }),
});

export type HomeData = z.infer<typeof homeSchema>;

const releaseLinkSchema = z.object({ label: z.string().min(1), href: z.string().min(1) });
export const releasesSchema = z.object({
  version: z.string().min(1),
  date: z.string().date(),
  navigation: z.array(releaseLinkSchema),
  hero: z.object({ eyebrow: z.string(), title: z.string(), description: z.string(), primary: releaseLinkSchema, secondary: releaseLinkSchema }),
  intro: z.object({ title: z.string(), description: z.string() }),
  facts: z.array(z.object({ value: z.string(), label: z.string() })),
  features: z.array(z.object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    bullets: z.array(z.string()),
    link: releaseLinkSchema,
    visual: z.enum(['rendering', 'core', 'assets', 'platforms']),
    nodes: z.array(z.string()).min(1),
    caption: z.string(),
  })).min(1),
  notice: z.object({ title: z.string(), description: z.string(), link: releaseLinkSchema }),
  changelog: z.object({ title: z.string(), description: z.string(), link: releaseLinkSchema }),
  download: z.object({ title: z.string(), description: z.string(), primary: releaseLinkSchema, secondary: releaseLinkSchema }),
}).superRefine((data, context) => {
  const ids = ['release-overview', 'changelog', ...data.features.map(feature => feature.id)];
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['features'], message: 'Release section IDs must be unique and must not use reserved anchors.' });
  }
});
export type ReleasesData = z.infer<typeof releasesSchema>;
export interface Heading { id: string; title: string; depth: number }
export interface SearchSection { id: string; title: string; text: string }
export interface DocumentMeta {
  source: string;
  route: string;
  title: string;
  description: string;
  headings: Heading[];
  sections: SearchSection[];
}

export function splitFrontmatter(source: string): { data: unknown; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  return match ? { data: parse(match[1]), body: source.slice(match[0].length) } : { data: {}, body: source };
}

// Material's markdown-enabled wrappers are presentation, not document content.
export function normalizeMarkdown(source: string): string {
  const lines = splitFrontmatter(source).body.split('\n');
  let fence: string | undefined;
  const output: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined;
      output.push(line);
      continue;
    }
    if (fence) { output.push(line); continue; }
    const notice = /^(!!!|\?\?\?)\s+(\w+)(?:\s+"([^"]+)")?\s*$/.exec(line);
    if (notice) {
      output.push(`> **${notice[3] ?? notice[2]}**`, '>');
      while (i + 1 < lines.length && (lines[i + 1].startsWith('    ') || lines[i + 1].trim() === '')) {
        const next = lines[++i];
        output.push(`> ${next.startsWith('    ') ? next.slice(4) : ''}`);
      }
      continue;
    }
    output.push(line
      .replace(/<\/?div\b[^>]*>/g, '')
      .replace(/\{\s*[.#][^}]*\}/g, '')
      .replace(/:material-[a-z0-9-]+:/g, ''));
  }
  return output.join('\n');
}

export function routeForSource(source: string): string {
  return '/' + source.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '/');
}

function textOf(node: Nodes): string {
  if ('value' in node && node.type !== 'html') return node.value;
  if ('children' in node) return node.children.map(textOf).join(node.type === 'heading' || node.type === 'paragraph' || node.type === 'strong' || node.type === 'emphasis' || node.type === 'link' ? '' : ' ');
  return '';
}

export function documentMetadata(source: string, markdown: string): DocumentMeta {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(normalizeMarkdown(markdown));
  const headings: Heading[] = [];
  const sections: SearchSection[] = [];
  const slugger = new GithubSlugger();
  let section: SearchSection = { id: '', title: '', text: '' };
  let title = '';
  let description = '';
  for (const node of tree.children) {
    if (node.type === 'heading') {
      const text = textOf(node);
      const id = slugger.slug(text);
      headings.push({ id, title: text, depth: node.depth });
      if (!title) title = text;
      if (section.text.trim()) sections.push(section);
      section = { id, title: text, text: '' };
    } else {
      const text = textOf(node).replace(/\s+/g, ' ').trim();
      section.text += text ? text + ' ' : '';
      if (!description && node.type === 'paragraph') description = text.slice(0, 220);
    }
  }
  if (section.text.trim()) sections.push(section);
  if (source === 'index.md') {
    const home = homeSchema.parse(splitFrontmatter(markdown).data);
    title = home.title;
    description = home.description;
    sections.unshift({ id: '', title, text: [home.description, home.pathways.description,
      ...home.pathways.cards.map(card => `${card.title} ${card.description}`),
      home.ecosystem.description, ...home.ecosystem.cards.map(card => `${card.title} ${card.description}`)].join(' ') });
  }
  if (source === 'project/releases.md') {
    const release = releasesSchema.parse(splitFrontmatter(markdown).data);
    description = release.hero.description;
    headings.unshift({ id: 'release-overview', title: release.intro.title, depth: 2 },
      ...release.features.map(feature => ({ id: feature.id, title: feature.title, depth: 2 })),
      { id: 'changelog', title: release.changelog.title, depth: 2 });
    sections.unshift({ id: 'release-overview', title: release.hero.title, text: `${release.hero.description} ${release.intro.title} ${release.intro.description}` },
      ...release.features.map(feature => ({ id: feature.id, title: feature.title, text: `${feature.eyebrow} ${feature.description} ${feature.bullets.join(' ')}` })));
  }
  return { source, route: routeForSource(source), title: title || source, description, headings, sections };
}

export function markdownLinks(markdown: string): string[] {
  const links: string[] = [];
  const tree = unified().use(remarkParse).use(remarkGfm).parse(normalizeMarkdown(markdown));
  visit(tree, 'link', node => { links.push(node.url); });
  return links;
}

export function resolveDocLink(href: string, source: string, knownRoutes: ReadonlySet<string>): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) || href.startsWith('#')) return href;
  const url = new URL(href, `https://documentation.invalid/docs/${source}`);
  const path = decodeURIComponent(url.pathname);
  if (path.startsWith('/docs/') && /\.md$/.test(path)) {
    const route = routeForSource(path.slice(6));
    if (knownRoutes.has(route)) return route + url.search + url.hash;
    return `https://github.com/JeanPhilippeKernel/RendererEngine/blob/develop${url.pathname}${url.hash}`;
  }
  if (!path.startsWith('/docs/') && /\.md$/.test(path)) {
    return `https://github.com/JeanPhilippeKernel/RendererEngine/blob/develop${url.pathname}${url.hash}`;
  }
  const route = path.replace(/^\/docs/, '').replace(/index\.html$/, '');
  if (knownRoutes.has(route)) return route + url.search + url.hash;
  return href;
}

export interface SearchResult { document: DocumentMeta; section: SearchSection; score: number }
export function searchDocuments(documents: DocumentMeta[], query: string): SearchResult[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return documents.flatMap(document => {
    let best: SearchResult | undefined;
    for (const section of document.sections) {
      const title = document.title.toLocaleLowerCase();
      const heading = section.title.toLocaleLowerCase();
      const text = section.text.toLocaleLowerCase();
      if (!terms.every(term => `${title} ${heading} ${text}`.includes(term))) continue;
      const score = terms.reduce((total, term) =>
        total + (title.includes(term) ? 12 : 0) + (heading.includes(term) ? 6 : 0) + (text.includes(term) ? 1 : 0), 0);
      if (!best || score > best.score) best = { document, section, score };
    }
    return best ? [best] : [];
  }).sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title)).slice(0, 20);
}

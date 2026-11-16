import type { DocumentMeta } from './lib/content';

export const legacyRoutes: Readonly<Record<string, string>> = {
  '/design/future-plan/editor-grid/': '/design/completed/editor-grid/',
  '/design/future-plan/gizmo-3d-pass/': '/design/completed/gizmo-3d-pass/',
  '/design/future-plan/thumbnail-generation/': '/design/completed/thumbnail-generation/',
};

export const groups = [
  { label: 'Getting started', prefix: 'getting-started/', icon: 'book', landing: '/getting-started/',
    order: ['index', 'install-with-zodiac-engine-hub', 'first-project', 'update-and-migration', 'supported-platforms'] },
  { label: 'Development', prefix: 'development/', icon: 'code', landing: '/development/',
    order: ['index', 'build-from-source', 'run-and-debug', 'project-configuration'] },
  { label: 'Reference', prefix: 'reference/', icon: 'book', landing: '/reference/',
    order: ['index', 'architecture', 'rendering', 'asset-pipeline', 'memory-management', 'zui', 'containers'] },
  { label: 'Project / Releases', prefix: 'project/', icon: 'box', landing: '/project/releases/',
    order: ['releases', 'roadmap', 'rfcs', 'archive', 'roadmap-legacy'] },
  { label: 'Design documents', prefix: 'design/', icon: 'layers', landing: '/design/', order: ['index', 'execution-plan', 'memory-budget'] },
  { label: 'Contributing', prefix: 'contributing/', icon: 'git', landing: '/contributing/',
    order: ['index', 'commit-conventions', 'release-process'] },
] as const;

export function groupDocuments(documents: DocumentMeta[], prefix: string, order: readonly string[]): DocumentMeta[] {
  return documents.filter(document => document.source.startsWith(prefix)).sort((a, b) => {
    const position = (source: string) => {
      const index = order.indexOf(source.slice(prefix.length).replace(/\.md$/, ''));
      return index < 0 ? order.length : index;
    };
    return position(a.source) - position(b.source) || a.title.localeCompare(b.title);
  });
}

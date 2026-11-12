import { ArrowDownToLine, ArrowRight, BookOpen, Box, Check, ChevronDown, ChevronRight, Cloud, Code2, FileText, GitPullRequest, House, Layers, Menu, Monitor, Moon, Search, Sun, X, type LucideProps } from 'lucide-react';

const icons = { download: ArrowDownToLine, arrow: ArrowRight, book: BookOpen, box: Box, check: Check,
  chevron: ChevronDown, right: ChevronRight, cloud: Cloud, code: Code2, file: FileText, git: GitPullRequest,
  home: House, layers: Layers, menu: Menu, monitor: Monitor, moon: Moon, search: Search, sun: Sun, close: X };
export type IconName = keyof typeof icons;
export function Icon({ name, ...props }: LucideProps & { name: IconName }) {
  const Component = icons[name];
  return <Component size={20} strokeWidth={1.7} aria-hidden="true" {...props} />;
}

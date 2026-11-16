import { isValidElement, lazy, Suspense, useState, type ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { Link } from 'react-router-dom';
import { documents } from 'virtual:documentation';
import { normalizeMarkdown, resolveDocLink } from '../lib/content';

const Mermaid = lazy(() => import('./Mermaid'));
const knownRoutes = new Set(documents.map(document => document.route));
const schema = {
  ...defaultSchema,
  attributes: { ...defaultSchema.attributes, code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./]] },
};

function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const [status, setStatus] = useState('Copy');
  async function copy(button: HTMLButtonElement) {
    const code = button.parentElement?.querySelector('code')?.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setStatus('Copied!');
    } catch (error) {
      console.error('Could not copy code', error);
      setStatus('Copy failed');
    }
  }
  return <div className="code-block"><button onClick={event => void copy(event.currentTarget)} aria-label="Copy code">{status}</button><pre {...props}>{children}</pre></div>;
}

export function Markdown({ body, source }: { body: string; source: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeSlug, rehypeHighlight]}
    components={{
      a: ({ href = '', children }) => {
        const target = resolveDocLink(href, source, knownRoutes);
        return target.startsWith('/') && !target.startsWith('//')
          ? <Link to={target}>{children}</Link>
          : <a href={target} rel={/^https?:/.test(target) ? 'noreferrer' : undefined}>{children}</a>;
      },
      img: ({ src, alt }) => {
        const url = new URL(src ?? '', `https://documentation.invalid/docs/${source}`);
        const resolved = url.origin === 'https://documentation.invalid'
          ? `${import.meta.env.BASE_URL}${url.pathname.slice(1)}` : src;
        return <img src={resolved} alt={alt ?? ''} loading="lazy" />;
      },
      pre: ({ children, node: _node, ...props }) => {
        if (isValidElement<{ className?: string; children?: React.ReactNode }>(children)
          && children.props.className?.includes('language-mermaid')) {
          return <Suspense fallback={<p role="status">Loading diagram…</p>}><Mermaid chart={String(children.props.children).trim()} /></Suspense>;
        }
        return <CodeBlock {...props}>{children}</CodeBlock>;
      },
      table: ({ children, node: _node, ...props }) => <div className="table-scroll"><table {...props}>{children}</table></div>,
    }}>{normalizeMarkdown(body)}</ReactMarkdown>;
}

import { Link } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { Icon } from '../components/Icon';
import { groups, groupDocuments } from '../navigation';
import { documents } from 'virtual:documentation';
import type { DocumentMeta } from '../lib/content';

export function Document({ document, body }: { document: DocumentMeta; body: string }) {
  const group = groups.find(group => document.source.startsWith(group.prefix));
  const siblings = group ? groupDocuments(documents, group.prefix, group.order) : [];
  const position = siblings.findIndex(sibling => sibling.route === document.route);
  const previous = siblings[position - 1];
  const next = siblings[position + 1];
  return <div className="document-layout">
    <article className="document-article">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Docs</Link><Icon name="right" size={13} />
        {group && <><Link to={group.landing}>{group.label}</Link><Icon name="right" size={13} /></>}
        <span>{document.title}</span></nav>
      <div className="document-meta"><span>DOCUMENTATION</span>
        <a href={`https://github.com/JeanPhilippeKernel/RendererEngine/edit/develop/docs/${document.source}`}>Edit source <Icon name="arrow" size={13} /></a></div>
      <div className="markdown"><Markdown body={body} source={document.source} /></div>
      <nav className="document-pagination" aria-label="Adjacent pages">
        {previous ? <Link to={previous.route}><small>← Previous</small><strong>{previous.title}</strong></Link> : <span />}
        {next && <Link to={next.route}><small>Next →</small><strong>{next.title}</strong></Link>}
      </nav>
    </article>
    {document.headings.length > 1 && <aside className="table-of-contents" aria-label="On this page">
      <p>On this page</p>
      {document.headings.filter(heading => heading.depth >= 2 && heading.depth <= 3).map(heading =>
        <a key={heading.id} className={heading.depth === 3 ? 'toc-nested' : ''} href={`#${heading.id}`}>{heading.title}</a>)}
      <Link to="/project/releases/" className="toc-release"><span className="status-dot" />ZEngine 1.0.0<small>View release notes →</small></Link>
    </aside>}
  </div>;
}

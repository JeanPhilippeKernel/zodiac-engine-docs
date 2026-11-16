import { Component, lazy, Suspense, useEffect, useRef, useState, type ErrorInfo, type PropsWithChildren } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { documents, home } from 'virtual:documentation';
import { Icon } from './components/Icon';
import { Home } from './pages/Home';
import { Document } from './pages/Document';
import { Releases } from './pages/Releases';
import { groups, groupDocuments, legacyRoutes } from './navigation';
import { splitFrontmatter } from './lib/content';

const sources = import.meta.glob<string>('../docs/**/*.md', { query: '?raw', import: 'default' });
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
const SearchDialog = lazy(() => import('./components/SearchDialog').then(module => ({ default: module.SearchDialog })));

class LoadingBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Documentation interface failed', error, info); }
  render() {
    return this.state.failed ? <div className="empty-page" role="alert"><h1>Unable to open documentation</h1>
      <p>A required part of the interface could not be loaded. Check your connection and reload.</p>
      <button className="button button-primary" onClick={() => window.location.reload()}>Reload page</button></div> : this.props.children;
  }
}

function Site() {
  const location = useLocation();
  const requestedRoute = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const route = legacyRoutes[requestedRoute] ?? requestedRoute;
  const current = documents.find(document => document.route === route);
  const [content, setContent] = useState<{ source: string; body: string }>();
  const [loadError, setLoadError] = useState<string>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string>();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light');
  const searchButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const mobileMenu = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('zodiac-theme', theme); }
    catch (error) { console.warn('Theme preference could not be saved', error); }
  }, [theme]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen(open => !open);
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    setExpanded(groups.find(group => current?.source.startsWith(group.prefix))?.prefix);
    document.title = current && route !== '/' ? `${current.title} · Zodiac Engine` : 'Zodiac Engine';
    document.querySelector('meta[name="description"]')?.setAttribute('content', route === '/' ? home.description : current?.description ?? 'Documentation page not found');
  }, [current, route]);
  useEffect(() => {
    let active = true;
    setLoadError(undefined);
    if (!current) return;
    const load = sources[`../docs/${current.source}`];
    if (!load) { setLoadError('The Markdown source for this page is missing.'); return; }
    load().then(body => {
      if (active) setContent({ source: current.source, body: splitFrontmatter(body).body });
    }).catch(error => {
      console.error('Documentation could not be loaded', error);
      if (active) setLoadError('This page could not be loaded. Check your connection and reload.');
    });
    return () => { active = false; };
  }, [current]);
  useEffect(() => {
    if (content?.source !== current?.source) return;
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        document.getElementById(id)?.scrollIntoView();
      } else {
        window.scrollTo({ top: 0 });
        main.current?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [content, current, location.key, location.hash]);
  useEffect(() => {
    if (!menuOpen) return;
    const navigation = sidebar.current;
    navigation?.querySelector<HTMLAnchorElement>('a')?.focus();
    function trap(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuOpen(false); mobileMenu.current?.focus(); }
      if (event.key !== 'Tab' || !navigation) return;
      const elements = [...navigation.querySelectorAll<HTMLElement>('a, button')];
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    window.addEventListener('keydown', trap);
    return () => window.removeEventListener('keydown', trap);
  }, [menuOpen]);

  function closeSearch() { setSearchOpen(false); searchButton.current?.focus(); }
  const ready = current && content?.source === current.source;
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="topbar">
      <button ref={mobileMenu} className="icon-button mobile-menu" aria-label="Toggle navigation" aria-expanded={menuOpen}
        aria-controls="sidebar" onClick={() => setMenuOpen(open => !open)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
      <Link className="brand" to="/"><img src={`${import.meta.env.BASE_URL}assets/brand.svg`} alt="" /><span>Zodiac Engine</span></Link>
      <button ref={searchButton} className="search-trigger" onClick={() => setSearchOpen(true)}>
        <Icon name="search" size={18} /><span>Search the documentation…</span><kbd>Ctrl</kbd><kbd>K</kbd></button>
      <div className="header-actions">
        <button className="icon-button theme-toggle" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
        <Link to="/project/releases/" className="version-link">v{home.version}<Icon name="chevron" size={14} /></Link>
      </div>
    </header>
    {menuOpen && <button className="navigation-overlay" onClick={() => { setMenuOpen(false); mobileMenu.current?.focus(); }} aria-label="Close navigation" />}
    <aside id="sidebar" ref={sidebar} className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Documentation navigation">
      <nav>
        <Link to="/" className={`nav-link ${route === '/' ? 'active' : ''}`} aria-current={route === '/' ? 'page' : undefined}
          onClick={() => setMenuOpen(false)}><Icon name="home" /><span>Accueil</span></Link>
        {groups.map(group => {
          const active = current?.source.startsWith(group.prefix);
          const open = expanded === group.prefix;
          return <div className={`nav-group ${group.prefix === 'design/' ? 'secondary-navigation' : ''}`} key={group.prefix}>
            <div className={`nav-row ${active ? 'selected-group' : ''}`}>
              <Link to={group.landing} className="nav-link" onClick={() => setMenuOpen(false)}
                aria-current={route === group.landing ? 'page' : undefined}><Icon name={group.icon} /><span>{group.label}</span></Link>
              <button aria-label={`${open ? 'Collapse' : 'Expand'} ${group.label}`} aria-expanded={open}
                className="nav-expand" onClick={() => setExpanded(open ? undefined : group.prefix)}><Icon name={open ? 'chevron' : 'right'} size={13} /></button>
            </div>
            {open && <div className="nav-children">{groupDocuments(documents, group.prefix, group.order).map(doc =>
              <Link key={doc.route} to={doc.route} className={doc.route === route ? 'active' : ''}
                aria-current={doc.route === route ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{doc.title}</Link>)}</div>}
          </div>;
        })}
      </nav>
      <div className="sidebar-footer"><span className="sidebar-caption">CREATE SOMETHING EXTRAORDINARY</span>
        <a href="https://github.com/JeanPhilippeKernel/RendererEngine"><Icon name="git" size={16} />GitHub<Icon name="arrow" size={13} /></a>
        <a href="https://discord.gg/jC3GPVKKsW"><Icon name="cloud" size={16} />Community<Icon name="arrow" size={13} /></a>
        <small>© 2026 Zodiac Engine contributors</small>
      </div>
    </aside>
    <main id="main-content" ref={main} tabIndex={-1}>
      {!current ? <div className="empty-page"><span className="release-badge">404</span><h1>Lost between worlds?</h1>
        <p>This documentation page does not exist.</p><Link className="button button-primary" to="/">Back to documentation<Icon name="arrow" /></Link></div>
        : loadError ? <div className="empty-page" role="alert"><h1>Unable to load this page</h1><p>{loadError}</p>
          <button className="button button-primary" onClick={() => window.location.reload()}>Reload page</button></div>
        : !ready ? <div className="page-loading" role="status">Loading documentation…</div>
        : route === '/' ? <Home body={content.body} />
        : route === '/project/releases/' ? <Releases body={content.body} />
        : <Document document={current} body={content.body} />}
      <footer className="site-footer"><span>Zodiac Engine <span className="footer-dot">·</span> Built for worlds worth creating.</span>
        <Link to="/contributing/">Contribute to the docs <Icon name="arrow" size={14} /></Link></footer>
    </main>
    {searchOpen && <Suspense fallback={<div className="search-loading" role="status">Loading search…</div>}><SearchDialog onClose={closeSearch} /></Suspense>}
  </div>;
}

export default function App() {
  return <LoadingBoundary><BrowserRouter basename={basename}><Site /></BrowserRouter></LoadingBoundary>;
}

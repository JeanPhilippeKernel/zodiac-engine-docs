import { type PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { releases } from 'virtual:documentation';
import { Icon } from '../components/Icon';
import { Markdown } from '../components/Markdown';
import type { ReleasesData } from '../lib/content';
import './releases.css';

function ReleaseLink({ href, className, children, current }: PropsWithChildren<{ href: string; className?: string; current?: boolean }>) {
  return (href.startsWith('/') && !href.startsWith('//')) || href.startsWith('#')
    ? <Link to={href} className={className} aria-current={current ? 'location' : undefined}>{children}</Link>
    : <a href={href} className={className}>{children}</a>;
}

function FeatureVisual({ feature }: { feature: ReleasesData['features'][number] }) {
  return <figure className={`release-visual visual-${feature.visual}`}>
    <div className="visual-window-bar"><span /><span /><span /><small>{feature.eyebrow}</small></div>
    {feature.visual === 'rendering' ? <div className="rendering-illustration">
      <svg viewBox="0 0 460 300" aria-hidden="true" fill="none">
        <path className="illustration-grid" d="m10 204 220-114 220 114M10 204h440M55 226 175-132 175 132M105 240 125-142 125 142M10 164l220 114 220-114" />
        <path className="wireframe-back" d="m230 26 112 64v128l-112 64-112-64V90l112-64Z" />
        <path className="wireframe-front" d="m118 90 112 65 112-65M230 155v127M230 26v128" />
        <path className="wireframe-detail" d="m146 74 112 64v96M174 58l112 64v96M202 42l112 64v96M118 122l112 65 112-65M118 154l112 65 112-65M118 186l112 65 112-65" />
        <circle cx="230" cy="155" r="6" className="illustration-point" />
      </svg>
      <div className="rendering-stages">{feature.nodes.map((node, index) =>
        <span key={node}>{index > 0 && <Icon name="right" size={12} />}<b>{node}</b></span>)}</div>
    </div> : feature.visual === 'core' ? <div className="core-illustration">
      <div className="core-center"><Icon name="box" size={35} /><span>ZEngine</span></div>
      <div className="core-nodes">{feature.nodes.map((node, index) =>
        <div key={node}><span className="node-number">0{index + 1}</span><Icon name={index === 0 ? 'layers' : index === 1 ? 'box' : 'code'} size={18} /><span>{node}</span><span className="node-status" /></div>)}</div>
    </div> : feature.visual === 'assets' ? <div className="assets-illustration">
      <div className="asset-files"><div><Icon name="box" size={29} /><small>mesh</small></div><div><Icon name="layers" size={29} /><small>texture</small></div><div><Icon name="file" size={29} /><small>material</small></div></div>
      <div className="asset-stages">{feature.nodes.map((node, index) =>
        <div key={node}>{index > 0 && <span className="asset-connector" />}<Icon name={index === 0 ? 'download' : index === 1 ? 'file' : 'box'} size={16} /><span>{node}</span></div>)}</div>
    </div> : <div className="platforms-illustration">
      {feature.nodes.map(node => <div key={node}><Icon name="monitor" size={35} /><strong>{node}</strong><span className="platform-line" /></div>)}
      <div className="platform-code"><Icon name="code" size={16} /><span>C++20</span><span>+</span><span>Vulkan</span></div>
    </div>}
    <figcaption>{feature.caption}</figcaption>
  </figure>;
}

export function Releases({ body }: { body: string }) {
  const { hash } = useLocation();
  const overviewAnchors = ['', '#release-overview', '#releases-and-changelog', '#release-title', ...releases.features.map(feature => `#${feature.id}`)];
  const activeSection = overviewAnchors.includes(hash) ? '#release-overview' : '#changelog';
  const notes = body.replace(/^#\s+[^\n]+\n+/, '');
  return <div className="releases-page" id="releases-and-changelog">
    <nav className="release-navigation" aria-label="Release navigation">
      <Link className="release-nav-brand" to="/project/releases/">ZEngine {releases.version}</Link>
      <div>{releases.navigation.map(item =>
        <ReleaseLink key={item.href} href={item.href}
          className={item.href === activeSection ? 'is-active' : undefined}
          current={item.href === activeSection}>
          <span>{item.label}</span>
          {!item.href.startsWith('#') && <Icon name="arrow" size={12} />}
        </ReleaseLink>)}</div>
    </nav>
    <section className="release-hero" aria-labelledby="release-title">
      <div className="release-hero-art" aria-hidden="true" />
      <div className="release-hero-content">
        <span className="release-eyebrow">{releases.hero.eyebrow}</span>
        <h1 id="release-title">{releases.hero.title}</h1>
        <p>{releases.hero.description}</p>
        <div className="release-hero-actions">
          <ReleaseLink className="button button-primary" href={releases.hero.primary.href}><Icon name="download" />{releases.hero.primary.label}</ReleaseLink>
          <ReleaseLink className="button release-outline" href={releases.hero.secondary.href}>{releases.hero.secondary.label}<Icon name="arrow" size={16} /></ReleaseLink>
        </div>
        <time dateTime={releases.date}>Released {new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${releases.date}T00:00:00Z`))}</time>
      </div>
      <a className="release-hero-scroll" href="#release-overview"><Icon name="chevron" size={18} /><span>Explore the release</span></a>
      <span className="release-art-credit">Concept artwork · Zodiac Engine</span>
    </section>
    <section className="release-intro release-section" id="release-overview" aria-labelledby="release-intro-title">
      <img className="release-symbol" src={`${import.meta.env.BASE_URL}assets/brand.svg`} alt="" />
      <span className="release-eyebrow">RELEASE HIGHLIGHTS</span>
      <h2 id="release-intro-title">{releases.intro.title}</h2><p>{releases.intro.description}</p>
      <div className="release-facts">{releases.facts.map(fact =>
        <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div>
      <div className="release-chapter-links">{releases.features.map((feature, index) =>
        <a key={feature.id} href={`#${feature.id}`}><small>0{index + 1}</small>{feature.eyebrow}<Icon name="chevron" size={13} /></a>)}</div>
    </section>
    {releases.features.map((feature, index) => <section id={feature.id} className={`release-feature release-section ${index % 2 ? 'feature-reversed' : ''}`} key={feature.id} aria-labelledby={`${feature.id}-title`}>
      <div className="release-feature-copy">
        <span className="release-eyebrow"><span>0{index + 1}</span>{feature.eyebrow}</span>
        <h2 id={`${feature.id}-title`}>{feature.title}</h2><p>{feature.description}</p>
        <ul>{feature.bullets.map(bullet => <li key={bullet}><Icon name="check" size={15} />{bullet}</li>)}</ul>
        <ReleaseLink className="release-text-link" href={feature.link.href}>{feature.link.label}<Icon name="arrow" size={16} /></ReleaseLink>
      </div>
      <FeatureVisual feature={feature} />
    </section>)}
    <aside className="release-notice" aria-label="Migration notice">
      <span className="release-notice-icon"><Icon name="file" size={23} /></span>
      <div><h2>{releases.notice.title}</h2><p>{releases.notice.description}</p></div>
      <ReleaseLink className="release-text-link" href={releases.notice.link.href}>{releases.notice.link.label}<Icon name="arrow" size={15} /></ReleaseLink>
    </aside>
    <section className="release-changelog release-section" id="changelog" aria-labelledby="changelog-title">
      <div className="release-changelog-heading"><div><span className="release-eyebrow">THE DETAILS</span>
        <h2 id="changelog-title">{releases.changelog.title}</h2><p>{releases.changelog.description}</p></div>
        <ReleaseLink className="button button-secondary" href={releases.changelog.link.href}>{releases.changelog.link.label}<Icon name="arrow" size={15} /></ReleaseLink>
      </div>
      <div className="release-notes-body markdown"><Markdown body={notes} source="project/releases.md" /></div>
    </section>
    <section className="release-download release-section" aria-labelledby="release-download-title">
      <h2 id="release-download-title">{releases.download.title}</h2><p>{releases.download.description}</p>
      <div><ReleaseLink className="button button-primary" href={releases.download.primary.href}><Icon name="download" />{releases.download.primary.label}</ReleaseLink>
        <ReleaseLink className="button button-secondary" href={releases.download.secondary.href}><Icon name="code" />{releases.download.secondary.label}</ReleaseLink></div>
    </section>
  </div>;
}

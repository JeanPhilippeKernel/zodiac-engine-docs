import { Link } from 'react-router-dom';
import { home } from 'virtual:documentation';
import { Icon } from '../components/Icon';
import { Markdown } from '../components/Markdown';

export function Home({ body }: { body: string }) {
  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-content">
        <Link to="/project/releases/" className="release-badge"><span />ZEngine {home.version}</Link>
        <h1 id="hero-title">{home.title}</h1>
        <p>{home.description}</p>
        <div className="hero-actions">
          <Link className="button button-primary" to={home.primary.href}><Icon name="download" />{home.primary.label}</Link>
          <Link className="button button-secondary" to={home.secondary.href}><Icon name="code" />{home.secondary.label}</Link>
        </div>
      </div>
    </section>
    <section className="home-section pathways" aria-labelledby="pathways-title">
      <div className="section-heading"><h2 id="pathways-title">{home.pathways.title}</h2><p>{home.pathways.description}</p></div>
      <div className="pathway-grid">{home.pathways.cards.map(card =>
        <Link to={card.href} className="pathway-card" key={card.title}>
          <span className="card-icon"><Icon name={card.icon} size={25} /></span>
          <h3>{card.title}</h3><p>{card.description}</p>
          <span className="card-link">{card.link}<Icon name="arrow" size={15} /></span>
        </Link>)}</div>
    </section>
    <section className="home-section ecosystem" aria-labelledby="ecosystem-title">
      <div className="section-heading"><h2 id="ecosystem-title">{home.ecosystem.title}</h2><p>{home.ecosystem.description}</p></div>
      <div className="ecosystem-grid">{home.ecosystem.cards.map(card =>
        <article className="ecosystem-card" key={card.title}>
          <div className="ecosystem-title"><span className="card-icon"><Icon name={card.icon} size={27} /></span>
            <div><h3>{card.title}</h3><small>{card.subtitle}</small></div></div>
          <p>{card.description}</p>
          <ul>{card.features?.map(feature => <li key={feature}><Icon name="check" size={14} />{feature}</li>)}</ul>
          <Link className="card-link" to={card.href}>{card.link}<Icon name="arrow" size={15} /></Link>
        </article>)}</div>
    </section>
    <section className="home-section home-more markdown"><Markdown body={body} source="index.md" /></section>
  </>;
}

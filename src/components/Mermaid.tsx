import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';

let queue = Promise.resolve();
export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `diagram-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [error, setError] = useState<string>();
  useEffect(() => {
    let active = true;
    const render = () => {
      queue = queue.then(async () => {
        if (!active) return;
        setError(undefined);
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict',
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
          suppressErrorRendering: true });
        try {
          const result = await mermaid.render(id, chart);
          if (active && ref.current) ref.current.innerHTML = result.svg;
        } catch (failure) {
          console.error('Diagram rendering failed', failure);
          if (active) setError('This diagram could not be rendered. Its source is shown below.');
        }
      });
    };
    render();
    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { active = false; observer.disconnect(); };
  }, [chart, id]);
  return error ? <div role="alert"><p>{error}</p><code>{chart}</code></div>
    : <div className="mermaid" ref={ref} role="img" aria-label="Documentation diagram" />;
}

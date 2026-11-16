import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documents } from 'virtual:documentation-search';
import { searchDocuments } from '../lib/content';
import { Icon } from './Icon';

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const results = searchDocuments(documents, query);
  useEffect(() => {
    dialog.current?.showModal();
    input.current?.focus();
    return () => dialog.current?.close();
  }, []);
  useEffect(() => {
    dialog.current?.querySelector(`#search-result-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }, [selected]);
  function open(index: number) {
    const result = results[index];
    if (!result) return;
    navigate(result.document.route + (result.section.id ? `#${result.section.id}` : ''));
    onClose();
  }
  return <dialog className="search-dialog" ref={dialog} onCancel={onClose} aria-label="Search documentation"
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="search-field">
      <Icon name="search" />
      <input ref={input} value={query} placeholder="Search the documentation…" aria-label="Search the documentation"
        role="combobox" aria-expanded={results.length > 0} aria-controls="search-results"
        aria-autocomplete="list" aria-activedescendant={results.length ? `search-result-${selected}` : undefined}
        onChange={event => { setQuery(event.target.value); setSelected(0); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected(current => Math.max(0, Math.min(results.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1))));
          }
          if (event.key === 'Enter') { event.preventDefault(); open(selected); }
        }} />
      <button className="icon-button" aria-label="Close search" onClick={onClose}><Icon name="close" /></button>
    </div>
    <div className="search-results" id="search-results" role="listbox" aria-label="Search results">
      {!query.trim() ? <p className="search-empty">Find your next step. Search guides, systems, and design documents.</p>
        : !results.length ? <p className="search-empty" role="status">No results for “{query}”. Try another term.</p>
        : results.map((result, index) => {
          const position = result.section.text.toLowerCase().indexOf(query.trim().split(/\s+/)[0].toLowerCase());
          const start = Math.max(0, position - 45);
          return <button key={result.document.source} id={`search-result-${index}`} role="option"
            aria-selected={selected === index} onClick={() => open(index)} onMouseEnter={() => setSelected(index)}>
            <Icon name="file" /><span><strong>{result.document.title}</strong><small>{result.section.title}</small>
              <p>{start > 0 ? '…' : ''}{result.section.text.slice(start, start + 155)}…</p></span><Icon name="arrow" />
          </button>;
        })}
    </div>
    <div className="search-footer"><span>↑ ↓ navigate</span><span>↵ open</span><span>esc close</span><span>{documents.length} documents</span></div>
  </dialog>;
}

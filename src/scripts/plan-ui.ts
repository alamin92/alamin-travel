// Shared browser code: detail switching and downloads for a plan.
import { buildDoc, docToHtml, docToText, type Plan, type Detail } from '../lib/planner';

function save(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function wirePlanView(root: HTMLElement, out: HTMLElement, getPlan: () => Plan | null, onSaved?: () => void) {
  let detail: Detail = 'medium';

  const render = () => {
    const plan = getPlan();
    if (!plan) return;
    out.innerHTML = docToHtml(buildDoc(plan, detail));
    root.querySelectorAll<HTMLElement>('[data-detail-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.detailBtn === detail)));
  };

  root.addEventListener('click', async (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-detail-btn],[data-dl]');
    if (!el) return;
    const plan = getPlan();
    if (!plan) return;
    if (el.dataset.detailBtn) {
      detail = el.dataset.detailBtn as Detail;
      render();
      return;
    }
    const base = `${plan.hub.id}-${plan.options.days}-${plan.options.days === 1 ? 'day' : 'days'}-plan`;
    const kind = el.dataset.dl;
    const blocks = buildDoc(plan, detail);
    if (kind === 'txt') {
      save(new Blob([docToText(blocks)], { type: 'text/plain;charset=utf-8' }), `${base}.txt`);
      onSaved?.();
    } else if (kind === 'docx') {
      const label = el.textContent;
      el.textContent = 'Preparing...';
      try {
        const { docToDocxBlob } = await import('../lib/plan-docx');
        save(await docToDocxBlob(blocks), `${base}.docx`);
        onSaved?.();
      } finally {
        el.textContent = label;
      }
    } else if (kind === 'print') {
      onSaved?.();
      window.print();
    }
  });

  return { render };
}

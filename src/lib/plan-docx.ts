// Builds an editable Word (.docx) file in the browser. Loaded on demand (dynamic import).
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from 'docx';
import type { Block, Inline } from './planner';

function runs(parts: Inline[], muted = false) {
  return parts.map((p) =>
    typeof p === 'string'
      ? new TextRun({ text: p, color: muted ? '5D6A63' : undefined })
      : new ExternalHyperlink({ link: p.url, children: [new TextRun({ text: p.text, color: '0563C1', underline: {} })] })
  );
}

export async function docToDocxBlob(blocks: Block[]): Promise<Blob> {
  const heading = { h1: HeadingLevel.HEADING_1, h2: HeadingLevel.HEADING_2, h3: HeadingLevel.HEADING_3 } as const;
  const children: Paragraph[] = [];
  for (const b of blocks) {
    if (b.t === 'p') children.push(new Paragraph({ spacing: { after: 100 }, children: runs(b.parts, b.cls === 'muted') }));
    else if (b.t === 'ul') for (const it of b.items) children.push(new Paragraph({ bullet: { level: 0 }, children: runs(it) }));
    else children.push(new Paragraph({ heading: heading[b.t], spacing: { before: b.t === 'h1' ? 0 : 240, after: 100 }, children: [new TextRun({ text: b.text })] }));
  }
  const doc = new Document({
    creator: 'travel.alaminh.com',
    title: 'Trip plan',
    sections: [{ children }],
  });
  return Packer.toBlob(doc);
}

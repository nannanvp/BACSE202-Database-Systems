import React from 'react';

export function renderInlineMarkup(text: string, depth = 0): React.ReactNode {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|<u>[^<]+<\/u>)/g;
  const parts = text.split(tokenRegex);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#1C1B18]">
          {depth < 2 ? renderInlineMarkup(part.slice(2, -2), depth + 1) : part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#2C2A25]">
          {depth < 2 ? renderInlineMarkup(part.slice(1, -1), depth + 1) : part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="font-mono text-[0.86em] bg-[#EAE4D7] text-[#1C1B18] px-1.5 py-0.5 rounded-[3px] border border-[#C5BEB0] break-words"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('<u>') && part.endsWith('</u>') && part.length > 7) {
      return (
        <span key={idx} className="underline decoration-[#E06D2B] decoration-2 underline-offset-3 font-semibold text-[#1C1B18]">
          {depth < 2 ? renderInlineMarkup(part.slice(3, -4), depth + 1) : part.slice(3, -4)}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  const cells = splitTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

export const MarkdownBlock: React.FC<{ content: string; className?: string }> = ({
  content,
  className = '',
}) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1; // skip closing fence
      blocks.push(
        <div key={blockKey++} className="rounded-[4px] border border-[#1C1B18] bg-[#1C1B18] overflow-hidden">
          {lang && (
            <div className="px-3.5 py-1 bg-[#2A2823] border-b border-[#3D3A33] text-[11px] font-mono text-[#EAE4D7]">
              {lang}
            </div>
          )}
          <pre className="font-mono text-xs text-[#FAF7F0] p-4 overflow-x-auto whitespace-pre leading-relaxed">
            {codeLines.join('\n')}
          </pre>
        </div>
      );
      continue;
    }

    // Markdown table
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = splitTableRow(trimmed);
      i += 2; // skip header & separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim() !== '') {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={blockKey++} className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px] tabular-nums">
            <thead>
              <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-[#1C1B18] font-mono">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="py-2.5 px-3.5 font-semibold whitespace-nowrap">
                    {renderInlineMarkup(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5BEB0] text-[#2C2A25]">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F4EFE4] step-hinge">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-2.5 px-3.5 align-top leading-relaxed ${
                        cIdx === 0 ? 'font-semibold text-[#1C1B18]' : ''
                      }`}
                    >
                      {renderInlineMarkup(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      blocks.push(
        <h5 key={blockKey++} className="text-xs sm:text-sm font-display font-bold text-[#1C1B18] pt-1">
          {renderInlineMarkup(trimmed.slice(5))}
        </h5>
      );
      i += 1;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={blockKey++} className="text-sm font-display font-bold text-[#1C1B18] pt-1">
          {renderInlineMarkup(trimmed.slice(4))}
        </h4>
      );
      i += 1;
      continue;
    }

    // Blockquote / formula specification callout
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push(
        <div
          key={blockKey++}
          className="rounded-[4px] border border-[#1C1B18] bg-[#EAE4D7]/80 px-4 py-3 text-xs sm:text-sm text-[#1C1B18] leading-relaxed space-y-1.5"
        >
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx} className="prose-measure">{renderInlineMarkup(ql)}</div>
          ))}
        </div>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: Array<{ indent: boolean; text: string }> = [];
      while (i < lines.length) {
        const cur = lines[i];
        const curTrim = cur.trim();
        if (!curTrim) break;
        if (/^[-*•]\s+/.test(curTrim)) {
          items.push({
            indent: /^\s{2,}/.test(cur),
            text: curTrim.replace(/^[-*•]\s+/, ''),
          });
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(
        <ul key={blockKey++} className="space-y-1.5 pl-5 list-disc text-sm text-[#2C2A25] leading-relaxed marker:text-[#6E695D] prose-measure">
          {items.map((item, idx) => (
            <li key={idx} className={item.indent ? 'ml-4 list-[circle]' : ''}>
              {renderInlineMarkup(item.text)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: Array<{ num: string; text: string }> = [];
      while (i < lines.length) {
        const curTrim = lines[i].trim();
        if (!curTrim) break;
        const m = curTrim.match(/^(\d+)[.)]\s+(.*)$/);
        if (m) {
          items.push({ num: m[1], text: m[2] });
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(
        <ol key={blockKey++} className="space-y-1.5 text-sm text-[#2C2A25] leading-relaxed prose-measure">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-baseline gap-2.5">
              <span className="font-mono text-xs font-semibold text-[#6E695D] shrink-0 tabular-nums">
                {item.num}.
              </span>
              <span>{renderInlineMarkup(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph (collect consecutive plain lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const curTrim = lines[i].trim();
      if (
        !curTrim ||
        curTrim.startsWith('```') ||
        curTrim.startsWith('### ') ||
        curTrim.startsWith('#### ') ||
        curTrim.startsWith('> ') ||
        /^[-*•]\s+/.test(curTrim) ||
        /^\d+[.)]\s+/.test(curTrim) ||
        (curTrim.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(curTrim);
      i += 1;
    }
    blocks.push(
      <p key={blockKey++} className="text-sm text-[#2C2A25] leading-relaxed prose-measure">
        {paraLines.map((pl, pIdx) => (
          <React.Fragment key={pIdx}>
            {pIdx > 0 && <br />}
            {renderInlineMarkup(pl)}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks}
    </div>
  );
};

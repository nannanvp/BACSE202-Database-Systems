import type { ModuleData } from '../data/bacse202Data';

export interface PrintDivisionColor {
  hex: string;
  name?: string;
  code?: string;
  hours?: number;
}

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export const DEFAULT_PRINT_DIVISION_COLORS: Record<ModuleId, PrintDivisionColor> = {
  m1: { hex: '#E5B82E', name: 'Chrome Yellow', code: 'M1', hours: 7 },
  m2: { hex: '#E06D2B', name: 'Oxide Orange', code: 'M2', hours: 10 },
  m3: { hex: '#4F8A3D', name: 'Grass Green', code: 'M3', hours: 9 },
  m4: { hex: '#147E7B', name: 'Teal', code: 'M4', hours: 10 },
  m5: { hex: '#22559C', name: 'Ultramarine', code: 'M5', hours: 7 },
};

const LIGHT_HEADER_TEXT: Record<ModuleId, boolean> = {
  m1: false,
  m2: false,
  m3: true,
  m4: true,
  m5: true,
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatCheatSheetDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function renderModuleSectionHtml(
  mod: ModuleData,
  divisionColors: Record<ModuleId, PrintDivisionColor>
): string {
  const accentHex = divisionColors[mod.id]?.hex ?? DEFAULT_PRINT_DIVISION_COLORS[mod.id].hex;
  const headerInk = LIGHT_HEADER_TEXT[mod.id] ? '#FAF7F0' : '#1C1B18';

  const formulasHtml = mod.keyFormulasAndRules
    .map(
      (rule) => `
      <div class="formula-row">
        <div class="formula-label">${escapeHtml(rule.label)}</div>
        <div class="formula-value">${escapeHtml(rule.value)}</div>
      </div>`
    )
    .join('');

  const tableHeadersHtml = mod.comparisonTable.headers
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join('');

  const tableRowsHtml = mod.comparisonTable.rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, idx) => `<td class="${idx === 0 ? 'col-key' : ''}">${escapeHtml(cell)}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const promptsHtml = mod.likelyFatQuestions
    .map(
      (prompt, idx) =>
        `<li><span class="q-idx">Q${idx + 1}.</span> ${escapeHtml(prompt)}</li>`
    )
    .join('');

  return `
    <section class="module-card" data-module="${mod.id}">
      <div class="module-header" style="background-color: ${accentHex}; color: ${headerInk};">
        <span class="module-title">MODULE ${mod.number} · ${escapeHtml(mod.title)}</span>
        <span class="module-hours">${mod.hours} HRS</span>
      </div>
      <div class="two-col">
        <div class="col-left">
          <div class="subhead">Key Formulas &amp; Rules</div>
          <div class="formula-list">${formulasHtml}</div>
          <div class="subhead prompts-head">Likely FAT Questions (Prompts Only)</div>
          <ol class="prompt-list">${promptsHtml}</ol>
        </div>
        <div class="col-right">
          <div class="subhead">${escapeHtml(mod.comparisonTable.title)}</div>
          <table class="cmp-table">
            <thead>
              <tr>${tableHeadersHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
}

export function buildCheatSheetPrintHtml(
  modules: ModuleData[],
  divisionColors: Record<ModuleId, PrintDivisionColor> = DEFAULT_PRINT_DIVISION_COLORS,
  now: Date = new Date()
): string {
  const formattedDate = formatCheatSheetDate(now);
  const page1Modules = modules.slice(0, 3);
  const page2Modules = modules.slice(3);

  const page1Html = page1Modules
    .map((m) => renderModuleSectionHtml(m, divisionColors))
    .join('\n');
  const page2Html = page2Modules
    .map((m) => renderModuleSectionHtml(m, divisionColors))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BACSE202 Database Systems — Quick Reference</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4 portrait;
      margin: 7mm 7mm 10mm 7mm;
      @bottom-left {
        content: "BACSE202 Database Systems — Quick Reference";
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 7.5pt;
        color: #55524B;
      }
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 7.5pt;
        font-weight: 700;
        color: #1C1B18;
      }
    }

    html, body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.24;
      color: #1C1B18;
      background: #FAF7F0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .screen-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 14px;
      background: #1C1B18;
      color: #FAF7F0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9pt;
    }

    .screen-toolbar button {
      background: #E5B82E;
      color: #1C1B18;
      border: 1px solid #FAF7F0;
      border-radius: 3px;
      padding: 4px 12px;
      font-weight: 700;
      font-size: 8.5pt;
      cursor: pointer;
    }

    .sheet-page {
      width: 210mm;
      margin: 10px auto;
      padding: 7mm;
      background: #FFFFFF;
      border: 1px solid #1C1B18;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sheet-page.page-break {
      page-break-before: always;
      break-before: page;
    }

    .doc-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 2px solid #1C1B18;
      padding-bottom: 4px;
      margin-bottom: 2px;
    }

    .doc-header h1 {
      font-size: 11.5pt;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #1C1B18;
    }

    .doc-meta {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      color: #434038;
      white-space: nowrap;
    }

    .module-card {
      border: 1px solid #1C1B18;
      border-radius: 3px;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
      background: #FFFFFF;
    }

    .module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 3.5px 7px;
      border-bottom: 1px solid #1C1B18;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .module-hours {
      font-size: 7.5pt;
      opacity: 0.9;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 5px 7px;
      align-items: start;
    }

    .subhead {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #1C1B18;
      border-bottom: 1px solid #C5BEB0;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }

    .prompts-head {
      margin-top: 5px;
    }

    .formula-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .formula-row {
      font-size: 8.5pt;
      line-height: 1.22;
    }

    .formula-label {
      font-weight: 700;
      color: #1C1B18;
      display: inline;
    }

    .formula-label::after {
      content: ": ";
    }

    .formula-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      color: #2C2A25;
      display: inline;
    }

    .prompt-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2.5px;
      font-size: 8.2pt;
      line-height: 1.22;
      color: #2C2A25;
    }

    .q-idx {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 800;
      color: #1C1B18;
    }

    .cmp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.8pt;
      line-height: 1.2;
    }

    .cmp-table th {
      text-align: left;
      background: #EAE4D7;
      color: #1C1B18;
      font-weight: 800;
      padding: 2.5px 4px;
      border: 0.75px solid #1C1B18;
    }

    .cmp-table td {
      padding: 2.5px 4px;
      border: 0.5px solid #C5BEB0;
      vertical-align: top;
      color: #2C2A25;
    }

    .cmp-table td.col-key {
      font-weight: 700;
      color: #1C1B18;
      white-space: nowrap;
    }

    .page-footer {
      margin-top: auto;
      padding-top: 4px;
      border-top: 1px solid #C5BEB0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5pt;
      color: #55524B;
    }

    .page-footer .page-num {
      font-weight: 800;
      color: #1C1B18;
    }

    @media print {
      html, body {
        background: #FFFFFF !important;
        font-size: 10pt;
      }

      .screen-toolbar {
        display: none !important;
      }

      .sheet-page {
        width: auto;
        margin: 0;
        padding: 0;
        border: none;
      }

      .sheet-page.page-break {
        page-break-before: always;
        break-before: page;
      }
    }
  </style>
</head>
<body>
  <div class="screen-toolbar" role="region" aria-label="Print toolbar">
    <span>BACSE202 Compact 2-Page Cheat Sheet · Ready to Print (A4 Portrait)</span>
    <button type="button" onclick="window.print()">Print Now</button>
  </div>

  <main class="sheet-page" data-page="1">
    <header class="doc-header">
      <h1>BACSE202 Database Systems — Quick Reference</h1>
      <div class="doc-meta">${escapeHtml(formattedDate)} · Modules 1–3</div>
    </header>
    ${page1Html}
    <footer class="page-footer">
      <span>BACSE202 Database Systems — Quick Reference · ${escapeHtml(formattedDate)}</span>
      <span class="page-num">Page 1 of 2</span>
    </footer>
  </main>

  <main class="sheet-page page-break" data-page="2">
    <header class="doc-header">
      <h1>BACSE202 Database Systems — Quick Reference</h1>
      <div class="doc-meta">${escapeHtml(formattedDate)} · Modules 4–5</div>
    </header>
    ${page2Html}
    <footer class="page-footer">
      <span>BACSE202 Database Systems — Quick Reference · ${escapeHtml(formattedDate)}</span>
      <span class="page-num">Page 2 of 2</span>
    </footer>
  </main>

  <script>
    window.__cheatSheetPrintTriggered = false;
    function triggerAutoPrint() {
      if (window.__cheatSheetPrintTriggered) return;
      window.__cheatSheetPrintTriggered = true;
      window.focus();
      window.print();
    }
    if (document.readyState === 'complete') {
      setTimeout(triggerAutoPrint, 120);
    } else {
      window.addEventListener('load', function () {
        setTimeout(triggerAutoPrint, 120);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Opens a new print-optimized window containing the 2-page cheat sheet HTML
 * and auto-triggers print after rendering. Falls back to a hidden same-origin
 * iframe if popups are blocked inside an embedded frame.
 */
export function openPrintableCheatSheet(
  modules: ModuleData[],
  divisionColors: Record<ModuleId, PrintDivisionColor> = DEFAULT_PRINT_DIVISION_COLORS,
  now: Date = new Date()
): { mode: 'window' | 'iframe' } {
  const html = buildCheatSheetPrintHtml(modules, divisionColors, now);

  const printWin = window.open('', '_blank', 'width=1024,height=820');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    return { mode: 'window' };
  }

  // Graceful fallback if popup blocker/sandboxed iframe blocks window.open
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  window.setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // Ignore restricted print errors
    }
    window.setTimeout(() => {
      iframe.remove();
    }, 1500);
  }, 250);

  return { mode: 'iframe' };
}

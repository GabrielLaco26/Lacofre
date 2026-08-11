const csvUtils = (() => {
  function parse(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];

      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
  }

  function normalizeHeader(value) {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  const HEADER_ALIASES = {
    date: ['data'],
    title: ['descricao', 'titulo', 'nome'],
    amount: ['valor'],
    type: ['tipo'],
    category: ['categoria'],
  };

  function buildColumnIndex(headerRow) {
    const normalized = headerRow.map(normalizeHeader);
    const index = {};
    Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
      const found = normalized.findIndex((h) => aliases.includes(h));
      if (found !== -1) index[key] = found;
    });
    return index;
  }

  function parseDate(raw) {
    const value = (raw || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, d, m, y] = brMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    return null;
  }

  function parseAmount(raw) {
    let value = (raw || '').trim().replace(/[^\d,.-]/g, '');
    if (!value) return null;

    const hasComma = value.includes(',');
    const hasDot = value.includes('.');

    if (hasComma && hasDot) {
      value =
        value.lastIndexOf(',') > value.lastIndexOf('.')
          ? value.replace(/\./g, '').replace(',', '.')
          : value.replace(/,/g, '');
    } else if (hasComma) {
      value = value.replace(',', '.');
    }

    const num = Math.abs(parseFloat(value));
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  function parseType(raw) {
    const value = normalizeHeader(raw || '');
    if (['entrada', 'receita', 'income', 'credito'].includes(value)) return 'entrada';
    if (['saida', 'despesa', 'expense', 'debito'].includes(value)) return 'saida';
    return null;
  }

  return { parse, buildColumnIndex, parseDate, parseAmount, parseType };
})();

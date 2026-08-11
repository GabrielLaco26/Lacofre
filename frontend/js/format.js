const CURRENCY_LOCALES = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
};

const format = (() => {
  let currency = 'BRL';

  function setCurrency(code) {
    currency = CURRENCY_LOCALES[code] ? code : 'BRL';
  }

  function money(value) {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency,
    }).format(value);
  }

  function date(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  function initials(name) {
    if (!name) return '--';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  return { setCurrency, money, date, initials };
})();

const categoriesManager = (() => {
  const LIST = [
    { value: 'Alimentação', emoji: '🍔', bg: 'rgba(251, 146, 60, 0.65)', border: '#f97316' },
    { value: 'Transporte', emoji: '🚗', bg: 'rgba(96, 165, 250, 0.65)', border: '#3b82f6' },
    { value: 'Moradia', emoji: '🏠', bg: 'rgba(167, 139, 250, 0.65)', border: '#8b5cf6' },
    { value: 'Saúde', emoji: '💊', bg: 'rgba(248, 113, 113, 0.65)', border: '#ef4444' },
    { value: 'Educação', emoji: '🎓', bg: 'rgba(234, 179, 8, 0.65)', border: '#eab308' },
    { value: 'Investimentos', emoji: '📈', bg: 'rgba(52, 211, 153, 0.65)', border: '#10b981' },
    { value: 'Cuidados Pessoais', emoji: '💇', bg: 'rgba(244, 114, 182, 0.65)', border: '#ec4899' },
    { value: 'Lazer', emoji: '🎬', bg: 'rgba(251, 191, 36, 0.65)', border: '#f59e0b' },
    { value: 'Salário', emoji: '💼', bg: 'rgba(129, 140, 248, 0.65)', border: '#6366f1' },
    { value: 'Outros', emoji: '📦', bg: 'rgba(148, 163, 184, 0.65)', border: '#64748b' },
  ];

  const FALLBACK = { emoji: '🏷️', bg: 'rgba(148, 163, 184, 0.65)', border: '#64748b' };

  const byName = new Map(LIST.map((c) => [c.value, c]));

  function meta(name) {
    return byName.get(name) || FALLBACK;
  }

  function label(name) {
    return `${meta(name).emoji} ${name || 'Outros'}`;
  }

  return { list: LIST, meta, label };
})();

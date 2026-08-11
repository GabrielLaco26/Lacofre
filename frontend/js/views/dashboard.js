window.dashboardView = (() => {
  const rangeInput = document.getElementById('date-range-input');
  const rangeClearBtn = document.getElementById('range-clear-btn');
  const customRangeEl = document.querySelector('.custom-range');
  const quickMonthBtn = document.getElementById('quick-filter-month');
  const quickYearBtn = document.getElementById('quick-filter-year');
  const totalEntradasEl = document.getElementById('total-entradas');
  const totalSaidasEl = document.getElementById('total-saidas');
  const saldoAtualEl = document.getElementById('saldo-atual');
  const summaryCanvas = document.getElementById('summary-chart');
  const summaryEmpty = document.getElementById('summary-chart-empty');
  const categoryCanvas = document.getElementById('category-chart');
  const categoryEmpty = document.getElementById('category-chart-empty');
  const categoryLegend = document.getElementById('category-legend');

  const SUMMARY_VALUE_ELS = [totalEntradasEl, totalSaidasEl, saldoAtualEl];

  let allTransactions = [];
  let customRange = null;
  let picker = null;
  let initialized = false;

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstOfYear = new Date(today.getFullYear(), 0, 1);
  const lastOfYear = new Date(today.getFullYear(), 11, 31);

  function toIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const monthRange = { start: toIso(firstOfMonth), end: toIso(lastOfMonth) };
  const yearRange = { start: toIso(firstOfYear), end: toIso(lastOfYear) };

  function withinPeriod(dateStr) {
    if (!customRange) return true;
    return dateStr >= customRange.start && dateStr <= customRange.end;
  }

  function showSkeleton() {
    SUMMARY_VALUE_ELS.forEach((el) => el.classList.add('skeleton', 'skeleton-text'));
  }

  function hideSkeleton() {
    SUMMARY_VALUE_ELS.forEach((el) => el.classList.remove('skeleton', 'skeleton-text'));
  }

  function draw() {
    const filtered = allTransactions.filter((t) => withinPeriod(t.date));

    const totalEntradas = filtered.filter((t) => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
    const totalSaidas = filtered.filter((t) => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
    const saldo = totalEntradas - totalSaidas;

    totalEntradasEl.textContent = format.money(totalEntradas);
    totalSaidasEl.textContent = format.money(totalSaidas);
    saldoAtualEl.textContent = format.money(saldo);
    saldoAtualEl.classList.toggle('positive', saldo >= 0);
    saldoAtualEl.classList.toggle('negative', saldo < 0);

    chartsManager.renderSummaryChart(summaryCanvas, summaryEmpty, { totalEntradas, totalSaidas });

    const categoryTotals = {};
    filtered
      .filter((t) => t.type === 'saida')
      .forEach((t) => {
        const cat = t.category || 'Outros';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
      });

    chartsManager.renderCategoryChart(categoryCanvas, categoryEmpty, categoryLegend, categoryTotals);
  }

  function updateQuickButtons() {
    const isMonth = customRange && customRange.start === monthRange.start && customRange.end === monthRange.end;
    const isYear = customRange && customRange.start === yearRange.start && customRange.end === yearRange.end;
    quickMonthBtn.classList.toggle('active', Boolean(isMonth));
    quickYearBtn.classList.toggle('active', Boolean(isYear));
  }

  function setRange(start, end) {
    customRange = { start, end };
    customRangeEl.classList.add('active');
    rangeClearBtn.hidden = false;
    updateQuickButtons();
    draw();
  }

  function clearRange() {
    customRange = null;
    customRangeEl.classList.remove('active');
    rangeClearBtn.hidden = true;
    updateQuickButtons();
    draw();
  }

  // Chart.js e Flatpickr só são baixados na primeira visita ao Dashboard —
  // as outras views (Transações/Perfil/Configurações) não precisam delas.
  async function ensureInit() {
    if (initialized) return;

    await Promise.all([
      scriptLoader.loadStyle('https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css'),
      scriptLoader.loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'),
      scriptLoader
        .loadScript('https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js')
        .then(() => scriptLoader.loadScript('https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/pt.js')),
    ]);

    picker = flatpickr(rangeInput, {
      mode: 'range',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      locale: 'pt',
      defaultDate: [firstOfMonth, today],
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          const [start, end] = selectedDates.sort((a, b) => a - b);
          setRange(toIso(start), toIso(end));
        }
      },
      onClose: (selectedDates) => {
        if (selectedDates.length === 1) {
          const iso = toIso(selectedDates[0]);
          setRange(iso, iso);
        }
      },
    });

    customRange = { start: toIso(firstOfMonth), end: toIso(today) };
    customRangeEl.classList.add('active');
    rangeClearBtn.hidden = false;
    updateQuickButtons();

    rangeClearBtn.addEventListener('click', () => {
      picker.clear();
      clearRange();
    });

    quickMonthBtn.addEventListener('click', () => {
      picker.setDate([firstOfMonth, lastOfMonth], true);
    });

    quickYearBtn.addEventListener('click', () => {
      picker.setDate([firstOfYear, lastOfYear], true);
    });

    initialized = true;
  }

  async function render() {
    try {
      await uiLoading.withDelayedSkeleton(
        async () => {
          await ensureInit();
          allTransactions = await api.getTransactions();
        },
        { onShow: showSkeleton, onHide: hideSkeleton }
      );
      draw();
    } catch (error) {
      hideSkeleton();
      console.error(error);
    }
  }

  document.addEventListener('transactions:changed', render);

  return { render };
})();

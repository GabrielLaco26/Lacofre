const chartsManager = (() => {
  let summaryChart;
  let categoryChart;

  function cssVar(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function cardBg() {
    return cssVar('--card-bg', '#ffffff');
  }

  function tooltipStyle() {
    return {
      backgroundColor: cardBg(),
      titleColor: cssVar('--text', '#1e293b'),
      bodyColor: cssVar('--text', '#1e293b'),
      borderColor: cssVar('--border', '#e2e8f0'),
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 4,
    };
  }

  function legendColor() {
    return cssVar('--text-muted', '#64748b');
  }

  function renderSummaryChart(canvas, emptyEl, totals) {
    const hasData = totals.totalEntradas > 0 || totals.totalSaidas > 0;
    canvas.style.display = hasData ? 'block' : 'none';
    emptyEl.style.display = hasData ? 'none' : 'block';
    if (!hasData) return;

    const data = {
      labels: ['Entradas', 'Saídas'],
      datasets: [
        {
          data: [totals.totalEntradas, totals.totalSaidas],
          backgroundColor: ['rgba(52, 211, 153, 0.65)', 'rgba(248, 113, 113, 0.65)'],
          borderColor: ['#10b981', '#ef4444'],
          borderWidth: 2,
          borderRadius: 8,
          spacing: 3,
        },
      ],
    };

    if (summaryChart) {
      summaryChart.data = data;
      summaryChart.options.plugins.tooltip = { ...summaryChart.options.plugins.tooltip, ...tooltipStyle() };
      summaryChart.options.plugins.legend.labels.color = legendColor();
      summaryChart.update();
      return;
    }

    summaryChart = new Chart(canvas, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: legendColor(), usePointStyle: true, padding: 16 } },
          tooltip: tooltipStyle(),
        },
      },
    });
  }

  function renderCategoryLegend(legendEl, entries) {
    if (!legendEl) return;
    legendEl.innerHTML = entries
      .map(([name]) => {
        const meta = categoriesManager.meta(name);
        return `
          <span class="legend-item">
            <span class="legend-dot" style="background:${meta.border}"></span>
            <span>${meta.emoji} ${name}</span>
          </span>
        `;
      })
      .join('');
  }

  function renderCategoryChart(canvas, emptyEl, legendEl, categoryTotals) {
    const entries = Object.entries(categoryTotals).filter(([, value]) => value > 0);
    canvas.style.display = entries.length ? 'block' : 'none';
    emptyEl.style.display = entries.length ? 'none' : 'block';

    if (!entries.length) {
      if (legendEl) legendEl.innerHTML = '';
      return;
    }

    renderCategoryLegend(legendEl, entries);

    const data = {
      labels: entries.map(([name]) => categoriesManager.label(name)),
      datasets: [
        {
          data: entries.map(([, value]) => value),
          backgroundColor: entries.map(([name]) => categoriesManager.meta(name).bg),
          borderColor: cardBg(),
          borderWidth: 2,
        },
      ],
    };

    if (categoryChart) {
      categoryChart.data = data;
      categoryChart.options.plugins.tooltip = { ...categoryChart.options.plugins.tooltip, ...tooltipStyle() };
      categoryChart.update();
      return;
    }

    categoryChart = new Chart(canvas, {
      type: 'pie',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: tooltipStyle(),
        },
      },
    });
  }

  document.addEventListener('themechange', () => {
    if (summaryChart) {
      summaryChart.options.plugins.legend.labels.color = legendColor();
      summaryChart.options.plugins.tooltip = { ...summaryChart.options.plugins.tooltip, ...tooltipStyle() };
      summaryChart.update();
    }
    if (categoryChart) {
      categoryChart.data.datasets[0].borderColor = cardBg();
      categoryChart.options.plugins.tooltip = { ...categoryChart.options.plugins.tooltip, ...tooltipStyle() };
      categoryChart.update();
    }
  });

  return { renderSummaryChart, renderCategoryChart };
})();

window.transactionsView = (() => {
  const tbody = document.getElementById('transactions-body');
  const pagination = document.getElementById('pagination');
  const exportBtn = document.getElementById('export-csv-btn');
  const importBtn = document.getElementById('import-csv-btn');
  const importInput = document.getElementById('import-csv-input');

  const PAGE_SIZE = 8;
  let allTransactions = [];
  let currentPage = 1;

  function skeletonRow() {
    return `
      <tr class="skeleton-row">
        <td><span class="skeleton skeleton-text" style="width:70%"></span></td>
        <td><span class="skeleton skeleton-text" style="width:55%"></span></td>
        <td><span class="skeleton skeleton-text" style="width:60px"></span></td>
        <td><span class="skeleton skeleton-text" style="width:70px"></span></td>
        <td class="align-right"><span class="skeleton skeleton-text" style="width:80px"></span></td>
        <td></td>
      </tr>
    `;
  }

  function showSkeletonRows() {
    tbody.innerHTML = Array.from({ length: 5 }, skeletonRow).join('');
    pagination.innerHTML = '';
  }

  function renderRows() {
    if (allTransactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma transação registrada ainda.</td></tr>';
      pagination.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(allTransactions.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allTransactions.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageItems
      .map(
        (t) => `
        <tr data-id="${t.id}">
          <td>${escapeHtml(t.title)}</td>
          <td>${escapeHtml(categoriesManager.label(t.category || 'Outros'))}</td>
          <td><span class="badge ${t.type}">${t.type === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
          <td>${format.date(t.date)}</td>
          <td class="align-right amount-cell ${t.type}">${t.type === 'saida' ? '-' : ''}${format.money(t.amount)}</td>
          <td class="align-center">
            <div class="actions-cell">
              <button class="icon-btn edit-btn" aria-label="Editar" data-id="${t.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              </button>
              <button class="btn-danger-outline delete-btn" data-id="${t.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `
      )
      .join('');

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = `<button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= totalPages; i += 1) {
      html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    html += `<button data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
    pagination.innerHTML = html;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function exportCsv() {
    const header = 'Título,Categoria,Tipo,Data,Valor\n';
    const rows = allTransactions
      .map((t) => [t.title, t.category || 'Outros', t.type, t.date, t.amount].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lacofre-transacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  pagination.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    currentPage = Number(btn.dataset.page);
    renderRows();
  });

  tbody.addEventListener('click', async (event) => {
    const editBtn = event.target.closest('.edit-btn');
    const deleteBtn = event.target.closest('.delete-btn');

    if (editBtn) {
      const transaction = allTransactions.find((t) => String(t.id) === editBtn.dataset.id);
      if (transaction) transactionModal.openForEdit(transaction);
      return;
    }

    if (deleteBtn) {
      if (!confirm('Excluir esta transação?')) return;
      uiLoading.setButtonLoading(deleteBtn, true, 'Excluindo...');
      try {
        await api.deleteTransaction(deleteBtn.dataset.id);
        document.dispatchEvent(new CustomEvent('transactions:changed'));
        toast.success('Transação excluída.');
      } catch (error) {
        uiLoading.setButtonLoading(deleteBtn, false);
        toast.error(error.message);
      }
    }
  });

  async function importCsv(file) {
    const text = await file.text();
    const rows = csvUtils.parse(text);

    if (rows.length < 2) {
      toast.error('Arquivo CSV vazio ou inválido.');
      return;
    }

    const columnIndex = csvUtils.buildColumnIndex(rows[0]);
    const required = ['date', 'title', 'amount', 'type'];
    if (required.some((key) => columnIndex[key] === undefined)) {
      toast.error('O CSV precisa ter as colunas Data, Descrição, Valor e Tipo.');
      return;
    }

    let success = 0;
    let failed = 0;

    for (const row of rows.slice(1)) {
      const date = csvUtils.parseDate(row[columnIndex.date]);
      const title = (row[columnIndex.title] || '').trim();
      const amount = csvUtils.parseAmount(row[columnIndex.amount]);
      const type = csvUtils.parseType(row[columnIndex.type]);
      const category = columnIndex.category !== undefined ? (row[columnIndex.category] || '').trim() : '';

      if (!date || !title || !amount || !type) {
        failed += 1;
        continue;
      }

      try {
        await api.createTransaction({ title, amount, type, date, category: category || 'Outros' });
        success += 1;
      } catch {
        failed += 1;
      }
    }

    document.dispatchEvent(new CustomEvent('transactions:changed'));

    if (success > 0 && failed === 0) {
      toast.success(`${success} transações importadas com sucesso.`);
    } else if (success > 0) {
      toast.info(`${success} importadas, ${failed} ignoradas por dados inválidos.`);
    } else {
      toast.error('Nenhuma transação pôde ser importada. Verifique as colunas do arquivo.');
    }
  }

  importBtn.addEventListener('click', () => importInput.click());

  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    importInput.value = '';
    if (!file) return;
    uiLoading.setButtonLoading(importBtn, true, 'Importando...');
    try {
      await importCsv(file);
    } catch (error) {
      toast.error('Não foi possível ler o arquivo CSV.');
    } finally {
      uiLoading.setButtonLoading(importBtn, false);
    }
  });

  exportBtn.addEventListener('click', exportCsv);

  async function render() {
    try {
      await uiLoading.withDelayedSkeleton(
        async () => {
          allTransactions = await api.getTransactions();
        },
        { onShow: showSkeletonRows }
      );
      renderRows();
    } catch (error) {
      console.error(error);
    }
  }

  document.addEventListener('transactions:changed', render);

  return { render };
})();

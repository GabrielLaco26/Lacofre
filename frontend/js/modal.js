const transactionModal = (() => {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('transaction-form');
  const idInput = document.getElementById('transaction-id');
  const titleInput = document.getElementById('tx-title');
  const amountInput = document.getElementById('tx-amount');
  const dateInput = document.getElementById('tx-date');
  const categorySelect = document.getElementById('tx-category');
  const submitBtn = document.getElementById('modal-submit-btn');
  const errorEl = document.getElementById('modal-error');
  const typeButtons = document.querySelectorAll('.type-toggle-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const openBtn = document.getElementById('open-modal-btn');

  let selectedType = null;

  function setType(type) {
    selectedType = type;
    typeButtons.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.type === type);
    });
  }

  function resetForm() {
    form.reset();
    idInput.value = '';
    setType(null);
    dateInput.value = new Date().toISOString().slice(0, 10);
    errorEl.textContent = '';
  }

  function open() {
    overlay.classList.remove('closing');
    overlay.hidden = false;
  }

  function close() {
    if (overlay.hidden || overlay.classList.contains('closing')) return;

    const modalEl = overlay.querySelector('.modal');
    overlay.classList.add('closing');

    const finish = () => {
      overlay.hidden = true;
      overlay.classList.remove('closing');
      modalEl.removeEventListener('animationend', finish);
    };
    modalEl.addEventListener('animationend', finish);
  }

  function openForCreate() {
    resetForm();
    title.textContent = 'Nova Transação';
    submitBtn.textContent = 'Adicionar Transação';
    setType('entrada');
    open();
  }

  function openForEdit(transaction) {
    resetForm();
    title.textContent = 'Editar Transação';
    submitBtn.textContent = 'Salvar Alterações';
    idInput.value = transaction.id;
    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    categorySelect.value = transaction.category || 'Outros';
    setType(transaction.type);
    open();
  }

  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => setType(btn.dataset.type));
  });

  closeBtn.addEventListener('click', close);
  openBtn.addEventListener('click', openForCreate);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';

    if (!selectedType) {
      errorEl.textContent = 'Selecione o tipo da transação (Entrada ou Saída).';
      return;
    }

    const payload = {
      title: titleInput.value.trim(),
      amount: parseFloat(amountInput.value),
      type: selectedType,
      date: dateInput.value,
      category: categorySelect.value,
    };

    const isEdit = Boolean(idInput.value);
    uiLoading.setButtonLoading(submitBtn, true, isEdit ? 'Salvando...' : 'Adicionando...');

    try {
      if (isEdit) {
        await api.updateTransaction(idInput.value, payload);
      } else {
        await api.createTransaction(payload);
      }
      close();
      document.dispatchEvent(new CustomEvent('transactions:changed'));
      toast.success(isEdit ? 'Transação atualizada com sucesso.' : 'Transação adicionada com sucesso.');
    } catch (error) {
      errorEl.textContent = error.message;
    } finally {
      uiLoading.setButtonLoading(submitBtn, false);
    }
  });

  return { openForCreate, openForEdit, close };
})();

const api = (() => {
  async function request(method, url, body) {
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error((data && data.error) || 'Erro inesperado.');
      error.status = response.status;
      throw error;
    }

    return data;
  }

  return {
    register: (payload) => request('POST', '/api/auth/register', payload),
    login: (payload) => request('POST', '/api/auth/login', payload),
    logout: () => request('POST', '/api/auth/logout'),
    me: () => request('GET', '/api/auth/me'),
    updateProfile: (payload) => request('PUT', '/api/users/me', payload),

    getTransactions: () => request('GET', '/api/transactions'),
    createTransaction: (payload) => request('POST', '/api/transactions', payload),
    updateTransaction: (id, payload) => request('PUT', `/api/transactions/${id}`, payload),
    deleteTransaction: (id) => request('DELETE', `/api/transactions/${id}`),
  };
})();

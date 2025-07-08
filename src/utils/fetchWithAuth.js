export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token_sk');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token_sk');
    window.location.href = '/login';
    return;
  }

  return response;
}

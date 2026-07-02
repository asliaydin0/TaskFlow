const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error('API health check failed');
  }

  return response.json();
}

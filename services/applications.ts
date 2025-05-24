import { api } from '../lib/api';

export async function fetchUserApplicationStats() {
  const response = await api.get('/user/application-stats');
  return response.data;
}

import { transformBackendAccidentDetails } from '@/utils/zdarzenieTransformer';
import { fetchAccidentDetailsFromBackend } from '@/modules/accidents/infrastructure/backend-api';

export async function getAccidentDetails(id: number) {
  const remote = await fetchAccidentDetailsFromBackend(id);
  return remote ? transformBackendAccidentDetails(remote) : null;
}

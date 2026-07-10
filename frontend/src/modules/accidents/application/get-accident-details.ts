import { transformZdarzenieDetails } from '@/utils/zdarzenieTransformer';
import { fetchAccidentDetailsFromApi } from '@/modules/accidents/infrastructure/accident-details-api';
import { loadAccidentDetailsCache } from '@/modules/accidents/infrastructure/accident-files';

export async function getAccidentDetails(id: number) {
  const detailsCache = await loadAccidentDetailsCache();
  const cached = detailsCache[String(id)];

  if (cached) {
    return transformZdarzenieDetails(cached);
  }

  const remote = await fetchAccidentDetailsFromApi(id);
  return remote ? transformZdarzenieDetails(remote) : null;
}

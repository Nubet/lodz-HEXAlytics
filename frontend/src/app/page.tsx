import { getMapPageData } from '@/modules/accidents/application/get-map-page-data';
import { MapPageClient } from '@/modules/accidents/presentation/MapPageClient';

export default async function Page() {
  const data = await getMapPageData();

  return <MapPageClient initialData={data} />;
}

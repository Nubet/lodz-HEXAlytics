import { NextResponse } from 'next/server';
import { getAccidentDetails } from '@/modules/accidents/application/get-accident-details';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get('id');
  const id = Number(rawId);

  if (!rawId || Number.isNaN(id)) {
    return NextResponse.json({ message: 'Invalid accident id.' }, { status: 400 });
  }

  try {
    const details = await getAccidentDetails(id);

    if (!details) {
      return NextResponse.json({ message: 'Accident details not found.' }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

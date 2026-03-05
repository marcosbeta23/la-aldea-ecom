'use client';

import { use } from 'react';
import GuideEditor from '../GuideEditor';

export default function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GuideEditor guideId={id} />;
}

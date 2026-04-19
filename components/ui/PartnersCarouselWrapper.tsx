import PartnersCarousel from './PartnersCarousel';
import type { Partner } from './PartnersCarousel';

interface Props {
  partners: Partner[];
  speed?: number;
}

export default function PartnersCarouselWrapper({ partners, speed }: Props) {
  return <PartnersCarousel partners={partners} speed={speed} />;
}

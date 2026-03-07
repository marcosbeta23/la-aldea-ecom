"use client";
import dynamic from "next/dynamic";
import type { Partner } from "./PartnersCarousel";

const PartnersCarousel = dynamic(() => import("./PartnersCarousel"), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse bg-slate-100 rounded-xl" />,
});

interface PartnersCarouselClientProps {
  partners: Partner[];
  speed?: number;
}

export default function PartnersCarouselClient(props: PartnersCarouselClientProps) {
  return <PartnersCarousel {...props} />;
}

"use client";
import { useEffect } from "react";
import { trackSearch } from "@/lib/analytics";

interface SearchAnalyticsProps {
  query: string;
  resultCount: number;
}

export default function SearchAnalytics({ query, resultCount }: SearchAnalyticsProps) {
  useEffect(() => {
    if (query) {
      trackSearch(query, resultCount, false, 'products_listing');
    }
  }, [query, resultCount]);
  return null;
}

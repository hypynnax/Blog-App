import { Metadata } from "next";
import { Suspense } from "react";
import SearchResultsPage from "@/components/Pages/SearchResults";

interface SearchProps {
  searchParams: { q?: string };
}

export async function generateMetadata({
  searchParams,
}: SearchProps): Promise<Metadata> {
  const query = searchParams.q;

  return {
    title: query ? `"${query}" Arama Sonuçları` : "Arama",
    description: query
      ? `"${query}" için arama sonuçları.`
      : "Blog yazılarında arama yapın.",
    robots: "noindex, follow",
  };
}

export default function Search({ searchParams }: SearchProps) {
  return (
    <Suspense fallback={<div>Arama sonuçları yükleniyor...</div>}>
      <SearchResultsPage initialQuery={searchParams.q || ""} />
    </Suspense>
  );
}

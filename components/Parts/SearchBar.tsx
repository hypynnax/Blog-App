import { useState } from "react";
import { searchBarIcon } from "@/icons/icon";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
      >
        {searchBarIcon}
      </button>
    </form>
  );
}

import React from "react";
import { FiSearch } from "react-icons/fi";
import { LuGitBranchPlus } from "react-icons/lu";

interface SearchInputProps {
  query: string;
  setQuery: (q: string) => void;
  onFocus: () => void;
}

export default function SearchInput({ query, setQuery, onFocus }: SearchInputProps) {
  return (
    <form onSubmit={e => e.preventDefault()} role="search" className="flex items-center relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search songs, artists, or users..."
        onFocus={onFocus}
        className="px-4 pr-10 py-2 w-full text-base bg-zinc-800 text-white placeholder-gray-400 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        autoComplete="off"
        aria-label="Search songs, artists, or users"
      />
      
      <FiSearch
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        size={20}
      />
    </form>
  );
}

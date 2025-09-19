"use client";
import { useState } from "react";
import BlogCard from "@/components/Parts/BlogCard";
import UserCard from "@/components/Parts/UserCard";
import SearchBar from "@/components/Parts/SearchBar";
import Pagination from "@/components/Parts/Pagination";
import { BlogCardProps } from "@/types/post";
import { UserCardProps } from "@/types/auth";

interface SearchResultsProps {
  initialQuery?: string;
}

export default function SearchResults({
  initialQuery = "",
}: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [postResults, setPostResults] = useState<BlogCardProps[]>([]);
  const [userResults, setUserResults] = useState<UserCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  const handleSubmit = async (value: string) => {
    setSearchQuery(value);
    try {
      const response = await fetch(`/api/search?q=${value}&type=all`);
      if (response.ok) {
        const data = await response.json();
        setPostResults(data["posts"] || []);
        setUserResults(data["users"] || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Results error:", error);
    }
  };

  const totalPages = Math.ceil(postResults.length / blogsPerPage);
  const currentResults = postResults.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-md shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Arama Sonuçları
          </h1>
          <SearchBar onSearch={handleSubmit} placeholder="Ara..." />

          {searchQuery && (
            <div className="mt-4">
              <p className="text-gray-600">
                &quot;<span className="font-medium">{searchQuery}</span>&quot;
                için {postResults.length} yazı ve {userResults.length} kullanıcı
                bulundu
              </p>
            </div>
          )}
        </div>

        {/* Kullanıcı Sonuçları */}
        {userResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Kullanıcılar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userResults.map((user) => (
                <UserCard key={user.id} {...user} />
              ))}
            </div>
          </div>
        )}

        {/* Post Sonuçları */}
        {postResults.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Yazılar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentResults.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        ) : (
          searchQuery && (
            <div className="text-center py-12 bg-white rounded-md shadow-md">
              <p className="text-gray-500 text-lg mb-4">
                Aradığınız kriterlere uygun yazı bulunamadı.
              </p>
              <p className="text-gray-400">
                Farklı anahtar kelimeler deneyebilirsiniz.
              </p>
            </div>
          )
        )}

        {/* Hiç arama yapılmadıysa */}
        {!searchQuery && (
          <div className="text-center py-12 bg-white rounded-md shadow-md">
            <p className="text-gray-500 text-lg">
              Arama yapmak için yukarıdaki kutucuğa yazın.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

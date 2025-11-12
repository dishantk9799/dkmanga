import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MangaCard from '../Manga/MangaCard';
import SearchBar from '../UI/SearchBar';
import LoadingSpinner from '../UI/LoadingSpinner';
import { searchManga } from '../../services/mangaDexApi';
import InfiniteScroll from 'react-infinite-scroll-component';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        setOffset(0);
        const data = await searchManga(query, limit, 0);
        setMangaList(data);
        setLoading(false);
        setHasMore(data.length === limit);
      } catch (error) {
        console.error('Error searching manga:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [query]);

  const fetchMoreData = async () => {
    if (!query) return;
    
    try {
      const newOffset = offset + limit;
      setOffset(newOffset);
      const data = await searchManga(query, limit, newOffset);
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      
      setMangaList(prevManga => [...prevManga, ...data]);
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching more search results:', error);
      setHasMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {query ? `Search Results for "${query}"` : 'Search Manga'}
        </h1>
        <div className="sm:w-64">
          <SearchBar onSearch={(newQuery) => {
            if (newQuery.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
            }
          }} placeholder="Search for manga..." />
        </div>
      </div>

      {!query && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Enter a search term to find manga</p>
        </div>
      )}

      {query && loading && <LoadingSpinner />}

      {query && !loading && (
        <>
          {mangaList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found for "{query}"</p>
              <p className="text-gray-400 mt-2">Try using different keywords</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={mangaList.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<LoadingSpinner />}
              endMessage={
                <p className="text-center text-gray-500 mt-4">
                  You've reached the end of the results
                </p>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mangaList.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
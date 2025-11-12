import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getLatestManga, getMangaByGenre } from '../../services/mangaDexApi';
import LoadingSpinner from '../UI/LoadingSpinner';
import InfiniteScroll from 'react-infinite-scroll-component';

const Genres = () => {
  const [searchParams] = useSearchParams();
  const genreParam = searchParams.get('genre');
  const [loading, setLoading] = useState(true);
  const [mangaList, setMangaList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(genreParam || null);
  const limit = 20;

  // Common manga genres
  const genres = [
    { name: 'Action', color: 'bg-red-500' },
    { name: 'Adventure', color: 'bg-blue-500' },
    { name: 'Comedy', color: 'bg-yellow-500' },
    { name: 'Drama', color: 'bg-purple-500' },
    { name: 'Fantasy', color: 'bg-green-500' },
    { name: 'Horror', color: 'bg-gray-700' },
    { name: 'Mystery', color: 'bg-indigo-500' },
    { name: 'Romance', color: 'bg-pink-500' },
    { name: 'Sci-Fi', color: 'bg-cyan-500' },
    { name: 'Slice of Life', color: 'bg-orange-500' },
    { name: 'Sports', color: 'bg-teal-500' },
    { name: 'Supernatural', color: 'bg-purple-700' },
  ];

  // Fetch manga by genre or latest manga
const fetchManga = async (genre, offset = 0) => {
  try {
    setLoading(offset === 0);
    setError(null);
    
    let data;
    if (genre) {
      // Use the new genre filtering function
      data = await getMangaByGenre(genre, limit, offset);
    } else {
      // Just get latest manga
      data = await getLatestManga(limit, offset);
    }
    
    if (offset === 0) {
      setMangaList(data);
    } else {
      setMangaList(prevManga => [...prevManga, ...data]);
    }
    
    // Check if we got results
    if (data && data.length > 0) {
      setHasMore(data.length === limit);
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  } catch (error) {
    console.error('Error fetching manga data:', error);
    setError('Failed to load manga. Please try again later.');
    setMangaList([]);
    setHasMore(false);
    setLoading(false);
  }
};

  useEffect(() => {
    setMangaList([]);
    setOffset(0);
    setHasMore(true);
    setSelectedGenre(genreParam);
    fetchManga(genreParam, 0);
  }, [genreParam]);

  const fetchMoreData = async () => {
    if (!hasMore) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchManga(selectedGenre, newOffset);
  };

  const handleGenreClick = (genre) => {
    const url = genre ? `/genres?genre=${encodeURIComponent(genre)}` : '/genres';
    window.history.pushState(null, '', url);
    setSelectedGenre(genre);
    setMangaList([]);
    setOffset(0);
    setHasMore(true);
    fetchManga(genre, 0);
  };

  if (loading && mangaList.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        {selectedGenre ? `${selectedGenre} Manga` : 'Browse by Genre'}
      </h1>
      
      {/* Genre Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          <button
            key={genre.name}
            onClick={() => handleGenreClick(genre.name)}
            className={`${genre.color} text-white rounded-lg p-4 text-center hover:opacity-90 transition-opacity ${
              selectedGenre === genre.name ? 'ring-4 ring-offset-2 ring-offset-gray-50 ring-gray-400' : ''
            }`}
          >
            <h3 className="font-semibold">{genre.name}</h3>
          </button>
        ))}
      </div>

      {/* Clear Filter */}
      {selectedGenre && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing {mangaList.length} manga in "{selectedGenre}" genre
          </p>
          <button
            onClick={() => handleGenreClick(null)}
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Manga List */}
      {mangaList.length > 0 && (
        <InfiniteScroll
          dataLength={mangaList.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
          endMessage={
            <p className="text-center text-gray-500 mt-4">
              You've reached the end of {selectedGenre ? `${selectedGenre} manga` : 'the list'}
            </p>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mangaList.map((manga) => (
              <Link key={manga.id} to={`/manga/${manga.id}`}>
                <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={manga.cover || '/placeholder.jpg'} 
                      alt={manga.title || 'Manga Cover'} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <h3 className="text-white font-semibold text-sm truncate">{manga.title || 'No Title'}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </InfiniteScroll>
      )}

      {/* No Manga Found */}
      {!loading && mangaList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedGenre 
              ? `No manga found in "${selectedGenre}" genre` 
              : 'No manga found'
            }
          </p>
          {selectedGenre && (
            <button
              onClick={() => handleGenreClick(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Browse All Genres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Genres;

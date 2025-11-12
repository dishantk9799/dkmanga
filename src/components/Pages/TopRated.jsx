import React, { useState, useEffect } from 'react';
import MangaCard from '../Manga/MangaCard';
import FilterTabs from '../UI/FilterTabs';
import LoadingSpinner from '../UI/LoadingSpinner';
import { getPopularManga } from '../../services/mangaDexApi';
import InfiniteScroll from 'react-infinite-scroll-component';

const TopRated = () => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const limit = 20;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        setOffset(0);
        
        const data = await getPopularManga(limit, 0);
        
        if (data && Array.isArray(data)) {
          setMangaList(data);
          setHasMore(data.length === limit);
        } else {
          console.error('Unexpected data format:', data);
          setMangaList([]);
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

    fetchInitialData();
  }, [timeFilter]);

  const fetchMoreData = async () => {
    try {
      const newOffset = offset + limit;
      setOffset(newOffset);
      
      const data = await getPopularManga(limit, newOffset);
      
      if (data && Array.isArray(data)) {
        if (data.length === 0) {
          setHasMore(false);
          return;
        }
        
        setMangaList(prevManga => [...prevManga, ...data]);
        setHasMore(data.length === limit);
      } else {
        console.error('Unexpected data format:', data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more manga data:', error);
      setHasMore(false);
    }
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  if (loading) {
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Top Rated Manga</h1>
      
      <FilterTabs 
        tabs={['all', 'week', 'month', 'year']} 
        activeTab={timeFilter} 
        onTabChange={handleTimeFilterChange} 
      />

      {mangaList && mangaList.length > 0 ? (
        <InfiniteScroll
          dataLength={mangaList.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
          endMessage={
            <p className="text-center text-gray-500 mt-4">
              You've reached the end of the list
            </p>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mangaList.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No manga found</p>
        </div>
      )}
    </div>
  );
};

export default TopRated;
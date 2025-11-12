import React, { useState, useEffect } from 'react';
import MangaCard from '../Manga/MangaCard';
import FilterTabs from '../UI/FilterTabs';
import LoadingSpinner from '../UI/LoadingSpinner';
import { getLatestManga, getPopularManga, getFeaturedManga } from '../../services/mangaDexApi';
import { Link } from 'react-router-dom';

const Home = () => {
  const [latestManga, setLatestManga] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [featuredManga, setFeaturedManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured manga
        const featured = await getFeaturedManga();
        setFeaturedManga(featured);
        
        // Fetch latest manga
        const latest = await getLatestManga();
        setLatestManga(latest);
        
        // Fetch popular manga
        const popular = await getPopularManga();
        setPopularManga(popular);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching manga data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getDisplayManga = () => {
    switch (activeTab) {
      case 'latest':
        return latestManga;
      case 'popular':
        return popularManga;
      default:
        return latestManga;
    }
  };

  // Function to get the first chapter of featured manga
  const getFirstChapter = async (mangaId) => {
    try {
      const response = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&limit=1`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error fetching first chapter:', error);
      return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Featured Manga Section - Made smaller */}
      {featuredManga && (
        <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 lg:w-1/5">
              <img 
                src={featuredManga.cover} 
                alt={featuredManga.title} 
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            <div className="md:w-3/4 lg:w-4/5 p-4 md:p-6 text-white">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider">
                Featured Release
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">{featuredManga.title}</h2>
              <p className="mb-3 text-indigo-100 text-sm md:text-base line-clamp-2">{featuredManga.description}</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {featuredManga.author}
                </span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {featuredManga.status}
                </span>
              </div>
              {/* Fixed Read Button - Now properly links to manga page */}
              <Link 
                to={`/manga/${featuredManga.id}`}
                className="inline-block bg-white text-indigo-700 font-bold py-2 px-4 rounded-full hover:bg-indigo-100 transition-colors text-sm"
              >
                Read Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <FilterTabs 
        tabs={['latest', 'popular', 'updates']} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {/* Manga Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {getDisplayManga().map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
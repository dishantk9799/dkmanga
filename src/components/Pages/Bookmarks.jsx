import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MangaCard from '../Manga/MangaCard';
import LoadingSpinner from '../UI/LoadingSpinner';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        // Get bookmarks from localStorage
        const saved = localStorage.getItem('bookmarks');
        if (saved) {
          setBookmarks(JSON.parse(saved));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = (mangaId) => {
    const updated = bookmarks.filter(manga => manga.id !== mangaId);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Bookmarks</h1>
      
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bookmarks.map((manga) => (
            <div key={manga.id} className="relative">
              <Link to={`/manga/${manga.id}`}>
                <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={manga.cover} 
                      alt={manga.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <h3 className="text-white font-semibold text-sm truncate">{manga.title}</h3>
                  </div>
                </div>
              </Link>
              
              <button
                onClick={() => handleRemoveBookmark(manga.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                title="Remove from bookmarks"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0H2.586a1 1 0 01-1.414 1L10 10.586a1 1 0 01-1.414 1.414l4.293 4.293a1 1 0 011.414 0l-5.586 5.586a1 1 0 01-.707.293l-4 4a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You don't have any bookmarks yet</p>
          <Link 
            to="/browse" 
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Browse Manga
          </Link>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
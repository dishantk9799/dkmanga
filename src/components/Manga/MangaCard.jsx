import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, StarIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

const MangaCard = ({ manga }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  // --- ADD THIS DEBUG LOG ---
  console.log(`MangaCard Render: Title=${manga.title}, CoverSrc=${manga.cover}`);
  // --- END DEBUG LOG ---
  useEffect(() => {
    // Check if this manga is already bookmarked
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      const bookmarks = JSON.parse(savedBookmarks);
      setIsBookmarked(bookmarks.some(bookmark => bookmark.id === manga.id));
    }
  }, [manga.id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const savedBookmarks = localStorage.getItem('bookmarks');
    let bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];

    if (isBookmarked) {
      // Remove from bookmarks
      bookmarks = bookmarks.filter(bookmark => bookmark.id !== manga.id);
    } else {
      // Add to bookmarks
      bookmarks.push(manga);
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Link to={`/manga/${manga.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {manga.isNew && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </div>
        )}

        <button
          onClick={toggleBookmark}
          className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
          title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          {isBookmarked ? (
            <BookmarkIconSolid className="h-4 w-4" />
          ) : (
            <BookmarkIcon className="h-4 w-4" />
          )}
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <h3 className="text-white font-semibold text-sm truncate">{manga.title}</h3>
          <div className="flex items-center justify-between mt-1">

            <div className="flex items-center space-x-2">
              {manga.rating && (
                <div className="flex items-center">
                  <StarIcon className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-white ml-1">{manga.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;
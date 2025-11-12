import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  BookOpenIcon,
  StarIcon,
  BookmarkIcon,
  SparklesIcon,
  HeartIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../UI/SearchBar';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
    }
  };

  // Get bookmark count from localStorage
  const getBookmarkCount = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    return bookmarks.length;
  };

  // Get followed manga count from localStorage
  const getFollowedCount = () => {
    const followedManga = JSON.parse(localStorage.getItem('followedManga') || '[]');
    return followedManga.length;
  };

  // Use a simple logo instead of external image
  const Logo = () => (
    <div className="text-2xl font-bold text-white">
      dkmanga
    </div>
  );

  return (
    <header className="bg-indigo-700 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="flex flex-col items-center hover:text-indigo-200 transition-colors">
              <HomeIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/browse" className="flex flex-col items-center hover:text-indigo-200 transition-colors">
              <BookOpenIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Browse</span>
            </Link>
            <Link to="/genres" className="flex flex-col items-center hover:text-indigo-200 transition-colors">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Genres</span>
            </Link>
            <Link to="/top-rated" className="flex flex-col items-center hover:text-indigo-200 transition-colors">
              <StarIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Top Rated</span>
            </Link>
            <Link to="/followed" className="flex flex-col items-center hover:text-indigo-200 transition-colors relative">
              <HeartIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Followed</span>
              {getFollowedCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getFollowedCount() > 9 ? '9+' : getFollowedCount()}
                </span>
              )}
            </Link>
            <Link to="/bookmarks" className="flex flex-col items-center hover:text-indigo-200 transition-colors relative">
              <BookmarkIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Bookmarks</span>
              {getBookmarkCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getBookmarkCount() > 9 ? '9+' : getBookmarkCount()}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-indigo-600 transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-indigo-600 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4">
            <SearchBar onSearch={handleSearch} placeholder="Search for manga..." />
          </div>
        )}

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-indigo-600">
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="flex items-center py-2 hover:text-indigo-200 transition-colors">
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link to="/browse" className="flex items-center py-2 hover:text-indigo-200 transition-colors">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Browse
              </Link>
              <Link to="/genres" className="flex items-center py-2 hover:text-indigo-200 transition-colors">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Genres
              </Link>
              <Link to="/top-rated" className="flex items-center py-2 hover:text-indigo-200 transition-colors">
                <StarIcon className="h-5 w-5 mr-2" />
                Top Rated
              </Link>
              <Link to="/followed" className="flex items-center py-2 hover:text-indigo-200 transition-colors">
                <HeartIcon className="h-5 w-5 mr-2" />
                Followed
              </Link>
              <Link to="/bookmarks" className="flex items-center py-2 hover:text-indigo-200 transition-colors">
                <BookmarkIcon className="h-5 w-5 mr-2" />
                Bookmarks
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
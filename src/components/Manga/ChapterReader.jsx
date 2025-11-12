import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../UI/LoadingSpinner';
import { getChapterPages } from '../../services/mangaDexApi';

const ChapterReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [error, setError] = useState(null);
  const [readingMode, setReadingMode] = useState('single');
  const [imageQuality, setImageQuality] = useState('high');
  const [pageNavigation, setPageNavigation] = useState('both');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageFit, setPageFit] = useState('width');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [chaptersList, setChaptersList] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const imgRef = useRef(null);

  // Fetch chapter data
  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getChapterPages(id);

        setChapter(data.chapter);
        setPages(data.pages);
        setBaseUrl(data.baseUrl);
        setPageUrl(`${data.baseUrl}/data/${data.hash}/`);

        // Get manga ID from chapter relationships
        const mangaId = getMangaId(data.chapter);

        // Fetch all chapters for this manga to enable navigation
        if (mangaId) {
          const chaptersResponse = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=desc`);
          const chaptersData = await chaptersResponse.json();

          if (chaptersData.data && chaptersData.data.length > 0) {
            setChaptersList(chaptersData.data);

            // Find current chapter index
            const currentIndex = chaptersData.data.findIndex(ch => ch.id === id);
            setCurrentChapterIndex(currentIndex);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching chapter data:', error);
        setError('Failed to load chapter. Please try again later.');
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [id]);

  useEffect(() => {
    // Load page when current page changes
    if (pages.length > 0) {
      setPageLoading(true);
      // Simulate page loading
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPage, pages.length]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (pageNavigation === 'arrow' || pageNavigation === 'both') {
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, pageNavigation]);

  const handleImageClick = (e) => {
    if (pageNavigation === 'click' || pageNavigation === 'both') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      if (x < width / 2) {
        handlePrevPage();
      } else {
        handleNextPage();
      }
    }
  };

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextPage();
    } else if (isRightSwipe) {
      handlePrevPage();
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.25);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(zoomLevel - 0.25);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Navigate to previous chapter
  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0 && currentChapterIndex < chaptersList.length - 1) {
      const prevChapterId = chaptersList[currentChapterIndex + 1].id;
      navigate(`/chapter/${prevChapterId}`);
    } else {
      // Show message if no previous chapter
      alert('You are already reading the first available chapter');
    }
  };

  // Navigate to next chapter
  const goToNextChapter = () => {
    if (currentChapterIndex > 0) {
      const nextChapterId = chaptersList[currentChapterIndex - 1].id;
      navigate(`/chapter/${nextChapterId}`);
    } else {
      // Show message if no next chapter
      alert('You are already reading the latest available chapter');
    }
  };

  // Get manga ID from chapter relationships
  const getMangaId = (chapterData) => {
    if (chapterData && chapterData.relationships) {
      const mangaRel = chapterData.relationships.find(rel => rel.type === 'manga');
      return mangaRel ? mangaRel.id : '';
    }
    return '';
  };

  // Handle page change with keyboard shortcuts for chapter navigation
  useEffect(() => {
    const handleChapterNavigation = (e) => {
      // Ctrl/Cmd + Left Arrow for previous chapter
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousChapter();
      }
      // Ctrl/Cmd + Right Arrow for next chapter
      else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextChapter();
      }
    };

    window.addEventListener('keydown', handleChapterNavigation);
    return () => {
      window.removeEventListener('keydown', handleChapterNavigation);
    };
  }, [currentChapterIndex, chaptersList]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!chapter || pages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Chapter not found</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const getImageStyle = () => {
    switch (pageFit) {
      case 'width':
        return { maxWidth: '100%', height: 'auto' };
      case 'height':
        return { width: 'auto', maxHeight: '100vh' };
      case 'original':
        return { transform: `scale(${zoomLevel})` };
      default:
        return { maxWidth: '100%', height: 'auto' };
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      {/* Reader Header */}
      <div className="bg-gray-800 text-white p-2 sm:p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link to={`/manga/${getMangaId(chapter)}`} className="flex items-center text-indigo-400 hover:text-indigo-300">
            <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <h1 className="text-sm sm:text-lg font-medium truncate max-w-[150px] sm:max-w-none">
            {chapter.attributes?.title || `Chapter ${chapter.attributes?.chapter || 'Unknown'}`}
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-xs sm:text-sm">
            {currentPage + 1} / {pages.length}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1 sm:p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            {settingsOpen ? (
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Bars3Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Reader Settings Panel */}
      {settingsOpen && (
        <div className="bg-gray-800 text-white p-2 sm:p-4 border-b border-gray-700">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Reading Mode</label>
              <select
                value={readingMode}
                onChange={(e) => setReadingMode(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="single">Single Page</option>
                <option value="double">Double Page</option>
                <option value="longstrip">Long Strip</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Page Fit</label>
              <select
                value={pageFit}
                onChange={(e) => setPageFit(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="width">Fit Width</option>
                <option value="height">Fit Height</option>
                <option value="original">Original Size</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Page Navigation</label>
              <select
                value={pageNavigation}
                onChange={(e) => setPageNavigation(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="arrow">Arrow Keys</option>
                <option value="click">Click Navigation</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-400">
            <p>Navigation tips:</p>
            <p>• Use arrow keys or click sides of image to navigate pages</p>
            <p>• Use Ctrl/Cmd + Arrow keys to navigate chapters</p>
            <p>• Swipe left/right on mobile to navigate pages</p>
          </div>
        </div>
      )}

      {/* Reader Content */}
      <div className="flex-grow flex items-center justify-center p-2 sm:p-4 relative overflow-auto">
        {/* Previous Page Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`absolute left-2 sm:left-4 z-10 p-1 sm:p-2 rounded-full ${currentPage === 0
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 text-white hover:bg-gray-600'
            } transition-colors`}
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Zoom Controls */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-2 sm:bottom-4 z-10 flex space-x-1 sm:space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1 sm:p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <span className="p-1 sm:p-2 bg-gray-700 text-white rounded-full text-xs sm:text-sm">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 sm:p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Manga Page */}
        <div className="w-full max-w-4xl flex justify-center items-center">
          {pageLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <img
              ref={imgRef}
              src={`${pageUrl}${pages[currentPage]}`}
              alt={`Page ${currentPage + 1}`}
              className="max-w-full h-auto mx-auto cursor-pointer"
              style={getImageStyle()}
              onClick={handleImageClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x1200?text=Page+Not+Available';
              }}
            />
          )}
        </div>

        {/* Next Page Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1}
          className={`absolute right-2 sm:right-4 z-10 p-1 sm:p-2 rounded-full ${currentPage === pages.length - 1
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 text-white hover:bg-gray-600'
            } transition-colors`}
        >
          <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Reader Footer */}
      <div className="bg-gray-800 text-white p-2 sm:p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <button
            onClick={goToPreviousChapter}
            disabled={currentChapterIndex >= chaptersList.length - 1 || chaptersList.length === 0}
            className={`w-full sm:w-auto px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm transition-colors ${currentChapterIndex >= chaptersList.length - 1 || chaptersList.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
          >
            Previous Chapter
          </button>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`w-full sm:w-auto px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${currentPage === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } transition-colors`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="range"
                min="0"
                max={pages.length - 1}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="w-full sm:w-32 md:w-48 lg:w-64"
              />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                {currentPage + 1} / {pages.length}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === pages.length - 1}
              className={`w-full sm:w-auto px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${currentPage === pages.length - 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } transition-colors`}
            >
              Next
            </button>
          </div>

          <button
            onClick={goToNextChapter}
            disabled={currentChapterIndex <= 0 || chaptersList.length === 0}
            className={`w-full sm:w-auto px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm transition-colors ${currentChapterIndex <= 0 || chaptersList.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
          >
            Next Chapter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;
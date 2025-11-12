import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../UI/LoadingSpinner';
import { getMangaDetails, getMangaChapters } from '../../services/mangaDexApi';

const MangaPage = () => {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('chapters');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [relatedManga, setRelatedManga] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch manga details
        const mangaData = await getMangaDetails(id);
        setManga(mangaData);

        // Fetch manga chapters
        const chaptersData = await getMangaChapters(id);
        const chaptersWithMangaId = chaptersData.map(chapter => ({
          ...chapter,
          mangaId: id
        }));
        setChapters(chaptersWithMangaId);

        // Check if manga is followed/bookmarked (from localStorage)
        const followedManga = JSON.parse(localStorage.getItem('followedManga') || '[]');
        setIsFollowing(followedManga.some(m => m.id === id));

        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setIsBookmarked(bookmarks.some(m => m.id === id));

        // Load notes for this manga
        const savedNotes = JSON.parse(localStorage.getItem('mangaNotes') || '{}');
        setNotes(savedNotes[id] || []);

        // Load reviews for this manga
        const savedReviews = JSON.parse(localStorage.getItem('mangaReviews') || '{}');
        setReviews(savedReviews[id] || []);

        // Get related manga (same genre)
        if (mangaData.genres && mangaData.genres.length > 0) {
          try {
            const relatedData = await getLatestManga(6, 0);
            setRelatedManga(relatedData.filter(m => m.id !== id &&
              m.genres && m.genres.some(g => mangaData.genres.includes(g))
            ).slice(0, 6));
          } catch (err) {
            console.error('Error fetching related manga:', err);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching manga data:', error);
        setError('Failed to load manga. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollow = () => {
    const followedManga = JSON.parse(localStorage.getItem('followedManga') || '[]');

    if (isFollowing) {
      // Unfollow
      const updated = followedManga.filter(m => m.id !== id);
      localStorage.setItem('followedManga', JSON.stringify(updated));
      setIsFollowing(false);
    } else {
      // Follow
      followedManga.push({ id, title: manga.title, cover: manga.cover });
      localStorage.setItem('followedManga', JSON.stringify(followedManga));
      setIsFollowing(true);
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    if (isBookmarked) {
      // Remove bookmark
      const updated = bookmarks.filter(m => m.id !== id);
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      // Add bookmark
      bookmarks.push({ id, title: manga.title, cover: manga.cover });
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const savedNotes = JSON.parse(localStorage.getItem('mangaNotes') || '{}');
      const mangaNotes = savedNotes[id] || [];
      const updatedNotes = [...mangaNotes, {
        id: Date.now(),
        text: newNote,
        date: new Date().toISOString()
      }];
      savedNotes[id] = updatedNotes;
      localStorage.setItem('mangaNotes', JSON.stringify(savedNotes));
      setNotes(updatedNotes);
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    const savedNotes = JSON.parse(localStorage.getItem('mangaNotes') || '{}');
    const mangaNotes = savedNotes[id] || [];
    const updatedNotes = mangaNotes.filter(note => note.id !== noteId);
    savedNotes[id] = updatedNotes;
    localStorage.setItem('mangaNotes', JSON.stringify(savedNotes));
    setNotes(updatedNotes);
  };

  const handleAddReview = () => {
    if (newReview.comment.trim()) {
      const savedReviews = JSON.parse(localStorage.getItem('mangaReviews') || '{}');
      const mangaReviews = savedReviews[id] || [];
      const updatedReviews = [...mangaReviews, {
        id: Date.now(),
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString()
      }];
      savedReviews[id] = updatedReviews;
      localStorage.setItem('mangaReviews', JSON.stringify(savedReviews));
      setReviews(updatedReviews);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    const savedReviews = JSON.parse(localStorage.getItem('mangaReviews') || '{}');
    const mangaReviews = savedReviews[id] || [];
    const updatedReviews = mangaReviews.filter(review => review.id !== reviewId);
    savedReviews[id] = updatedReviews;
    localStorage.setItem('mangaReviews', JSON.stringify(savedReviews));
    setReviews(updatedReviews);
  };

  // Get first chapter for the "Start Reading" button
  const firstChapter = chapters.length > 0 ? chapters[0] : null;

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

  if (!manga) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Manga not found</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Back
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-6">
            <img
              src={manga.cover}
              alt={manga.title}
              className="w-full rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
              }}
            />

            <div className="mt-6 space-y-3">
              {firstChapter ? (
                <Link
                  to={`/chapter/${firstChapter.id}`}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Start Reading
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center cursor-not-allowed"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  No Chapters Available
                </button>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleFollow}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${isFollowing
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {isFollowing ? (
                    <>
                      <HeartIcon className="h-5 w-5 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <HeartIcon className="h-5 w-5 mr-1" />
                      Follow
                    </>
                  )}
                </button>

                <button
                  onClick={handleBookmark}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${isBookmarked
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {isBookmarked ? (
                    <StarIcon className="h-5 w-5" />
                  ) : (
                    <StarIcon className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: manga.title,
                        text: `Check out ${manga.title} on DKManga`,
                        url: window.location.href
                      }).catch(err => console.log('Error sharing:', err));
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{manga.title}</h1>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-gray-700">{manga.rating || 'N/A'}</span>
              </div>

              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-1 text-gray-700">{manga.status || 'Unknown'}</span>
              </div>

            </div>

            <div className="mb-4">
              <span className="text-gray-700 font-medium">Author:</span>
              <span className="ml-2 text-gray-600">{manga.author || 'Unknown'}</span>
            </div>

            <div className="mb-4">
              <span className="text-gray-700 font-medium">Year:</span>
              <span className="ml-2 text-gray-600">{manga.year || 'Unknown'}</span>
            </div>

            <div className="mb-6">
              <span className="text-gray-700 font-medium">Genres:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {manga.genres && manga.genres.length > 0 ? (
                  manga.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No genres available</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {manga.description || 'No description available.'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('chapters')}
              className={`px-6 py-3 font-medium text-sm ${selectedTab === 'chapters'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Chapters ({chapters.length})
            </button>

            <button
              onClick={() => setSelectedTab('reviews')}
              className={`px-6 py-3 font-medium text-sm ${selectedTab === 'reviews'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Reviews ({reviews.length})
            </button>

            <button
              onClick={() => setSelectedTab('notes')}
              className={`px-6 py-3 font-medium text-sm ${selectedTab === 'notes'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Notes ({notes.length})
            </button>

            <button
              onClick={() => setSelectedTab('related')}
              className={`px-6 py-3 font-medium text-sm ${selectedTab === 'related'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Related Manga
            </button>
          </div>

          <div className="p-6">
            {selectedTab === 'chapters' && (
              <div className="space-y-3">
                {chapters.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No chapters available</p>
                ) : (
                  chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      to={`/chapter/${chapter.id}`}
                      className="block bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">{chapter.title}</h4>
                          <p className="text-sm text-gray-500">
                            {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString() : 'Unknown date'} • {chapter.pages || '0'} pages
                          </p>
                        </div>
                        <div className="text-indigo-600 hover:text-indigo-800">
                          Read
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Reviews</h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    Add Review
                  </button>
                </div>

                {showReviewForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="focus:outline-none"
                          >
                            <StarIcon
                              className={`h-6 w-6 ${star <= newReview.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                        rows="3"
                        placeholder="Share your thoughts about this manga..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddReview}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Submit Review
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setNewReview({ rating: 5, comment: '' });
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0H2.586a1 1 0 01-1.414 1L10 10.586a1 1 0 01-1.414 1.414l4.293 4.293a1 1 0 011.414 0l-5.586 5.586a1 1 0 01-.707.293l-4 4a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Personal Notes</h3>
                  <button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    Add Note
                  </button>
                </div>

                {showNoteForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                        rows="3"
                        placeholder="Add your personal notes about this manga..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddNote}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => {
                          setShowNoteForm(false);
                          setNewNote('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notes yet. Add your first note!</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-500">
                          {new Date(note.date).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0H2.586a1 1 0 01-1.414 1L10 10.586a1 1 0 01-1.414 1.414l4.293 4.293a1 1 0 011.414 0l-5.586 5.586a1 1 0 01-.707.293l-4 4a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-700">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'related' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Related Manga</h3>
                {relatedManga.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No related manga found</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {relatedManga.map((related) => (
                      <Link key={related.id} to={`/manga/${related.id}`}>
                        <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                          <div className="aspect-[3/4] overflow-hidden">
                            <img
                              src={related.cover}
                              alt={related.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                            <h4 className="text-white font-semibold text-sm truncate">{related.title}</h4>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaPage;
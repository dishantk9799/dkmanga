import axios from 'axios';

// Correct BASE_URL for MangaDex v5 API
const BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get latest manga releases
export const getLatestManga = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/manga', {
      params: {
        limit,
        offset,
        order: { createdAt: 'desc' },
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        availableTranslatedLanguage: ['en'],
      },
    });

    return response.data.data.map(transformMangaData);
  } catch (error) {
    console.error('Error fetching latest manga:', error);
    throw error;
  }
};

// Get popular manga
export const getPopularManga = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/manga', {
      params: {
        limit,
        offset,
        order: { followedCount: 'desc' },
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        availableTranslatedLanguage: ['en'],
      },
    });

    return response.data.data.map(transformMangaData);
  } catch (error) {
    console.error('Error fetching popular manga:', error);
    throw error;
  }
};

// Get featured manga (random popular manga)
export const getFeaturedManga = async () => {
  try {
    const response = await api.get('/manga', {
      params: {
        limit: 1,
        offset: Math.floor(Math.random() * 100),
        order: { followedCount: 'desc' },
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        availableTranslatedLanguage: ['en'],
      },
    });

    if (response.data.data.length === 0) {
      return null;
    }

    return transformMangaData(response.data.data[0], true);
  } catch (error) {
    console.error('Error fetching featured manga:', error);
    throw error;
  }
};

// Search manga
export const searchManga = async (query, limit = 20, offset = 0) => {
  try {
    const response = await api.get('/manga', {
      params: {
        limit,
        offset,
        title: query,
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        availableTranslatedLanguage: ['en'],
      },
    });

    return response.data.data.map(transformMangaData);
  } catch (error) {
    console.error('Error searching manga:', error);
    throw error;
  }
};

// Get manga details
export const getMangaDetails = async (id) => {
  try {
    const response = await api.get(`/manga/${id}`, {
      params: {
        includes: ['cover_art', 'author', 'artist'],
      },
    });

    return transformMangaData(response.data.data, true);
  } catch (error) {
    console.error('Error fetching manga details:', error);
    throw error;
  }
};

// Get manga chapters
export const getMangaChapters = async (id, limit = 100, offset = 0) => {
  try {
    const response = await api.get(`/manga/${id}/feed`, {
      params: {
        limit,
        offset,
        order: { chapter: 'desc' },
        translatedLanguage: ['en'],
        contentRating: ['safe', 'suggestive', 'erotica'],
      },
    });

    return response.data.data.map(transformChapterData);
  } catch (error) {
    console.error('Error fetching manga chapters:', error);
    throw error;
  }
};

// Get chapter pages
export const getChapterPages = async (id) => {
  try {
    // First get the chapter details
    const chapterResponse = await api.get(`/chapter/${id}`);
    const chapterData = chapterResponse.data.data;

    // Get the atHome server URL for the chapter
    const serverResponse = await api.get(`/at-home/server/${id}`);

    return {
      chapter: chapterData,
      pages: serverResponse.data.chapter.data,
      baseUrl: serverResponse.data.baseUrl,
      hash: serverResponse.data.chapter.hash,
    };
  } catch (error) {
    console.error('Error fetching chapter pages:', error);
    throw error;
  }
};

// NEW: Get manga by genre
export const getMangaByGenre = async (genre, limit = 20, offset = 0) => {
  try {
    // First get a larger batch of manga to filter from
    const response = await api.get('/manga', {
      params: {
        limit: 100, // Get more to filter from
        offset: 0,
        order: { followedCount: 'desc' },
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        availableTranslatedLanguage: ['en'],
      },
    });

    // Filter the results on the client side
    const allManga = response.data.data.map(transformMangaData);

    // Filter by genre (case-insensitive)
    const filteredManga = genre
      ? allManga.filter(manga =>
        manga.genres && manga.genres.some(g =>
          g.toLowerCase() === genre.toLowerCase()
        )
      )
      : allManga;

    // Apply pagination to the filtered results
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredManga.slice(startIndex, endIndex);

    return paginatedResults;
  } catch (error) {
    console.error('Error fetching manga by genre:', error);
    throw error;
  }
};
// Transform manga data from API to our format
const transformMangaData = (manga, detailed = false) => {
  const attributes = manga.attributes;
  const relationships = manga.relationships || [];

  // Get cover art
  const coverArt = relationships.find(rel => rel.type === 'cover_art');
  const coverFileName = coverArt ? coverArt.attributes.fileName : null;
  // Updated cover URL to use the correct MangaDex domain
  const coverUrl = coverFileName
    ? `/uploads/covers/${manga.id}/${coverFileName}`
    : 'https://via.placeholder.com/300x400?text=No+Cover';

  // Get author
  const author = relationships.find(rel => rel.type === 'author');
  const authorName = author ? author.attributes.name : 'Unknown';

  // Get artist
  const artist = relationships.find(rel => rel.type === 'artist');
  const artistName = artist ? artist.attributes.name : authorName;

  // Format view count
  const viewCount = attributes.followedCount || 0;
  const formattedViews = viewCount > 1000
    ? `${(viewCount / 1000).toFixed(1)}K`
    : viewCount.toString();

  // Get description
  let description = '';
  if (attributes.description && attributes.description.en) {
    description = attributes.description.en.length > 150
      ? attributes.description.en.substring(0, 150) + '...'
      : attributes.description.en;
  }

  // Get status
  const status = attributes.status || 'unknown';
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  // Get rating (if available)
  const rating = attributes.contentRating || 'safe';
  const formattedRating = rating.charAt(0).toUpperCase() + rating.slice(1);

  // Get tags
  const tags = attributes.tags || [];
  const genres = tags.map(tag => tag.attributes.name.en).slice(0, 3);

  // Get last chapter
  const lastChapter = relationships.find(rel => rel.type === 'last_chapter');
  const lastChapterNum = lastChapter ? lastChapter.attributes.chapter : 'N/A';

  return {
    id: manga.id,
    title: attributes.title.en || attributes.title[Object.keys(attributes.title)[0]] || 'Untitled',
    description: description,
    cover: coverUrl,
    author: authorName,
    artist: artistName,
    status: formattedStatus,
    views: formattedViews,
    chapter: `Ch. ${lastChapterNum}`,
    rating: formattedRating,
    genres: genres,
    isNew: Math.random() > 0.7, // Randomly mark some as new for demo
    ...detailed && {
      altTitles: attributes.altTitles || [],
      year: attributes.year || 'Unknown',
      contentRating: formattedRating,
      tags: genres,
      lastUpdated: attributes.updatedAt,
    }
  };
};

// Transform chapter data from API to our format
const transformChapterData = (chapter) => {
  const attributes = chapter.attributes;

  return {
    id: chapter.id,
    chapter: attributes.chapter || '0',
    title: attributes.title || `Chapter ${attributes.chapter}`,
    pages: attributes.pages || 0,
    publishedAt: attributes.publishAt,
    language: attributes.translatedLanguage || 'en',
  };
};

export default api;
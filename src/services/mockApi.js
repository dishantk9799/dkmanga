// src/services/mockApi.js

// Mock manga data for testing
const mockMangaList = [
  {
    id: '1',
    title: 'One Piece',
    description: 'Gol D. Roger, known as the Pirate King, was executed, but before he died he told everyone his hidden treasure "One Piece" was hidden somewhere in the Grand Line.',
    cover: 'https://via.placeholder.com/300x400?text=One+Piece',
    author: 'Eiichiro Oda',
    status: 'Ongoing',
    views: '1.2M',
    chapter: 'Ch. 1089',
    rating: 'Safe',
    genres: ['Adventure', 'Comedy', 'Drama'],
    isNew: true,
    year: '1997',
  },
  {
    id: '2',
    title: 'Chainsaw Man',
    description: 'Denji has a simple dream—to live a happy and peaceful life with a girl he likes. This is a far from simple dream, however, as he is a Chainsaw Devil hybrid.',
    cover: 'https://via.placeholder.com/300x400?text=Chainsaw+Man',
    author: 'Tatsuki Fujimoto',
    status: 'Ongoing',
    views: '856K',
    chapter: 'Ch. 128',
    rating: 'Safe',
    genres: ['Action', 'Supernatural', 'Dark Fantasy'],
    isNew: true,
    year: '2018',
  },
  {
    id: '3',
    title: 'Spy x Family',
    description: 'A spy, an assassin, and a telepath come together as a fake family for the sake of world peace, but end up creating a genuine bond.',
    cover: 'https://via.placeholder.com/300x400?text=Spy+x+Family',
    author: 'Tatsuya Endo',
    status: 'Ongoing',
    views: '1.5M',
    chapter: 'Ch. 89',
    rating: 'Safe',
    genres: ['Comedy', 'Action', 'Slice of Life'],
    isNew: false,
    year: '2019',
  },
];

// Mock chapters data
const mockChapters = [
  {
    id: '1-1',
    chapter: '1',
    title: 'Romance Dawn',
    pages: 45,
    publishedAt: '1997-07-22',
    language: 'en',
  },
  {
    id: '1-2',
    chapter: '2',
    title: 'The First Battle',
    pages: 43,
    publishedAt: '1997-08-04',
    language: 'en',
  },
  {
    id: '1-3',
    chapter: '3',
    title: 'An Unusual Creature',
    pages: 45,
    publishedAt: '1997-08-11',
    language: 'en',
  },
];

// Get latest manga releases
export const getLatestManga = async (limit = 20, offset = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMangaList.slice(offset, offset + limit));
    }, 500);
  });
};

// Get popular manga
export const getPopularManga = async (limit = 20, offset = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMangaList.slice(offset, offset + limit));
    }, 500);
  });
};

// Get featured manga
export const getFeaturedManga = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMangaList[0]);
    }, 500);
  });
};

// Search manga
export const searchManga = async (query, limit = 20, offset = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockMangaList.filter(manga => 
        manga.title.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered.slice(offset, offset + limit));
    }, 500);
  });
};

// Get manga details
export const getMangaDetails = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const manga = mockMangaList.find(m => m.id === id);
      if (manga) {
        resolve(manga);
      } else {
        reject(new Error('Manga not found'));
      }
    }, 500);
  });
};

// Get manga chapters
export const getMangaChapters = async (id, limit = 100, offset = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockChapters.map(chapter => ({
        ...chapter,
        mangaId: id
      })));
    }, 500);
  });
};

// Get chapter pages
export const getChapterPages = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chapter: { id, attributes: { title: `Chapter ${id.split('-')[1]}` } },
        pages: Array.from({ length: 45 }, (_, i) => `page-${i + 1}.jpg`),
        baseUrl: 'https://via.placeholder.com/800x1200?text=',
        hash: 'mock-chapter',
      });
    }, 500);
  });
};
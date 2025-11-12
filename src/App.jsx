// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './components/Pages/Home';
import Browse from './components/Pages/Browse';
import SearchResults from './components/Pages/SearchResults';
import MangaPage from './components/Pages/MangaPage';
import ChapterReader from './components/Manga/ChapterReader';
import Genres from './components/Pages/Genres';
import TopRated from './components/Pages/TopRated';
import Bookmarks from './components/Pages/Bookmarks';
import FollowedManga from './components/Pages/FollowedManga';
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/popular" element={<Browse defaultTab="popular" />} />
            <Route path="/latest" element={<Browse defaultTab="latest" />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/manga/:id" element={<MangaPage />} />
            <Route path="/chapter/:id" element={<ChapterReader />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/followed" element={<FollowedManga />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
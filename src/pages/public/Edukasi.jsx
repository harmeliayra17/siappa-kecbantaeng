import React, { useState, useEffect } from 'react';
import { Search, Calendar, Tag, Heart, Share2, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

export default function Edukasi() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('konten_edukasi')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);

        // Extract unique categories
        const uniqueCategories = [...new Set(data?.map(a => a.kategori) || [])];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const judul = (article.judul_konten || article.judul_artikel || '').toLowerCase();
    const matchSearch = judul.includes(searchQuery.toLowerCase());
    const matchCategory = !selectedCategory || (article.kategori_id === selectedCategory || article.kategori === selectedCategory);
    return matchSearch && matchCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Hukum': 'bg-blue-100 text-blue-700',
      'Parenting': 'bg-pink-100 text-pink-700',
      'Berita': 'bg-purple-100 text-purple-700',
      'Tips': 'bg-green-100 text-green-700',
      'Kesehatan': 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen pt-36 pb-12 px-6" style={{
      background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-3">Pusat Edukasi & Berita</h1>
          <p className="text-lg text-body">Artikel, tips, dan berita terkini untuk perlindungan perempuan dan anak</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition text-sm ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-white text-heading border border-gray-300 hover:border-primary'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition text-sm ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-heading border border-gray-300 hover:border-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Menampilkan <strong>{filteredArticles.length}</strong> artikel
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse mb-4 mx-auto"></div>
              <p className="text-gray-600">Memuat artikel...</p>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Tidak ada artikel ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                to={`/edukasi/${article.id}`}
                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Background Image dengan Overlay */}
                {(article.featured_image_url || article.gambar_thumbnail) && (
                  <img
                    src={article.featured_image_url || article.gambar_thumbnail}
                    alt={article.judul_konten || article.judul_artikel}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}

                {/* Gradient Overlay - Default Dark */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80 group-hover:from-black/40 group-hover:via-black/60 group-hover:to-black/90 transition-all duration-500"></div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:animate-pulse"></div>

                {/* Content Container */}
                <div className="relative h-full flex flex-col justify-between p-6 text-white">
                  {/* Top Section */}
                  <div className="space-y-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getCategoryColor(article.kategori || article.kategori_id)}`}>
                      <Tag className="w-3 h-3 inline mr-1" />
                      {article.kategori || article.kategori_id}
                    </span>
                    <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {article.judul_konten || article.judul_artikel}
                    </h3>
                  </div>

                  {/* Preview Text - Slide Up on Hover */}
                  <div className="space-y-3">
                    <div className="h-16 relative overflow-hidden">
                      <p className="text-sm text-gray-200 line-clamp-3 group-hover:text-white transition-all duration-300 absolute top-0 group-hover:top-0 group-hover:animate-none opacity-0 group-hover:opacity-100">
                        {truncateText(article.isi_konten || '', 150)}
                      </p>
                    </div>

                    {/* Meta and CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="text-xs text-gray-300">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(article.created_at)}
                      </span>
                      <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all duration-300">
                        <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Baca</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold flex-1">{selectedArticle.judul_konten || selectedArticle.judul_artikel}</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Thumbnail */}
              {(selectedArticle.featured_image_url || selectedArticle.gambar_thumbnail) && (
                <img
                  src={selectedArticle.featured_image_url || selectedArticle.gambar_thumbnail}
                  alt={selectedArticle.judul_konten || selectedArticle.judul_artikel}
                  className="w-full h-80 object-cover rounded-lg"
                />
              )}

              {/* Category & Date */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getCategoryColor(selectedArticle.kategori || selectedArticle.kategori_id)}`}>
                  {selectedArticle.kategori || selectedArticle.kategori_id}
                </span>
                <span className="text-sm text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {formatDate(selectedArticle.created_at)}
                </span>
              </div>

              {/* Content */}
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.isi_konten}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-semibold">
                  <Heart className="w-5 h-5" />
                  Suka
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition font-semibold">
                  <Share2 className="w-5 h-5" />
                  Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

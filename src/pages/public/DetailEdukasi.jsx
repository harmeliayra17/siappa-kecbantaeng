import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Bookmark, ChevronRight } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function DetailEdukasi() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('konten_edukasi')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.judul_artikel,
          text: 'Baca artikel ini di SI-APPA',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Artikel tidak ditemukan</p>
          <Link to="/edukasi" className="text-primary hover:text-secondary font-semibold">
            Kembali ke Edukasi
          </Link>
        </div>
      </div>
    );
  }

  // Support both field names
  const title = article.judul_konten || article.judul_artikel;
  const content = article.isi_konten || article.konten || '';
  const image = article.featured_image_url || article.gambar_thumbnail;
  const date = article.tanggal_publikasi || article.created_at;
  const author = article.penulis || 'Admin SI-APPA';

  // Handle category display - support both field names
  const categoryName = article.kategori || article.kategori_id || '';
  const categories = typeof categoryName === 'string' ? categoryName.split(',').map(cat => cat.trim()) : [categoryName];

  return (
    <div className="min-h-screen pt-36 pb-20 px-6 md:px-8 font-sans bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/edukasi" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium mb-12 text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" /> 
          Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                {categoryName}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm pb-8 border-b border-gray-200 mb-12">
              <span>{formatDate(date)}</span>
              <span>•</span>
              <span>oleh {author}</span>
            </div>

            {/* Featured Image */}
            {image && (
              <div className="w-full h-96 overflow-hidden rounded-lg mb-8">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap mb-12">
              {content}
            </div>

            {/* Share Buttons */}
            <div className="border-t border-b border-gray-200 py-6 flex gap-6 mb-12">
              <button 
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium text-sm"
              >
                <Share2 size={18} /> Bagikan
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* CTA Box */}
            <div className="sticky top-28 bg-primary/5 rounded-lg p-8 border border-primary/10">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Butuh Bantuan?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Jika mengalami situasi serupa, kami siap membantu.
              </p>
              <Link 
                to="/lapor" 
                className="block w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-secondary transition text-center text-sm"
              >
                Buat Laporan
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Artikel Lainnya</h2>
          <div className="text-center text-gray-600 py-12">
            <p className="text-sm">Kembali ke <Link to="/edukasi" className="text-primary hover:text-secondary font-semibold">Pusat Edukasi</Link> untuk artikel lainnya</p>
          </div>
        </div>
      </div>
    </div>
  );
}


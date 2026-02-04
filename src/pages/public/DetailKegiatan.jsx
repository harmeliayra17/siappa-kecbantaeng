import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function DetailKegiatan() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agenda_kegiatan')
          .select('id, judul_kegiatan, tanggal_pelaksanaan, waktu, lokasi, jenis_agenda, poster_url, deskripsi')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.judul_kegiatan,
          text: 'Lihat kegiatan ini di SI-APPA',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getCategoryColor = (category) => {
    return category === 'Perempuan' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-20 px-4 md:px-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-gray-600">Memuat kegiatan...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Kegiatan tidak ditemukan</p>
          <Link to="/agenda" className="text-primary hover:text-secondary font-semibold">
            Kembali ke Agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-20 px-6 md:px-8 font-sans bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/agenda" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium mb-12 text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" /> 
          Kembali
        </Link>

        {/* Main Content */}
        <div>
          {/* Category Badge */}
          <div className="mb-6">
            <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${getCategoryColor(event.jenis_agenda)}`}>
              {event.jenis_agenda}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 leading-tight">
            {event.judul_kegiatan}
          </h1>

          {/* Image and Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            {/* Left: Featured Image (3/4) */}
            {event.poster_url && (
              <div className="lg:col-span-3">
                <div className="w-full h-80 lg:h-96 overflow-hidden rounded-lg">
                  <img 
                    src={event.poster_url} 
                    alt={event.judul_kegiatan}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Right: Cards (1/4) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Tanggal Card */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  Tanggal
                </h3>
                <p className="text-gray-700 font-semibold text-sm">{formatDate(event.tanggal_pelaksanaan)}</p>
              </div>

              {/* Waktu Card */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-yellow-600" />
                  Waktu
                </h3>
                <p className="text-gray-700 font-semibold text-sm">{formatTime(event.waktu)} WIB</p>
              </div>

              {/* Lokasi Card */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-purple-600" />
                  Lokasi
                </h3>
                <p className="text-gray-700 font-semibold text-sm">{event.lokasi}</p>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="border-b border-gray-200 py-2 mb-12">
            <button 
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium text-sm"
            >
              <Share2 size={18} /> Bagikan
            </button>
          </div>

          {/* Event Body */}
          <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap mb-12">
            {event.deskripsi}
          </div>
        </div>
      </div>
    </div>
  );
}


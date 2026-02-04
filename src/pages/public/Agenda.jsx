import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [eventsByDate, setEventsByDate] = useState({});

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agenda_kegiatan')
          .select('id, judul_kegiatan, tanggal_pelaksanaan, waktu, lokasi, jenis_agenda, poster_url, deskripsi')
          .order('tanggal_pelaksanaan', { ascending: true });

        if (error) throw error;
        setEvents(data || []);

        // Group events by date
        const grouped = {};
        data?.forEach(event => {
          const date = new Date(event.tanggal_pelaksanaan).toISOString().split('T')[0];
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(event);
        });
        setEventsByDate(grouped);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
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

  // Filter events
  const filtered = events.filter(event => {
    const matchCategory = !selectedCategory || event.jenis_agenda === selectedCategory;
    return matchCategory;
  });

  // Get events for selected date
  const dateKey = selectedDate.toISOString().split('T')[0];
  const todaysEvents = eventsByDate[dateKey] || [];

  // Generate calendar
  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDayOfMonth = getFirstDayOfMonth(selectedDate);
  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
  }

  const hasEventOnDate = (date) => {
    if (!date) return false;
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey]?.length > 0;
  };

  return (
    <div className="min-h-screen pt-36 pb-12 px-6" style={{
      background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-3">Kalender Kegiatan</h1>
          <p className="text-lg text-body">Jadwal kegiatan pemberdayaan dan edukasi untuk perempuan dan anak</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-28">
              {/* Month Header */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={previousMonth} className="p-2 hover:bg-white/20 rounded-lg transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg">
                    {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 text-xs text-center">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                    <div key={day} className="py-2 font-semibold">
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && setSelectedDate(date)}
                      className={`aspect-square p-1 rounded-lg text-sm font-semibold transition ${
                        !date
                          ? 'text-gray-300'
                          : dateKey === date.toISOString().split('T')[0]
                          ? 'bg-primary text-white'
                          : hasEventOnDate(date)
                          ? 'bg-primary/20 text-primary border-2 border-primary hover:bg-primary/30'
                          : 'text-heading hover:bg-gray-100'
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition text-sm ${
                  !selectedCategory
                    ? 'bg-primary text-white'
                    : 'bg-white text-heading border border-gray-300 hover:border-primary'
                }`}
              >
                Semua Kegiatan
              </button>
              <button
                onClick={() => setSelectedCategory('Perempuan')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition text-sm ${
                  selectedCategory === 'Perempuan'
                    ? 'bg-primary text-white'
                    : 'bg-white text-heading border border-gray-300 hover:border-primary'
                }`}
              >
                Perempuan
              </button>
              <button
                onClick={() => setSelectedCategory('Anak')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition text-sm ${
                  selectedCategory === 'Anak'
                    ? 'bg-primary text-white'
                    : 'bg-white text-heading border border-gray-300 hover:border-primary'
                }`}
              >
                Anak
              </button>
            </div>

            {/* Selected Date Display */}
            <div className="bg-white rounded-xl p-6 border-l-4 border-primary">
              <p className="text-sm text-gray-600 mb-1">Tanggal Terpilih</p>
              <p className="text-xl font-bold text-heading">{formatDate(selectedDate)}</p>
            </div>

            {/* Events List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse mb-4 mx-auto"></div>
                <p className="text-gray-600">Memuat kegiatan...</p>
              </div>
            ) : todaysEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada kegiatan pada tanggal ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysEvents.map(event => (
                  <Link
                    key={event.id}
                    to={`/agenda/${event.id}`}
                    className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition cursor-pointer hover:-translate-y-1 border-l-4 border-primary block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-heading text-lg flex-1">{event.judul_kegiatan}</h3>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {event.jenis_agenda}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{formatTime(event.waktu)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.lokasi}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-3 line-clamp-2">{event.deskripsi}</p>
                  </Link>
                ))}
              </div>
            )}

            {/* All Events Section */}
            <div>
              <h3 className="font-bold text-lg text-heading mb-4">Semua Kegiatan ({filtered.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filtered.slice(0, 10).map(event => (
                  <Link
                    key={event.id}
                    to={`/agenda/${event.id}`}
                    className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition border-l-4 border-primary/50 block"
                  >
                    <p className="font-semibold text-heading">{event.judul_kegiatan}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(event.tanggal_pelaksanaan)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex justify-between items-start">
              <h2 className="text-2xl font-bold flex-1">{selectedEvent.judul_kegiatan}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Poster */}
              {selectedEvent.poster_url && (
                <img
                  src={selectedEvent.poster_url}
                  alt={selectedEvent.judul_kegiatan}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {/* Category Badge */}
              <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                <Users className="w-4 h-4 inline mr-1" />
                {selectedEvent.jenis_agenda}
              </div>

              {/* Details */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Tanggal</p>
                    <p className="text-heading font-semibold">{formatDate(selectedEvent.tanggal_pelaksanaan)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Waktu</p>
                    <p className="text-heading font-semibold">{formatTime(selectedEvent.waktu)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Lokasi</p>
                    <p className="text-heading font-semibold">{selectedEvent.lokasi}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-600 font-semibold mb-2">Deskripsi</p>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedEvent.deskripsi}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full btn-primary py-2 rounded-lg text-white font-semibold transition mt-4"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Shield, MapPin, Star, User, Camera, Package, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success'>('idle');

  useEffect(() => {
    fetch(`/api/locations/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleBooking = async () => {
    if (!selectedDates.start || !selectedDates.end) {
      alert("Please select both start and end dates.");
      return;
    }

    setBookingStatus('booking');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'admin-1', // Mocking current user
        serviceId: id,
        serviceType: 'location',
        startDate: selectedDates.start,
        endDate: selectedDates.end,
        totalPrice: project.pricePerDay // Simplified calc
      })
    });

    if (res.ok) {
      setBookingStatus('success');
      setTimeout(() => navigate('/bookings'), 2000);
    } else {
      setBookingStatus('idle');
      alert("Booking failed. Please try again.");
    }
  };

  if (loading) return <div className="pt-32 text-center text-zinc-500 font-serif">Loading masterpiece...</div>;
  if (!project) return <div className="pt-32 text-center text-zinc-500 font-serif text-2xl">Location listing not found.</div>;

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 pb-32">
      {/* Left Contents: Visuals & Info */}
      <div className="lg:col-span-2 space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-gold font-mono text-xs tracking-widest uppercase">
            <Package className="w-3 h-3" />
            Product Listing
          </div>
          <h1 className="text-5xl font-serif tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
              <span className="text-white font-bold">New</span>
              <span>(No reviews yet)</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>By {project.owner?.displayName}</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-4 h-[500px]">
          <div className="h-full rounded-3xl overflow-hidden bg-zinc-900">
            <img src={JSON.parse(project.photos || '[]')[0] || "https://picsum.photos/seed/cam1/800/800"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="grid grid-rows-2 gap-4 h-full">
            <div className="rounded-3xl overflow-hidden bg-zinc-900">
              <img src={JSON.parse(project.photos || '[]')[1] || "https://picsum.photos/seed/cam2/800/400"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-3xl overflow-hidden bg-zinc-900 relative">
              <img src={JSON.parse(project.photos || '[]')[2] || "https://picsum.photos/seed/cam3/800/400"} className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">View Gallery</div>
            </div>
          </div>
        </div>

        {/* Details & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif">Description</h3>
            <p className="text-zinc-400 leading-relaxed font-light">
              {project.description}
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-serif">Specifications</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "City", value: project.city },
                { label: "Type", value: project.type },
                { label: "Created", value: new Date(project.createdAt).toLocaleDateString() },
                { label: "Status", value: project.status }
              ].map(spec => (
                <div key={spec.label} className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-zinc-500 text-sm italic">{spec.label}</span>
                  <span className="text-sm font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="glass p-8 rounded-3xl border-l-4 border-brand-gold space-y-4">
          <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
            <Shield className="w-4 h-4 text-brand-gold" />
            No-Show & Damage Policy
          </div>
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            All models and crew are subject to a failure-to-attend penalty. 
            For equipment rentals, high-resolution evidence photos are required 
            at pickup and return. Any damages found will be charged according to 
            the rental contract terms.
          </p>
        </div>
      </div>

      {/* Right Contents: Booking Widget */}
      <div className="space-y-6">
        <div className="glass p-8 rounded-3xl sticky top-24 border border-white/10 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-3xl font-mono font-bold">${project.pricePerDay}</span>
              <span className="text-zinc-500 font-light ml-1">/ day</span>
            </div>
            <div className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">Available Now</div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pick-up Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-gold outline-none transition-colors"
                  onChange={(e) => setSelectedDates(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Return Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-gold outline-none transition-colors"
                  onChange={(e) => setSelectedDates(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <button 
            disabled={bookingStatus !== 'idle'}
            onClick={handleBooking}
            className={cn(
              "w-full py-4 text-black font-bold rounded-2xl transition-all shadow-2xl shadow-brand-gold/10 active:scale-95",
              bookingStatus === 'success' ? 'bg-green-500' : 'bg-brand-gold hover:bg-brand-gold/90'
            )}
          >
            {bookingStatus === 'idle' ? 'Request Booking' : bookingStatus === 'booking' ? 'Processing...' : 'Booking Confirmed!'}
          </button>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <button 
              onClick={() => setShowEvidenceUpload(!showEvidenceUpload)}
              className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>Evidence Submission (Company Only)</span>
              <Camera className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showEvidenceUpload && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/20 text-center cursor-pointer hover:bg-white/10 transition-colors">
                    <Camera className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Upload Check-in Photos</span>
                  </div>
                  <textarea 
                    placeholder="Describe equipment status..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-gold h-20"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest justify-center">
            <Clock className="w-3 h-3" />
            24h Response Time
          </div>
        </div>
      </div>
    </div>
  );
}

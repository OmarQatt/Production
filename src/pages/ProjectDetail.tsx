import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, Shield, MapPin, Star, User, Camera, Info, 
  CheckCircle2, ArrowRight, Package, Heart, Share2, MessageCircle, AlertCircle, ChevronRight 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import CustomCalendar from '../components/CustomCalendar';
import ShareModal from '../components/ShareModal';
import NegotiateModal from '../components/NegotiateModal';
import { differenceInDays, format } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success'>('idle');

  const userId = 'admin-1'; // Mocking current user

  const duration = useMemo(() => {
    if (selectedRange.start && selectedRange.end) {
      return differenceInDays(selectedRange.end, selectedRange.start) + 1;
    }
    return 0;
  }, [selectedRange]);

  const totalPrice = useMemo(() => {
    if (!project) return 0;
    return (duration || 1) * project.pricePerDay;
  }, [project, duration]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error('Could not retrieve service details.');
        const data = await res.json();
        setProject(data);

        // Fetch Favorite Status
        const favRes = await fetch(`/api/favorites/status?userId=${userId}&targetId=${id}`);
        const favData = await favRes.json();
        setIsFavorited(favData.favorited);

        // Fetch Related Items
        const relRes = await fetch(`/api/services/${id}/related?serviceType=${data.serviceType}&type=${data.type}`);
        const relData = await relRes.json();
        setRelatedItems(relData);

      } catch (err: any) {
        setFetchError(err.message || 'An unexpected production error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetId: id, targetType: project.serviceType })
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch (err) {
      console.error('Failed to toggle favorite');
    }
  };

  const handleBooking = async () => {
    if (!selectedRange.start || !selectedRange.end) {
      alert("Please select a date range on the calendar.");
      return;
    }

    setBookingStatus('booking');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'admin-1', // Mocking current user
        serviceId: id,
        serviceType: project.serviceType,
        startDate: selectedRange.start.toISOString(),
        endDate: selectedRange.end.toISOString(),
        totalPrice: totalPrice
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

  if (loading) return (
    <div className="pt-32 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-brand-gold/10 border-t-brand-gold rounded-full animate-spin" />
      <span className="text-zinc-500 font-serif lowercase italic">Developing capture...</span>
    </div>
  );

  if (fetchError || !project) return (
    <div className="pt-32 px-6 max-w-lg mx-auto text-center space-y-8">
      <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
         <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-serif">Selection Not Found</h2>
        <p className="text-zinc-500 font-light italic">{fetchError || 'The requested listing is no longer available in the pool.'}</p>
      </div>
      <button 
        onClick={() => navigate('/discovery')}
        className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs uppercase font-bold tracking-widest hover:bg-white/10 transition-colors"
      >
        Return to Discovery
      </button>
    </div>
  );

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto pb-32">
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={window.location.href}
        title={project.name}
      />
      
      <NegotiateModal 
        isOpen={showNegotiateModal}
        onClose={() => setShowNegotiateModal(false)}
        service={project}
        onSuccess={() => {}}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Contents: Visuals & Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-gold font-mono text-xs tracking-widest uppercase">
                <Package className="w-3 h-3" />
                {project.serviceType} Listing
              </div>
              <h1 className="text-5xl font-serif tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                  <span className="text-white font-bold">4.8</span>
                  <span>(12 Verified)</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>By {project.owner?.displayName || 'Studio Admin'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={toggleFavorite}
                className={cn(
                  "p-4 rounded-2xl border transition-all active:scale-90",
                  isFavorited ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all active:scale-90"
              >
                <Share2 className="w-5 h-5" />
              </button>
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
                { label: "City", value: project.city || 'Global' },
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

        {/* Reviews Section */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="text-2xl font-serif">Community Reviews</h3>
              <div className="flex items-center gap-2">
                 <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                       <Star key={star} className={cn("w-4 h-4", star <= (project.reviews?.reduce((acc: any, r: any) => acc + r.rating, 0) / (project.reviews?.length || 1) || 0) ? "text-brand-gold fill-brand-gold" : "text-zinc-800")} />
                    ))}
                 </div>
                 <span className="text-sm font-bold">{project.reviews?.length || 0} Reviews</span>
              </div>
           </div>

           <div className="space-y-6">
              {project.reviews?.length === 0 ? (
                 <p className="text-zinc-500 italic py-4">No reviews yet. Be the first to experience this service.</p>
              ) : (
                 project.reviews.map((review: any) => (
                    <div key={review.id} className="glass p-6 rounded-3xl space-y-3 relative overflow-hidden group">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                                <User className="w-5 h-5 text-zinc-500" />
                             </div>
                             <div>
                                <div className="text-sm font-bold">{review.authorName}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-1 bg-brand-gold/10 px-2 py-1 rounded-lg">
                             <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                             <span className="text-xs font-mono font-bold text-brand-gold">{review.rating}</span>
                          </div>
                       </div>
                       <p className="text-sm text-zinc-300 font-light leading-relaxed pl-13">
                          "{review.comment}"
                       </p>
                       <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 ))
              )}
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
        <div className="glass p-8 rounded-[2.5rem] sticky top-24 border border-white/10 space-y-8 shadow-2xl shadow-brand-gold/5">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-3xl font-mono font-bold">${project.pricePerDay}</span>
              <span className="text-zinc-500 font-light ml-1">/ day</span>
            </div>
            <div className="text-xs text-green-500 font-bold bg-green-500/10 px-3 py-1 transparent-border rounded-full flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               Instant Booking
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Select Production Schedule</label>
              <CustomCalendar 
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
              />
            </div>

            <AnimatePresence mode="wait">
              {selectedRange.start && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between glass p-4 rounded-2xl border-white/5 bg-white/[0.02]">
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase font-bold text-zinc-500">Duration</div>
                      <div className="text-sm font-mono text-white flex items-center gap-2">
                         {duration || '1'} {duration === 1 ? 'Day' : 'Days'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-700" />
                    <div className="text-right space-y-1">
                      <div className="text-[9px] uppercase font-bold text-zinc-500">Estimate</div>
                      <div className="text-sm font-mono text-brand-gold font-bold">${totalPrice}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="glass p-3 rounded-xl border-white/5">
                        <div className="text-[8px] uppercase font-bold text-zinc-600 mb-1">Pick-up</div>
                        <div className="text-[11px] font-mono text-zinc-300 italic">{format(selectedRange.start, 'MMM dd, yyyy')}</div>
                     </div>
                     <div className="glass p-3 rounded-xl border-white/5">
                        <div className="text-[8px] uppercase font-bold text-zinc-600 mb-1">Return</div>
                        <div className="text-[11px] font-mono text-zinc-300 italic">
                          {selectedRange.end ? format(selectedRange.end, 'MMM dd, yyyy') : '...'}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            disabled={bookingStatus !== 'idle'}
            onClick={handleBooking}
            className={cn(
              "w-full py-5 text-black font-black uppercase text-xs tracking-widest rounded-3xl transition-all shadow-2xl active:scale-95 group relative overflow-hidden",
              bookingStatus === 'success' ? 'bg-green-500' : 'bg-brand-gold hover:translate-y-[-2px] hover:shadow-brand-gold/20'
            )}
          >
            <span className="relative z-10">
              {bookingStatus === 'idle' ? 'Request Studio Lock-in' : bookingStatus === 'booking' ? 'Securing Dates...' : 'Dates Confirmed!'}
            </span>
            <motion.div 
              className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
            />
          </button>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <button 
              onClick={() => setShowEvidenceUpload(!showEvidenceUpload)}
              className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              <span>Evidence Submission</span>
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
                  <div className="p-6 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 text-center cursor-pointer hover:bg-white/5 transition-colors group">
                    <Camera className="w-6 h-6 mx-auto mb-2 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    <span className="text-[9px] uppercase font-bold text-zinc-500">Attach Condition Report</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] justify-center italic">
            <Shield className="w-3 h-3 text-zinc-700" />
            Certified CinePro Listing
          </div>

          <button 
            onClick={() => setShowNegotiateModal(true)}
            className="w-full py-4 border border-white/5 bg-white/[0.02] text-zinc-500 rounded-3xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
             <MessageCircle className="w-4 h-4" />
             Negotiate Studio Rate
          </button>
        </div>
      </div>
    </div>

      {/* Related Items Section */}
      <div className="col-span-1 lg:col-span-3 pt-12 border-t border-white/5 space-y-8">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-3xl font-serif">Related Essentials</h3>
              <p className="text-zinc-500 text-sm font-light">Similar professional results based on your current selection.</p>
           </div>
           <button 
             onClick={() => navigate('/discovery')}
             className="text-[10px] font-black uppercase tracking-widest text-brand-gold hover:underline flex items-center gap-2"
           >
              Explore All <ChevronRight className="w-3 h-3" />
           </button>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-8 no-scrollbar scroll-smooth snap-x">
           {relatedItems.length === 0 ? (
              <div className="w-full text-center py-12 text-zinc-500 italic font-serif">Calculating similar masterpieces...</div>
           ) : (
              relatedItems.map((item: any) => (
                <Link 
                  to={`/project/${item.id}`} 
                  key={item.id}
                  className="min-w-[320px] glass rounded-[2.5rem] overflow-hidden group snap-start"
                >
                  <div className="h-48 bg-zinc-900 relative">
                     <img 
                       src={JSON.parse(item.photos || '[]')[0] || `https://picsum.photos/seed/rel${item.id}/600/400`}
                       className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                       referrerPolicy="no-referrer"
                     />
                     <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase">
                        ${item.pricePerDay}/day
                     </div>
                  </div>
                  <div className="p-6">
                     <h4 className="text-lg font-serif group-hover:text-brand-gold transition-colors truncate">{item.name}</h4>
                     <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {item.city || 'Global'}
                     </p>
                  </div>
                </Link>
              ))
           )}
        </div>
      </div>
    </div>
  );
}

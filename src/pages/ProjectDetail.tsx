import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Shield, MapPin, Star, User, Camera, Info, CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import CustomCalendar from '../components/CustomCalendar';
import { differenceInDays, format } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success'>('idle');

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
    fetch(`/api/services/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
        </div>
      </div>
    </div>
  );
}

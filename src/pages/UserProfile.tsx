import { useState, useEffect } from 'react';
import { User, Mail, Shield, MapPin, Calendar, Package, Camera, Settings, LogOut, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

  const fetchUser = () => {
    // Mocking current user ID as admin-1
    fetch('/api/users/admin-1')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <div className="pt-32 text-center text-zinc-500 font-serif">Loading your studio...</div>;
  if (!user) return <div className="pt-32 text-center text-zinc-500 font-serif text-2xl">Studio profile not found.</div>;

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto pb-32">
      {/* Review Modal */}
      <ReviewModal 
        isOpen={!!selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
        onSuccess={fetchUser}
      />

      {/* Profile Header */}
      <div className="glass rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-2 border-brand-gold/20 overflow-hidden flex items-center justify-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-16 h-16 text-zinc-700" />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-brand-gold text-black p-2 rounded-xl shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-4xl font-serif">{user.displayName}</h1>
              <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-brand-gold/20 self-center">
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-500 text-sm font-mono mt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <button className="bg-white/5 border border-white/10 hover:border-brand-gold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
            <button className="bg-white/5 border border-white/10 hover:text-red-500 hover:border-red-500/50 px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-4">
          <div className="glass p-4 rounded-2xl text-center">
            <div className="text-2xl font-mono font-bold">{user.listings?.length || 0}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Listings</div>
          </div>
          <div className="glass p-4 rounded-2xl text-center">
            <div className="text-2xl font-mono font-bold">{user.bookings?.length || 0}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Bookings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex gap-8 border-b border-white/5 overflow-x-auto pb-px">
          <button 
            onClick={() => setActiveTab('listings')}
            className={cn(
              "text-sm font-bold uppercase tracking-widest pb-4 border-b-2 transition-all whitespace-nowrap",
              activeTab === 'listings' ? "border-brand-gold text-white" : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            My Listings
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={cn(
              "text-sm font-bold uppercase tracking-widest pb-4 border-b-2 transition-all whitespace-nowrap",
              activeTab === 'bookings' ? "border-brand-gold text-white" : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            My Reservations
          </button>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'listings' && (
            <>
              {user.listings?.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-3xl">
                  <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 italic">No studio listings found.</p>
                  <Link to="/admin" className="text-brand-gold text-sm hover:underline mt-4 inline-block">Post your first listing</Link>
                </div>
              ) : (
                user.listings.map((loc: any) => (
                  <Link 
                    to={`/project/${loc.id}`}
                    key={loc.id} 
                    className="glass rounded-3xl overflow-hidden group hover:border-brand-gold/50 transition-colors"
                  >
                    <div className="h-48 bg-zinc-900 relative">
                      <img 
                        src={JSON.parse(loc.photos || '[]')[0] || `https://picsum.photos/seed/prod${loc.id}/800/600`} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] font-mono tracking-widest uppercase">
                        {loc.status}
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                       <h4 className="text-xl font-bold truncate">{loc.name}</h4>
                       <p className="text-zinc-500 text-xs flex items-center gap-2">
                         <MapPin className="w-3 h-3" />
                         {loc.city}
                       </p>
                    </div>
                  </Link>
                ))
              )}
            </>
          )}

          {activeTab === 'bookings' && (
            <div className="col-span-full space-y-4">
              {user.bookings?.length === 0 ? (
                <div className="py-20 text-center glass rounded-3xl">
                  <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 italic">No reservation history found.</p>
                </div>
              ) : (
                user.bookings.map((booking: any) => (
                  <div key={booking.id} className="glass p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                          {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                        <h4 className="text-lg font-serif">Production Booking</h4>
                        <div className="text-xs text-zinc-500">Service ID: {booking.serviceId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xl font-mono font-bold">${booking.totalPrice}</div>
                        <div className="text-[10px] uppercase text-zinc-500">Total Price</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                          booking.status === 'PENDING' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                        )}>
                          {booking.status}
                        </div>
                        <button 
                          onClick={() => setSelectedBookingForReview(booking)}
                          className="text-[10px] font-bold text-brand-gold uppercase hover:underline flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          Rate Service
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

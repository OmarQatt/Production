import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Camera, MapPin, Users, Package, Home, Search, Calendar, User, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import ProjectDetail from './pages/ProjectDetail';
import ModelSearch from './pages/ModelSearch';

// Placeholder Pages
const HomePage = () => (
  <div className="pt-24 px-6 max-w-7xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-center"
    >
      <h1 className="text-6xl md:text-8xl font-serif tracking-tighter leading-tight">
        Production <span className="text-brand-gold italic">Excellence.</span>
      </h1>
      <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
        The elite marketplace for locations, equipment, talent, and crew. 
        Facilitating world-class cinema from concept to capture.
      </p>
      <div className="flex gap-4 justify-center pt-8">
        <Link to="/discovery" className="px-8 py-3 bg-brand-gold text-black font-semibold rounded-full hover:scale-105 transition-transform">
          Discover Services
        </Link>
        <Link to="/register" className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors">
          Join the Directory
        </Link>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-32">
      {[
        { icon: MapPin, title: "Locations", desc: "Vetted interior and exterior filming spaces.", path: "/discovery" },
        { icon: Package, title: "Equipment", desc: "Top-tier camera and lighting rentals.", path: "/project/1" },
        { icon: Users, title: "Talent", desc: "Professional models and casting profiles.", path: "/talent" },
        { icon: Camera, title: "Crew", desc: "Experienced DP, ACs, and photographers.", path: "/talent" }
      ].map((feature, i) => (
        <Link 
          to={feature.path}
          key={feature.title}
          className="glass p-8 rounded-3xl space-y-4 hover:border-brand-gold/30 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <feature.icon className="w-10 h-10 text-brand-gold mb-4" />
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-zinc-500 text-sm">{feature.desc}</p>
          </motion.div>
        </Link>
      ))}
    </div>
  </div>
);

const DiscoveryPage = () => {
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setDbStatus('connected');
      })
      .catch(() => setDbStatus('error'));
  }, []);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-serif">Discovery <span className="text-zinc-500 text-xl font-sans ml-4">Explore the ecosystem</span></h2>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500')} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Database: {dbStatus}</span>
          </div>
        </div>
        <div className="flex gap-2">
        {["Locations", "Equipment", "Models", "Crew"].map(cat => (
          <button key={cat} className="px-4 py-2 rounded-full border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-all text-sm">
            {cat}
          </button>
        ))}
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {locations.length === 0 && dbStatus === 'connected' && (
        <div className="col-span-full py-20 text-center glass rounded-3xl">
          <p className="text-zinc-500 italic">No listings found in the database. Use the admin console to add one.</p>
        </div>
      )}
      {locations.map(loc => (
        <Link 
          to={`/project/${loc.id}`}
          key={loc.id} 
          className="glass rounded-3xl overflow-hidden group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="h-64 bg-zinc-900 relative">
            <img 
              src={JSON.parse(loc.photos)[0] || `https://picsum.photos/seed/prod${loc.id}/800/600`} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-mono tracking-widest uppercase">
              {loc.status}
            </div>
          </div>
          <div className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xl font-bold truncate pr-4">{loc.name}</h4>
              <span className="text-brand-gold font-mono">${loc.pricePerDay}/day</span>
            </div>
            <p className="text-zinc-500 text-sm line-clamp-2">{loc.description}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-400 pt-4">
              <MapPin className="w-3 h-3" />
              <span>{loc.city} • Owned by {loc.owner?.displayName}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
  );
};

const AdminDashboard = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '', city: '', pricePerDay: '', description: '', address: '', type: 'Interior'
  });

  const fetchListings = () => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setListings(data));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const mockUser = { id: 'admin-1' }; 
    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, ownerId: mockUser.id, photos: [] })
    });
    if (res.ok) {
      setIsAdding(false);
      fetchListings();
    }
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-brand-gold" />
          <h2 className="text-3xl font-bold tracking-tight">Admin Console</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-gold text-black px-6 py-2 rounded-full font-bold text-sm"
        >
          + Add New Location
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="glass p-8 rounded-3xl w-full max-w-md space-y-6"
            >
              <h3 className="text-2xl font-serif">Post New Listing</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Location Name" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand-gold" onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="City" className="bg-white/5 border border-white/10 p-3 rounded-xl" onChange={e => setFormData({...formData, city: e.target.value})} />
                  <input required type="number" placeholder="$/Day" className="bg-white/5 border border-white/10 p-3 rounded-xl" onChange={e => setFormData({...formData, pricePerDay: e.target.value})} />
                </div>
                <input required placeholder="Detailed Address" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl" onChange={e => setFormData({...formData, address: e.target.value})} />
                <textarea required placeholder="Description" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl h-24" onChange={e => setFormData({...formData, description: e.target.value})} />
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-brand-gold text-black font-bold rounded-xl">Create Listing</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass p-6 rounded-2xl border-l-4 border-yellow-500">
        <h4 className="text-zinc-500 uppercase text-xs font-bold tracking-wider mb-2">Pending Listings</h4>
        <div className="text-3xl font-mono">{listings.filter(l => l.status === 'PENDING').length}</div>
      </div>
      <div className="glass p-6 rounded-2xl border-l-4 border-green-500">
        <h4 className="text-zinc-500 uppercase text-xs font-bold tracking-wider mb-2">Active Listings</h4>
        <div className="text-3xl font-mono">{listings.filter(l => l.status === 'ACTIVE').length}</div>
      </div>
      <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
        <h4 className="text-zinc-500 uppercase text-xs font-bold tracking-wider mb-2">Total Listings</h4>
        <div className="text-3xl font-mono">{listings.length}</div>
      </div>
    </div>
    
    <div className="glass rounded-3xl overflow-hidden mt-8">
      <table className="w-full text-left">
        <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] font-bold tracking-widest text-zinc-500">
          <tr>
            <th className="p-4">Owner</th>
            <th className="p-4">Listing Name</th>
            <th className="p-4">City</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {listings.map(loc => (
            <tr key={loc.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4">{loc.owner?.displayName}</td>
              <td className="p-4">{loc.name}</td>
              <td className="p-4">{loc.city}</td>
              <td className="p-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] uppercase font-bold",
                  loc.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                )}>
                  {loc.status}
                </span>
              </td>
            </tr>
          ))}
          {listings.length === 0 && (
            <tr><td colSpan={4} className="p-8 text-center text-zinc-500 italic">No listings records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto space-y-12 pb-32">
      <div className="space-y-4">
        <h2 className="text-4xl font-serif">Your Bookings</h2>
        <p className="text-zinc-500">Track and manage your film production reservations.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bookings.length === 0 && (
          <div className="col-span-full py-24 text-center glass rounded-3xl">
            <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 italic">No bookings found yet. Go to discovery to start planning.</p>
          </div>
        )}
        {bookings.map(b => (
          <div key={b.id} className="glass p-8 rounded-3xl border-l-4 border-brand-gold flex justify-between items-center group">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-zinc-500">
                <Calendar className="w-3 h-3" />
                {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
              </div>
              <h4 className="text-xl font-bold">Booking for {b.serviceType}</h4>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-zinc-400">
                  <User className="w-3 h-3" />
                  Request by Admin
                </div>
                <div className="text-brand-gold font-mono">${b.totalPrice}</div>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
              b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}>
              {b.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-dark overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-brand-dark/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Camera className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tighter">CINE<span className="text-brand-gold italic">PRO</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <Link to="/discovery" className="hover:text-white transition-colors">Marketplace</Link>
              <Link to="/bookings" className="hover:text-white transition-colors">Bookings</Link>
              <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
                <span className="text-sm hidden sm:inline">My Studio</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discovery" element={<DiscoveryPage />} />
          <Route path="/talent" element={<ModelSearch />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<div className="pt-32 text-center text-zinc-500 font-serif text-3xl">Coming soon...</div>} />
        </Routes>

        {/* Footer */}
        <footer className="mt-32 border-t border-white/5 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-zinc-500 font-mono tracking-widest">
              © 2026 CINEPRO MARKETPLACE
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-600">
              <a href="#" className="hover:text-brand-gold">Policies</a>
              <a href="#" className="hover:text-brand-gold">Support</a>
              <a href="#" className="hover:text-brand-gold">Careers</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

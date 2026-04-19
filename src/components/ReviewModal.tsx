import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, booking, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: booking.serviceId,
          authorId: booking.clientId,
          authorName: 'Verified User', // In real app, fetch from state/context
          rating,
          comment
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto">
                   <Star className="w-10 h-10 text-brand-gold fill-brand-gold" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif">Rate your experience</h3>
                  <p className="text-zinc-500 text-sm italic font-light mt-1">
                    Your feedback helps the CinePro community thrive.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star 
                          className={cn(
                            "w-8 h-8 transition-colors", 
                            s <= rating ? "text-brand-gold fill-brand-gold" : "text-zinc-800"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
                    {rating === 5 ? 'Masterpiece' : rating === 4 ? 'Professional' : rating === 3 ? 'Standard' : rating === 2 ? 'Subpar' : 'Critical Failure'}
                  </span>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Comments</label>
                   <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-zinc-600 group-focus-within:text-brand-gold transition-colors" />
                      <textarea 
                        required
                        placeholder="Tell us about the equipment quality, location accessibility or professional level..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 h-32 focus:border-brand-gold outline-none transition-all text-sm font-light resize-none"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                   </div>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-brand-gold text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? 'Submitting Feedback...' : (
                    <>
                      <Send className="w-4 h-4" />
                      Publish Review
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Accent Blur */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-gold/10 blur-[100px] -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

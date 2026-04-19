import React, { useState } from 'react';
import { X, MessageSquare, Send, DollarSign, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface NegotiateModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onSuccess: () => void;
}

export default function NegotiateModal({ isOpen, onClose, service, onSuccess }: NegotiateModalProps) {
  const [formData, setFormData] = useState({
    priceOffer: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'admin-1', // Mocking current user
          receiverId: service.ownerId || service.companyId,
          targetId: service.id,
          content: formData.content,
          priceOffer: formData.priceOffer
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        alert('Negotiation request sent to the owner.');
      } else {
        alert('Failed to send negotiation request');
      }
    } catch (err) {
      alert('Error sending message');
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
            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="glass w-full max-w-lg rounded-[3rem] p-10 relative overflow-hidden border-white/5"
          >
            <button onClick={onClose} className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-10">
              <div className="space-y-4 text-center">
                <div className="w-20 h-20 bg-brand-gold/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-brand-gold/10">
                   <DollarSign className="w-10 h-10 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif">Negotiate Terms</h3>
                  <p className="text-zinc-500 text-sm font-light mt-2 max-w-xs mx-auto">
                    Propose a custom price or duration for your specific production needs.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Your Price Offer (Optional)</label>
                   <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-brand-gold transition-colors" />
                      <input 
                        type="number"
                        placeholder={`Standard: $${service.pricePerDay}/day`}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-brand-gold outline-none transition-all text-sm font-light"
                        value={formData.priceOffer}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceOffer: e.target.value }))}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Message to Owner</label>
                   <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-zinc-600 group-focus-within:text-brand-gold transition-colors" />
                      <textarea 
                        required
                        placeholder="Explain your production requirements or why you're proposing this rate..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 h-32 focus:border-brand-gold outline-none transition-all text-sm font-light resize-none"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      />
                   </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-600 italic px-2">
                   <Sparkles className="w-3 h-3 text-brand-gold" />
                   Professional negotiation requests have a 40% higher acceptance rate.
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-brand-gold text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? 'Securely Sending...' : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Private Offer
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

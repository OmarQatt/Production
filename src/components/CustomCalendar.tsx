import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isWithinInterval,
  isBefore,
  startOfToday
} from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CustomCalendarProps {
  selectedRange: { start: Date | null; end: Date | null };
  onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

export default function CustomCalendar({ selectedRange, onRangeChange }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      onRangeChange({ start: day, end: null });
    } else if (selectedRange.start && !selectedRange.end) {
      if (isBefore(day, selectedRange.start)) {
        onRangeChange({ start: day, end: null });
      } else {
        onRangeChange({ start: selectedRange.start, end: day });
      }
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] font-bold uppercase text-zinc-600 py-2">
          {dateNames[i]}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isSelected = (selectedRange.start && isSameDay(day, selectedRange.start)) || 
                           (selectedRange.end && isSameDay(day, selectedRange.end));
        
        const isInRange = selectedRange.start && selectedRange.end && 
                          isWithinInterval(day, { start: selectedRange.start, end: selectedRange.end });

        const isToday = isSameDay(day, today);
        const isPast = isBefore(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-10 flex items-center justify-center text-xs cursor-pointer transition-all z-10",
              !isCurrentMonth ? "text-zinc-800" : "text-zinc-400",
              isPast && "cursor-not-allowed opacity-30",
              isInRange && !isSelected && "bg-brand-gold/10 text-brand-gold",
              isSelected && "text-black font-black"
            )}
            onClick={() => handleDateClick(cloneDay)}
          >
            {/* Selection Circle/Background */}
            {isSelected && (
              <motion.div 
                layoutId="day-selection"
                className="absolute inset-1.5 bg-brand-gold rounded-lg -z-10"
              />
            )}
            
            {/* Range Background */}
            {isInRange && !isSelected && (
              <div className="absolute inset-y-1.5 inset-x-0 bg-brand-gold/10 -z-10" />
            )}

            <span className={cn(
               isToday && !isSelected && "border-b-2 border-brand-gold/50"
            )}>
              {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 ">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-grid">{rows}</div>;
  };

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 backdrop-blur-sm self-start shadow-xl">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[10px] font-bold uppercase tracking-tighter text-zinc-500">
        <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-brand-gold" />
           Selection
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-brand-gold/20" />
           Duration
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full border border-brand-gold/50" />
           Today
        </div>
      </div>
    </div>
  );
}

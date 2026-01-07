
import React, { useState, useMemo } from 'react';
import { Booking, RatesConfig } from '../types';
import { OPERATING_HOURS, ICON_CALENDAR } from '../constants';
import { formatTime, getRateType, formatCurrency, formatDisplayDate } from '../utils/pricing';

interface DashboardProps {
  bookings: Booking[];
  onNewBooking: (data?: { date: string; start: number; end: number }) => void;
  rates: RatesConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, onNewBooking, rates }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const filteredBookings = useMemo(() => 
    bookings.filter(b => b.date === selectedDate),
    [bookings, selectedDate]
  );

  const rateType = getRateType(selectedDate, rates.holidayDates);

  const dailyStats = useMemo(() => {
    const revenue = filteredBookings.reduce((sum, b) => sum + b.amount, 0);
    const hours = filteredBookings.reduce((sum, b) => sum + b.totalHours, 0);
    return { revenue, hours, count: filteredBookings.length };
  }, [filteredBookings]);

  const getSlotDetails = (hour: number) => {
    return filteredBookings.find(b => hour >= b.startTime && hour < b.endTime);
  };

  const handleSlotClick = (hour: number, booked: boolean) => {
    if (booked) return;
    if (activeSlot === hour) {
      onNewBooking({ date: selectedDate, start: hour, end: hour + 1 });
    } else {
      setActiveSlot(hour);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selector & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="glass p-6 rounded-[2.5rem] md:col-span-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-400 opacity-80">{ICON_CALENDAR}</span>
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Select Date</label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Custom Date Trigger Card */}
            <div className="date-input-container relative bg-slate-50 border border-slate-100/50 rounded-3xl w-full sm:w-auto min-w-[240px] px-6 py-4 hover:bg-slate-100 transition-all group">
              <div className="flex items-center justify-between pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {formatDisplayDate(selectedDate)}
                </span>
                <span className="text-slate-200 group-hover:text-slate-300 transition-colors ml-4">
                  {ICON_CALENDAR}
                </span>
              </div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setActiveSlot(null);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
            </div>

            <div className="flex gap-2">
              <span className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm border ${
                rateType === 'Holiday' ? 'bg-red-500/10 text-red-600 border-red-100' : 
                rateType === 'Weekend' ? 'bg-purple-500/10 text-purple-600 border-purple-100' : 
                'bg-blue-600/10 text-blue-700 border-blue-100'
              }`}>
                {rateType} Rates
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] md:col-span-4 text-white flex flex-col justify-between shadow-xl shadow-slate-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Summary</span>
            <div className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
              {dailyStats.count} Slots
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black">{formatCurrency(dailyStats.revenue)}</span>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">
              Generated Revenue
            </p>
          </div>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-slate-800 text-lg">Hourly Slots</h3>
          <p className="text-xs text-slate-400 font-medium italic">Click available slot to book</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {OPERATING_HOURS.map(hour => {
            const booking = getSlotDetails(hour);
            const isBooked = !!booking;
            const isActive = activeSlot === hour;
            
            return (
              <button
                key={hour}
                disabled={isBooked}
                onClick={() => handleSlotClick(hour, isBooked)}
                className={`
                  relative p-5 rounded-[2rem] text-left transition-all duration-300 group
                  ${isBooked ? 'bg-slate-100 border border-slate-200 cursor-not-allowed opacity-80' : 
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02] z-10' : 
                    'glass hover:bg-white hover:shadow-md hover:scale-[1.02] border border-white/50'}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-black ${isBooked ? 'text-slate-400' : isActive ? 'text-blue-100' : 'text-slate-800'}`}>
                    {formatTime(hour)}
                  </span>
                  {!isBooked && !isActive && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  )}
                </div>

                {isBooked ? (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{booking.customerName}</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Occupied</p>
                  </div>
                ) : isActive ? (
                  <div className="mt-2 flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest animate-bounce">Selected</span>
                    <span className="text-[10px] opacity-70 font-medium">Tap to confirm</span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest group-hover:text-emerald-500">Available</p>
                    <p className="text-[10px] font-medium text-slate-400">1 Hour Slot</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend / Info */}
      <div className="flex flex-wrap gap-4 px-2 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

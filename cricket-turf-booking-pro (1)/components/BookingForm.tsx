
import React, { useState, useMemo, useEffect } from 'react';
import { Booking, RatesConfig } from '../types';
import { OPERATING_HOURS, ICON_CALENDAR } from '../constants';
import { calculatePrice, formatCurrency, formatTime, formatDisplayDate } from '../utils/pricing';
import { syncBookingToSheets } from '../services/googleSheetsService';

interface BookingFormProps {
  bookings: Booking[];
  rates: RatesConfig;
  onAdd: (booking: Booking) => void;
  onCancel: () => void;
  prefillData: { date: string; start: number; end: number } | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ bookings, rates, onAdd, onCancel, prefillData }) => {
  const [formData, setFormData] = useState({
    date: prefillData?.date || new Date().toISOString().split('T')[0],
    customerName: '',
    phone: '',
    start: prefillData?.start || 18, // Default 6 PM
    end: prefillData?.end || 19,
    discount: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        date: prefillData.date,
        start: prefillData.start,
        end: prefillData.end
      }));
    }
  }, [prefillData]);

  const pricing = useMemo(() => {
    return calculatePrice(formData.date, formData.start, formData.end, rates, formData.discount);
  }, [formData, rates]);

  // Derive actual hourly rate for the "Price" field display
  const currentHourlyRate = useMemo(() => {
    if (pricing.rateType === 'Holiday') return rates.holidayRate;
    if (pricing.rateType === 'Weekend') return rates.weekendRate;
    return rates.baseRate;
  }, [pricing.rateType, rates]);

  const isConflict = useMemo(() => {
    const existingOnDate = bookings.filter(b => b.date === formData.date);
    return existingOnDate.some(b => {
      return (formData.start < b.endTime && formData.end > b.startTime);
    });
  }, [formData, bookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConflict) return;
    
    setIsSubmitting(true);
    
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      date: formData.date,
      customerName: formData.customerName,
      phone: formData.phone,
      startTime: formData.start,
      endTime: formData.end,
      totalHours: pricing.totalHours,
      amount: pricing.amount,
      rateType: pricing.rateType,
      discountApplied: formData.discount
    };

    await syncBookingToSheets(newBooking, rates.googleScriptUrl);
    
    onAdd(newBooking);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onCancel} className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Booking</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass p-6 rounded-[2.5rem] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-slate-400 scale-75 transform origin-left">{ICON_CALENDAR}</span>
                 <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Booking Date</label>
              </div>
              <div className="date-input-container relative bg-slate-100/50 rounded-2xl px-5 py-3 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                <span className="text-lg font-black text-slate-800">{formatDisplayDate(formData.date)}</span>
                <span className="text-slate-300">{ICON_CALENDAR}</span>
                <input 
                  type="date" 
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  value={formData.date}
                  onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Price</label>
              <div className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-5 py-3.5 font-black text-blue-600">
                {formatCurrency(currentHourlyRate)} / hr ({pricing.rateType})
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Customer Name</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Bhargav"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-slate-900 font-bold placeholder-slate-300 transition-all"
              value={formData.customerName}
              onChange={e => setFormData(p => ({ ...p, customerName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Contact Number</label>
            <input 
              type="tel" 
              placeholder="+91 00000 00000 (Optional)"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-slate-900 font-bold placeholder-slate-300 transition-all"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Slot Start</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none text-slate-900 font-black cursor-pointer appearance-none"
                value={formData.start}
                onChange={e => setFormData(p => {
                  const val = parseInt(e.target.value);
                  return { ...p, start: val, end: val + 1 };
                })}
              >
                {OPERATING_HOURS.slice(0, -1).map(h => (
                  <option key={h} value={h}>{formatTime(h)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Slot End</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none text-slate-900 font-black cursor-pointer appearance-none"
                value={formData.end}
                onChange={e => setFormData(p => ({ ...p, end: parseInt(e.target.value) }))}
              >
                {OPERATING_HOURS.filter(h => h > formData.start).map(h => (
                  <option key={h} value={h}>{formatTime(h)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-2xl shadow-slate-300 transform transition-transform hover:scale-[1.01]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Checkout Summary</span>
            {formData.discount > 0 && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase">-{formData.discount}% DISCOUNT</span>}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-black tracking-tighter leading-none">{formatCurrency(pricing.amount)}</div>
              <div className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-wider">{pricing.totalHours} Hour session • {pricing.rateType} Rates</div>
            </div>
          </div>
        </div>

        {isConflict && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-red-600 text-sm font-black flex items-center gap-3 animate-pulse shadow-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            BOOKING CONFLICT: THIS SLOT IS UNAVAILABLE
          </div>
        )}

        <div className="flex justify-center w-full pt-4">
          <button 
            type="submit"
            disabled={isConflict || isSubmitting}
            className={`w-fit mx-auto px-28 py-6 rounded-full text-white font-black text-xl shadow-2xl transition-all mb-8 ${
              isConflict || isSubmitting 
                ? 'bg-slate-200 shadow-none cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 hover:shadow-blue-300 hover:scale-105 active:scale-95 shadow-blue-500/50'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

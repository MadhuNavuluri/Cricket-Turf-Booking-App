
import React, { useState } from 'react';
import { Booking } from '../types';
import { formatCurrency, formatTime, getMonthAbbr } from '../utils/pricing';
import { ICON_CALENDAR } from '../constants';

interface TransactionHistoryProps {
  bookings: Booking[];
  onDelete: (id: string) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ bookings, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-slate-800">Booking Log</h2>
      
      {bookings.length === 0 ? (
        <div className="glass p-12 rounded-[3rem] text-center text-slate-400">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Bookings Yet</h3>
          <p className="font-medium text-sm text-slate-400">Start by creating a new entry from the Book tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="glass p-5 rounded-[2.5rem] flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                {/* Visual Calendar Icon Wrapper */}
                <div className="w-14 h-16 rounded-2xl bg-white border border-slate-100 flex flex-col overflow-hidden shadow-sm">
                   <div className={`h-5 flex items-center justify-center text-[10px] font-black text-white ${
                     booking.rateType === 'Holiday' ? 'bg-red-500' : 
                     booking.rateType === 'Weekend' ? 'bg-purple-500' : 'bg-blue-600'
                   }`}>
                     {getMonthAbbr(booking.date)}
                   </div>
                   <div className="flex-1 flex items-center justify-center text-2xl font-black text-slate-800 tracking-tighter">
                     {booking.date.split('-')[2]}
                   </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{booking.customerName}</h4>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                      booking.rateType === 'Holiday' ? 'text-red-500 bg-red-50' : 
                      booking.rateType === 'Weekend' ? 'text-purple-500 bg-purple-50' : 
                      'text-blue-600 bg-blue-50'
                    }`}>
                      {booking.rateType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="hidden sm:block">
                  <div className="text-xl font-black text-slate-800">{formatCurrency(booking.amount)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transacted</div>
                </div>
                <button 
                  onClick={() => handleDeleteClick(booking.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                  aria-label="Delete booking"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={cancelDelete}></div>
          <div className="glass w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">Remove Record?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 px-4">
              This will permanently delete this booking from your history. Are you sure?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={cancelDelete}
                className="py-4 px-4 rounded-[1.5rem] bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={confirmDelete}
                className="py-4 px-4 rounded-[1.5rem] bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

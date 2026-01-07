
import React, { useState, useEffect } from 'react';
import { Booking, RatesConfig, ViewState } from './types';
import { DEFAULT_RATES, ICON_DASHBOARD, ICON_PLUS, ICON_TICKET, ICON_SETTINGS } from './constants';
import Dashboard from './components/Dashboard';
import BookingForm from './components/BookingForm';
import TransactionHistory from './components/TransactionHistory';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rates, setRates] = useState<RatesConfig>(DEFAULT_RATES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefillData, setPrefillData] = useState<{ date: string; start: number; end: number } | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedBookings = localStorage.getItem('turf_bookings');
    const savedRates = localStorage.getItem('turf_rates');
    
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedRates) setRates(JSON.parse(savedRates));
    
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('turf_bookings', JSON.stringify(bookings));
      localStorage.setItem('turf_rates', JSON.stringify(rates));
    }
  }, [bookings, rates, isLoaded]);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    setPrefillData(null);
    setView('dashboard');
  };

  const handleNewBooking = (data?: { date: string; start: number; end: number }) => {
    if (data) {
      setPrefillData(data);
    } else {
      setPrefillData(null);
    }
    setView('booking');
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const updateRates = (newRates: RatesConfig) => {
    setRates(newRates);
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard bookings={bookings} onNewBooking={handleNewBooking} rates={rates} />;
      case 'booking':
        return <BookingForm onAdd={addBooking} bookings={bookings} rates={rates} onCancel={() => setView('dashboard')} prefillData={prefillData} />;
      case 'history':
        return <TransactionHistory bookings={bookings} onDelete={deleteBooking} />;
      case 'admin':
        return <AdminPanel rates={rates} onSave={updateRates} />;
      default:
        return <Dashboard bookings={bookings} onNewBooking={handleNewBooking} rates={rates} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-40 pt-8 min-h-screen relative">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">TurfManager</h1>
          <p className="text-slate-500 font-medium text-sm">Cricket Booking Pro</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
        </div>
      </header>

      {/* Content */}
      <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass rounded-full px-4 py-3 flex justify-between items-center z-50 shadow-2xl">
        <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={ICON_DASHBOARD} label="Home" />
        <NavButton active={view === 'booking'} onClick={() => handleNewBooking()} icon={ICON_PLUS} label="Book" />
        <NavButton active={view === 'history'} onClick={() => setView('history')} icon={ICON_TICKET} label="Bookings" />
        <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={ICON_SETTINGS} label="Admin" />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 group ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-50' : 'group-hover:bg-slate-50'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;

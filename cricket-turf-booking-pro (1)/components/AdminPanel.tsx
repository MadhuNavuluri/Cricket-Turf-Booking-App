
import React, { useState } from 'react';
import { RatesConfig } from '../types';
import { ICON_CALENDAR } from '../constants';
import { formatDisplayDate } from '../utils/pricing';

interface AdminPanelProps {
  rates: RatesConfig;
  onSave: (rates: RatesConfig) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ rates, onSave }) => {
  const [localRates, setLocalRates] = useState<RatesConfig>(rates);
  const [newHoliday, setNewHoliday] = useState('');

  const handleSave = () => {
    onSave(localRates);
    alert("Settings saved locally!");
  };

  const addHoliday = () => {
    if (newHoliday && !localRates.holidayDates.includes(newHoliday)) {
      setLocalRates(prev => ({ ...prev, holidayDates: [...prev.holidayDates, newHoliday] }));
      setNewHoliday('');
    }
  };

  const removeHoliday = (date: string) => {
    setLocalRates(prev => ({ ...prev, holidayDates: prev.holidayDates.filter(d => d !== date) }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>

      <section className="glass p-6 rounded-3xl space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Pricing Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Base Rate (Weekdays)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none text-slate-900 font-medium"
                value={localRates.baseRate}
                onChange={e => setLocalRates(p => ({ ...p, baseRate: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Weekend Rate</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none text-slate-900 font-medium"
                value={localRates.weekendRate}
                onChange={e => setLocalRates(p => ({ ...p, weekendRate: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Holiday Rate</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none text-slate-900 font-medium"
                value={localRates.holidayRate}
                onChange={e => setLocalRates(p => ({ ...p, holidayRate: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Integrations</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Google Apps Script Web App URL</label>
            <input 
              type="text" 
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none text-slate-900 font-medium placeholder-slate-400"
              value={localRates.googleScriptUrl}
              onChange={e => setLocalRates(p => ({ ...p, googleScriptUrl: e.target.value }))}
            />
            <p className="text-[10px] text-slate-400 mt-2 italic">Copy the deployment URL from your Google Apps Script editor.</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Holiday Calendar</h3>
          <div className="flex gap-4 mb-4 items-center">
            {/* Interactive Date Card Pattern to fix visibility issues from global CSS */}
            <div className="date-input-container relative bg-slate-50 border border-slate-100 rounded-2xl flex-1 px-5 py-3 hover:bg-slate-100 transition-all group min-h-[52px] flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">
                {newHoliday ? formatDisplayDate(newHoliday) : 'Select Date'}
              </span>
              <span className="text-slate-300 group-hover:text-slate-400 transition-colors">
                {ICON_CALENDAR}
              </span>
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                value={newHoliday}
                onChange={e => setNewHoliday(e.target.value)}
              />
            </div>

            <button 
              onClick={addHoliday}
              className="bg-[#9333ea] text-white px-8 h-[52px] rounded-[1.25rem] font-black text-base shadow-lg shadow-purple-100 hover:bg-[#7e22ce] transition-all active:scale-95"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {localRates.holidayDates.map(date => (
              <span key={date} className="bg-purple-50 text-purple-600 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 border border-purple-100 group">
                {formatDisplayDate(date)}
                <button 
                  onClick={() => removeHoliday(date)} 
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition-all ml-1 font-sans"
                >
                  ×
                </button>
              </span>
            ))}
            {localRates.holidayDates.length === 0 && <span className="text-xs text-slate-400 italic px-2">No special holidays set.</span>}
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
        >
          Save All Changes
        </button>
      </section>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
        <h4 className="font-bold text-blue-800 mb-2">Setup Guide</h4>
        <ol className="text-xs text-blue-700 space-y-2 list-decimal ml-4">
          <li>Create a Google Sheet with headers: ID, Date, Customer, Phone, Start, End, Hours, Amount, Type.</li>
          <li>Go to Extensions &gt; Apps Script.</li>
          <li>Paste the bridge code (available in the project documentation).</li>
          <li>Deploy as "Web App" with Access "Anyone".</li>
          <li>Paste the resulting URL above.</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminPanel;

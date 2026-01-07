
export interface Booking {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  startTime: number; // 24h format (e.g. 18 for 6 PM)
  endTime: number;
  totalHours: number;
  amount: number;
  rateType: 'Base' | 'Weekend' | 'Holiday';
  discountApplied: number;
}

export interface RatesConfig {
  baseRate: number;
  weekendRate: number;
  holidayRate: number;
  holidayDates: string[]; // YYYY-MM-DD
  googleScriptUrl: string;
}

export type ViewState = 'dashboard' | 'booking' | 'history' | 'admin';

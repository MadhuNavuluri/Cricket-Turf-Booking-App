
import { RatesConfig } from '../types';

export const getRateType = (dateStr: string, holidayDates: string[]): 'Base' | 'Weekend' | 'Holiday' => {
  if (holidayDates.includes(dateStr)) return 'Holiday';
  
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return 'Weekend';
  
  return 'Base';
};

export const calculatePrice = (
  dateStr: string,
  startTime: number,
  endTime: number,
  rates: RatesConfig,
  discountPercent: number = 0
): { amount: number; rateType: 'Base' | 'Weekend' | 'Holiday'; totalHours: number } => {
  const rateType = getRateType(dateStr, rates.holidayDates);
  const totalHours = endTime - startTime;
  
  let hourlyRate = rates.baseRate;
  if (rateType === 'Weekend') hourlyRate = rates.weekendRate;
  if (rateType === 'Holiday') hourlyRate = rates.holidayRate;
  
  const baseTotal = totalHours * hourlyRate;
  const discountAmount = (baseTotal * discountPercent) / 100;
  
  return {
    amount: baseTotal - discountAmount,
    rateType,
    totalHours
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatTime = (hour: number) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${ampm}`;
};

export const getMonthAbbr = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('default', { month: 'short' }).toUpperCase();
};

export const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

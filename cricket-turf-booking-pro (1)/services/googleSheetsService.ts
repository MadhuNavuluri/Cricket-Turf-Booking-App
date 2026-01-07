
import { Booking } from '../types';

export const syncBookingToSheets = async (booking: Booking, scriptUrl: string): Promise<boolean> => {
  if (!scriptUrl) {
    console.warn("Google Apps Script URL not configured. Saving locally only.");
    return false;
  }

  try {
    const payload = {
      action: 'addBooking',
      data: {
        date: booking.date,
        customerName: booking.customerName,
        phone: booking.phone,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalHours: booking.totalHours,
        amount: booking.amount,
        rateType: booking.rateType,
        id: booking.id
      }
    };

    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps script usually needs no-cors for simple fetches
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
    return false;
  }
};

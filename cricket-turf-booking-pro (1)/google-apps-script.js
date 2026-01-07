
/**
 * GOOGLE APPS SCRIPT CODE - PASTE INTO GOOGLE SHEETS APPS SCRIPT EDITOR
 * 
 * 1. Open Google Sheets
 * 2. Extensions > Apps Script
 * 3. Delete any code and paste this.
 * 4. Deploy > New Deployment > Web App
 * 5. Access: "Anyone"
 */

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; // Use first sheet
    
    if (params.action === 'addBooking') {
      const b = params.data;
      // Appends row: Date | Customer | Phone | Start | End | Hours | Amount | Type | ID
      sheet.appendRow([
        b.date,
        b.customerName,
        b.phone,
        b.startTime,
        b.endTime,
        b.totalHours,
        b.amount,
        b.rateType,
        b.id,
        new Date() // Timestamp
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Enable CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

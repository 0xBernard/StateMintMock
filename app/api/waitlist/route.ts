
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, capitalRange } = await req.json();

    if (!name || !email || !capitalRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:D', // Assumes your sheet is named 'Sheet1'
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), name, email, capitalRange]],
      },
    });

    return NextResponse.json({ success: true, data: response.data }, { status: 200 });
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    // It's good practice to not expose detailed error messages to the client
    return NextResponse.json({ error: 'Failed to submit to waitlist.' }, { status: 500 });
  }
} 
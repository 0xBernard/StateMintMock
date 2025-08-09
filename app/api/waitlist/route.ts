
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, userType, capitalRange, token } = await req.json();

    if (!name || !email || !userType || !capitalRange || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecretKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${token}`;
    const recaptchaResponse = await fetch(verificationUrl, { method: 'POST' });
    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 403 });
    }

    const webAppUrl = process.env.APPS_SCRIPT_WEBAPP_URL;
    const webhookSecret = process.env.WAITLIST_WEBHOOK_SECRET;
    if (!webAppUrl || !webhookSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const forwardResponse = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, userType, capitalRange, secret: webhookSecret }),
    });

    // Try to propagate response; fall back to generic success
    let forwardJson: unknown = null;
    try {
      forwardJson = await forwardResponse.json();
    } catch {
      // ignore JSON parse errors
    }

    if (!forwardResponse.ok) {
      console.error('Apps Script forward failed', forwardJson);
      return NextResponse.json({ error: 'Failed to submit to waitlist.' }, { status: 502 });
    }

    return NextResponse.json(
      { success: true, ...(typeof forwardJson === 'object' && forwardJson ? forwardJson : {}) },
      { status: 200 },
    );
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json({ error: 'Failed to submit to waitlist.' }, { status: 500 });
  }
}
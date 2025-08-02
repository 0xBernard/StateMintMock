'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import GoogleReCaptchaProvider to avoid SSR issues
const GoogleReCaptchaProvider = dynamic(
  () => import('react-google-recaptcha-v3').then(mod => mod.GoogleReCaptchaProvider),
  { ssr: false }
);

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, only enable reCAPTCHA if explicitly configured
  if (isDevelopment && !reCaptchaKey) {
    console.log('Development mode: reCAPTCHA disabled (no site key configured)');
    return <>{children}</>;
  }

  // In production, warn if reCAPTCHA is not configured
  if (!reCaptchaKey) {
    console.warn('reCAPTCHA site key not found. reCAPTCHA will not be available.');
    return <>{children}</>;
  }

  return <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>{children}</GoogleReCaptchaProvider>;
} 
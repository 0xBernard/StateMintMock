const isDevelopment = process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  // Mobile browser detection for debugging
  mobile: () => {
    if (typeof window === 'undefined') return null;
    
    const userAgent = navigator.userAgent;
    const isBrave = !!(navigator as any).brave && !!(navigator as any).brave.isBrave;
    const isAndroid = /Android/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return {
      userAgent,
      isBrave,
      isAndroid,
      isChrome,
      isMobile,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      isAndroidBrave: isAndroid && isBrave
    };
  }
};
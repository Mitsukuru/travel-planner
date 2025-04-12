export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

declare global {
  interface Window {
    gtag: (command: string, id: string, config?: any) => void;
  }
}

export const pageview = (url: string) => {
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

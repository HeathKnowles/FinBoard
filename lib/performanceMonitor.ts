export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
      this.metrics.set(name, Date.now());
    }
  }

  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof window === 'undefined') return null;

    try {
      if (endMark) {
        window.performance.measure(name, startMark, endMark);
      } else {
        window.performance.measure(name, startMark);
      }
      
      const entries = window.performance.getEntriesByName(name, 'measure');
      const lastEntry = entries[entries.length - 1];
      return lastEntry ? lastEntry.duration : null;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }

  getCoreWebVitals(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({});
        return;
      }

      const vitals: any = {};

      const nav = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        vitals.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
        vitals.loadComplete = nav.loadEventEnd - nav.loadEventStart;
        vitals.firstByte = nav.responseStart - nav.requestStart;
      }

      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          vitals.firstContentfulPaint = entry.startTime;
        }
        if (entry.name === 'first-paint') {
          vitals.firstPaint = entry.startTime;
        }
      });

      vitals.timestamp = Date.now();

      resolve(vitals);
    });
  }

  getBundleAnalysis(): any {
    if (typeof window === 'undefined') return {};

    const scripts = Array.from(document.scripts);
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    return {
      scriptCount: scripts.length,
      scriptSizes: scripts.map(script => ({
        src: script.src,
        size: script.innerHTML.length || 0,
      })),
      stylesheetCount: stylesheets.length,
      totalResources: window.performance.getEntriesByType('resource').length,
    };
  }

  async logReport(): Promise<void> {
    const vitals = await this.getCoreWebVitals();
    const bundle = this.getBundleAnalysis();
    
    console.group('📊 FinBoard Performance Report');
    console.log('Core Web Vitals:', vitals);
    console.log('Bundle Analysis:', bundle);
    console.log('Custom Metrics:', Object.fromEntries(this.metrics));
    console.groupEnd();
  }
}

export class ResourceOptimizer {

    static preloadResource(href: string, type: 'script' | 'style' | 'font' | 'image'): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'image':
        link.as = 'image';
        break;
    }

    document.head.appendChild(link);
  }

  static setupLazyImages(): void {
    if (typeof window === 'undefined') return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  static prefetchRoutes(routes: string[]): void {
    if (typeof document === 'undefined') return;

    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
}

export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  const monitor = PerformanceMonitor.getInstance();

  monitor.mark('app-start');

  window.addEventListener('load', () => {
    monitor.mark('app-loaded');
    setTimeout(() => monitor.logReport(), 2000);
  });

  ResourceOptimizer.setupLazyImages();

  ResourceOptimizer.prefetchRoutes(['/api/fetch', '/api/cache']);

  console.log('🚀 Performance monitoring initialized');
}

if (typeof window !== 'undefined') {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePerformanceMonitoring);
  } else {
        initializePerformanceMonitoring();
  }
}
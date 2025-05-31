// Performance monitoring utility for avatar system

interface PerformanceMetrics {
  renderTime: number;
  animationFrameRate: number;
  memoryUsage: number;
  voiceLatency: number;
  apiResponseTime: number;
}

export class AvatarPerformanceMonitor {
  private static metrics: PerformanceMetrics = {
    renderTime: 0,
    animationFrameRate: 0,
    memoryUsage: 0,
    voiceLatency: 0,
    apiResponseTime: 0,
  };

  private static renderStartTime = 0;
  private static frameCount = 0;
  private static lastFrameTime = 0;
  private static isRunning = false;
  private static monitoringInterval: NodeJS.Timeout | null = null;

  static async initialize(config?: {
    enableRealTimeTracking?: boolean;
    trackingInterval?: number;
    adaptiveQuality?: boolean;
  }): Promise<void> {
    console.log('📊 Initializing performance monitor...');
    this.isRunning = true;
    
    if (config && config.enableRealTimeTracking) {
      this.startRealTimeTracking(config.trackingInterval || 1000);
    }
  }

  static async getCurrentMetrics(): Promise<PerformanceMetrics> {
    return { ...this.metrics };
  }

  static reset(): void {
    this.metrics = {
      renderTime: 0,
      animationFrameRate: 0,
      memoryUsage: 0,
      voiceLatency: 0,
      apiResponseTime: 0,
    };
    this.frameCount = 0;
    this.renderStartTime = 0;
    this.lastFrameTime = 0;
  }

  static async start(): Promise<void> {
    this.isRunning = true;
    console.log('▶️ Performance monitoring started');
  }

  static stop(): void {
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('⏹️ Performance monitoring stopped');
  }

  private static startRealTimeTracking(interval: number): void {
    this.monitoringInterval = setInterval(() => {
      if (this.isRunning) {
        // Update memory usage (mock implementation)
        this.metrics.memoryUsage = Math.random() * 100 + 50; // 50-150MB range
        this.logPerformanceWarnings();
      }
    }, interval);
  }

  static startRenderMeasurement(): void {
    this.renderStartTime = performance.now();
  }

  static endRenderMeasurement(): void {
    if (this.renderStartTime > 0) {
      this.metrics.renderTime = performance.now() - this.renderStartTime;
      this.renderStartTime = 0;
    }
  }

  static measureAnimationPerformance(): void {
    const currentTime = performance.now();
    if (this.lastFrameTime > 0) {
      const frameDuration = currentTime - this.lastFrameTime;
      this.metrics.animationFrameRate = 1000 / frameDuration;
      this.frameCount++;
    }
    this.lastFrameTime = currentTime;
  }

  static measureVoiceLatency(startTime: number): void {
    this.metrics.voiceLatency = performance.now() - startTime;
  }

  static measureApiResponseTime(startTime: number): void {
    this.metrics.apiResponseTime = performance.now() - startTime;
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  static generatePerformanceReport(): string {
    const metrics = this.getMetrics();
    return `
Avatar Performance Report:
- Render Time: ${metrics.renderTime.toFixed(2)}ms
- Animation FPS: ${metrics.animationFrameRate.toFixed(1)}
- Voice Latency: ${metrics.voiceLatency.toFixed(2)}ms
- API Response: ${metrics.apiResponseTime.toFixed(2)}ms
- Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB
    `.trim();
  }

  static logPerformanceWarnings(): void {
    const metrics = this.getMetrics();
    
    if (metrics.renderTime > 16) {
      console.warn(`Avatar render time (${metrics.renderTime.toFixed(2)}ms) exceeds 16ms budget`);
    }
    
    if (metrics.animationFrameRate < 50) {
      console.warn(`Avatar animation FPS (${metrics.animationFrameRate.toFixed(1)}) below optimal 60fps`);
    }
    
    if (metrics.voiceLatency > 1000) {
      console.warn(`Voice latency (${metrics.voiceLatency.toFixed(2)}ms) exceeds 1s threshold`);
    }
  }
}

// Test script to validate avatar system optimization integration
const { initializeAvatarSystem, getSystemStatus, resetSystem } = require('./src/services/avatarSystemInit');

async function testAvatarOptimization() {
  console.log('🧪 Testing Avatar System Optimization...\n');

  try {
    // 1. Initialize the avatar system
    console.log('1️⃣ Initializing avatar system...');
    await initializeAvatarSystem({
      enablePerformanceMonitoring: true,
      enableAdaptiveQuality: true,
      enableSmartCaching: true,
      enableEnhancedErrorHandling: true,
    });
    console.log('✅ Avatar system initialization complete!\n');

    // 2. Get system status
    console.log('2️⃣ Getting system status...');
    const status = await getSystemStatus();
    console.log('📊 System Status:', JSON.stringify(status, null, 2));
    console.log('✅ System status retrieved!\n');

    // 3. Test performance monitoring
    console.log('3️⃣ Testing performance monitoring...');
    const { AvatarPerformanceMonitor } = require('./src/utils/performanceMonitor');
    AvatarPerformanceMonitor.startRenderMeasurement();
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    AvatarPerformanceMonitor.endRenderMeasurement();
    const metrics = await AvatarPerformanceMonitor.getCurrentMetrics();
    console.log('📈 Performance Metrics:', metrics);
    console.log('✅ Performance monitoring test complete!\n');

    // 4. Test smart caching
    console.log('4️⃣ Testing smart caching...');
    const { AvatarCacheManager } = require('./src/utils/smartCache');
    const cacheStats = AvatarCacheManager.getCacheStats();
    console.log('🧠 Cache Stats:', cacheStats);
    console.log('✅ Smart caching test complete!\n');

    // 5. Test device performance adapter
    console.log('5️⃣ Testing device performance adapter...');
    const { DevicePerformanceAdapter } = require('./src/utils/devicePerformanceAdapter');
    const deviceTier = DevicePerformanceAdapter.getDeviceTier();
    console.log('📱 Device Tier:', deviceTier);
    
    const optimizations = DevicePerformanceAdapter.getOptimizationSettings();
    console.log('⚙️ Optimization Settings:', optimizations);
    console.log('✅ Device performance adapter test complete!\n');

    console.log('🎉 All avatar optimization tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Avatar optimization test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
testAvatarOptimization().catch(console.error);

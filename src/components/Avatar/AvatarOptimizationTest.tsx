// Avatar optimization integration test component
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { initializeAvatarSystem, getSystemStatus } from '../../services/avatarSystemInit';
import { AvatarPerformanceMonitor } from '../../utils/performanceMonitor';
import { DevicePerformanceAdapter } from '../../utils/devicePerformanceAdapter';
import { AvatarCacheManager } from '../../utils/smartCache';

export default function AvatarOptimizationTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runOptimizationTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🧪 Starting Avatar System Optimization Tests...');

      // Test 1: Initialize avatar system
      addResult('1️⃣ Testing avatar system initialization...');
      await initializeAvatarSystem({
        enablePerformanceMonitoring: true,
        enableAdaptiveQuality: true,
        enableSmartCaching: true,
        enableEnhancedErrorHandling: true,
      });
      addResult('✅ Avatar system initialization complete!');

      // Test 2: Device performance detection
      addResult('2️⃣ Testing device performance detection...');
      const deviceTier = DevicePerformanceAdapter.getDeviceTier();
      addResult(`📱 Device tier: ${deviceTier}`);
      
      const optimizations = DevicePerformanceAdapter.getOptimizationSettings();
      addResult(`⚙️ Max FPS: ${optimizations.animationSettings.maxFPS}`);
      addResult(`🎯 Quality: ${optimizations.animationSettings.quality}`);

      // Test 3: Performance monitoring
      addResult('3️⃣ Testing performance monitoring...');
      AvatarPerformanceMonitor.startRenderMeasurement();
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 50));
      
      AvatarPerformanceMonitor.endRenderMeasurement();
      const metrics = await AvatarPerformanceMonitor.getCurrentMetrics();
      addResult(`📈 Render time: ${metrics.renderTime.toFixed(2)}ms`);

      // Test 4: Smart caching
      addResult('4️⃣ Testing smart caching...');
      const cacheStats = AvatarCacheManager.getCacheStats();
      addResult(`🧠 Voice cache entries: ${cacheStats.voice.size}`);
      addResult(`🎬 Animation cache entries: ${cacheStats.animation.size}`);

      // Test 5: System status
      addResult('5️⃣ Testing system status...');
      const status = await getSystemStatus();
      addResult(`🔋 Performance score: ${JSON.stringify(status.performance)}`);

      addResult('🎉 All optimization tests completed successfully!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`❌ Test failed: ${errorMessage}`);
      console.error('Avatar optimization test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avatar System Optimization Test</Text>
      
      <Button 
        title={isRunning ? "Running Tests..." : "Run Optimization Tests"}
        onPress={runOptimizationTests}
        disabled={isRunning}
      />
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
    flex: 1,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    fontFamily: 'monospace',
  },
});

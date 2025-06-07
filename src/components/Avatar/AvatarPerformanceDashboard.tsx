// Avatar Performance Dashboard Component
// Real-time monitoring of avatar system performance metrics

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { getSystemStatus, toggleOptimization } from '../../services/avatarSystemInit';
import { PerformanceMetrics as SystemPerformanceMetrics } from '../../types/avatar'; // Import the correct type

const screenWidth = Dimensions.get('window').width;

interface PerformanceData {
  renderTime: number[];
  animationFPS: number[];
  voiceLatency: number[];
  memoryUsage: number[];
  timestamps: string[];
}

// Helper type to get keys of PerformanceData that map to number[]
type NumericMetricKeys = {
  [K in keyof PerformanceData]: PerformanceData[K] extends number[] ? K : never;
}[keyof PerformanceData];

interface SystemStatus {
  deviceTier: string;
  optimizationsActive: boolean;
  performance: SystemPerformanceMetrics;
  cache: {
    voiceResponses?: number;
    animations?: number;
    userData?: number;
  };
  // Add other properties of systemStatus if known
}

export const AvatarPerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderTime: [],
    animationFPS: [],
    voiceLatency: [],
    memoryUsage: [],
    timestamps: [],
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<NumericMetricKeys>('renderTime'); // Use NumericMetricKeys

  // Refresh interval for real-time updates
  useEffect(() => {
    if (!isMonitoring) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const status = await getSystemStatus();
        setSystemStatus(status as SystemStatus); // Cast to SystemStatus

        const metrics = status.performance as SystemPerformanceMetrics; // Cast to SystemPerformanceMetrics
        const now = new Date().toLocaleTimeString();

        setPerformanceData(prev => {
          const maxDataPoints = 20; // Keep last 20 data points
          
          const updateArray = (arr: number[], newValue: number) => {
            const updated = [...arr, newValue];
            return updated.length > maxDataPoints 
              ? updated.slice(-maxDataPoints) 
              : updated;
          };

          return {
            renderTime: updateArray(prev.renderTime, metrics.renderTime),
            // Ensure metrics.animationFPS is treated as a number, which it should be based on SystemPerformanceMetrics
            animationFPS: updateArray(prev.animationFPS, metrics.animationFPS), 
            voiceLatency: updateArray(prev.voiceLatency, metrics.voiceLatency),
            memoryUsage: updateArray(prev.memoryUsage, metrics.memoryUsage),
            timestamps: [...prev.timestamps, now].slice(-maxDataPoints),
          };
        });
      } catch (error) {
        console.error('Failed to update performance data:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Chart configuration
  const chartConfig = useMemo(() => ({
    backgroundColor: '#1F1F1F',
    backgroundGradientFrom: '#1F1F1F',
    backgroundGradientTo: '#2D2D2D',
    color: (opacity = 1) => `rgba(142, 84, 233, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  }), []);

  // Performance score calculation
  const performanceScore = useMemo(() => {
    if (!systemStatus?.performance) {
      return 0;
    }
    
    const { renderTime, animationFPS, voiceLatency, memoryUsage, errorRate } = systemStatus.performance;
    
    // Scoring algorithm (0-100)
    const renderScore = Math.max(0, 100 - (renderTime - 16.67) * 2);
    const fpsScore = Math.min(100, (animationFPS / 60) * 100);
    const latencyScore = Math.max(0, 100 - (voiceLatency - 300) / 10);
    const memoryScore = Math.max(0, 100 - memoryUsage);
    const errorScore = Math.max(0, 100 - errorRate * 100);
    
    return Math.round((renderScore + fpsScore + latencyScore + memoryScore + errorScore) / 5);
  }, [systemStatus]);

  // Device tier indicator color
  const getDeviceTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return '#00C851';
      case 'high': return '#2BBBAD';
      case 'medium': return '#FF8800';
      case 'low': return '#FF4444';
      default: return '#6C757D';
    }
  };

  // Metric display data
  const getMetricDisplayData = () => {
    if (performanceData[selectedMetric].length === 0) {
      return null;
    }

    return {
      labels: performanceData.timestamps,
      datasets: [{
        data: performanceData[selectedMetric], // This will now correctly be number[]
        color: (opacity = 1) => `rgba(142, 84, 233, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  // Handle optimization toggles
  const handleOptimizationToggle = async (optimization: string, enabled: boolean) => {
    try {
      await toggleOptimization(optimization as any, enabled);
      // Refresh system status
      const status = await getSystemStatus();
      setSystemStatus(status as SystemStatus); // Cast to SystemStatus
    } catch (error) {
      console.error('Failed to toggle optimization:', error);
    }
  };

  if (!systemStatus) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  const chartData = getMetricDisplayData();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Avatar Performance Dashboard</Text>
        <View style={styles.monitoringToggle}>
          <Text style={styles.toggleLabel}>Real-time Monitoring</Text>
          <Switch
            value={isMonitoring}
            onValueChange={setIsMonitoring}
            trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      {/* Performance Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Overall Performance Score</Text>
        <View style={styles.scoreContainer}>
          <ProgressChart
            data={{
              data: [performanceScore / 100],
            }}
            width={120}
            height={120}
            strokeWidth={8}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => {
                const score = performanceScore;
                if (score >= 80) {
                  return `rgba(0, 200, 81, ${opacity})`;
                }
                if (score >= 60) {
                  return `rgba(255, 136, 0, ${opacity})`;
                }
                return `rgba(255, 68, 68, ${opacity})`;
              },
            }}
            hideLegend
          />
          <Text style={styles.scoreValue}>{performanceScore}</Text>
        </View>
      </View>

      {/* Device Information */}
      <View style={styles.deviceCard}>
        <Text style={styles.cardTitle}>Device Information</Text>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceTier}>
            <View 
              style={[
                styles.tierIndicator, 
                { backgroundColor: getDeviceTierColor(systemStatus.deviceTier) }
              ]} 
            />
            <Text style={styles.deviceTierText}>
              {systemStatus.deviceTier.toUpperCase()} TIER
            </Text>
          </View>
          <Text style={styles.deviceDetails}>
            Optimizations: {systemStatus.optimizationsActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Performance Metrics Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        
        {/* Metric Selector */}
        <View style={styles.metricSelector}>
          {(Object.keys(performanceData) as Array<keyof PerformanceData>)
            .filter(key => key !== 'timestamps')
            .map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricButton,
                selectedMetric === metric && styles.selectedMetricButton,
              ]}
              onPress={() => setSelectedMetric(metric as NumericMetricKeys)} // Ensure metric is cast to NumericMetricKeys
            >
              <Text style={[
                styles.metricButtonText,
                selectedMetric === metric && styles.selectedMetricButtonText,
              ]}>
                {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        {chartData && (
          <LineChart
            data={chartData} // This should now be correctly typed
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* Current Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Current Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Render Time</Text>
            <Text style={styles.metricValue}>
              {systemStatus.performance.renderTime.toFixed(1)}ms
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Animation FPS</Text>
            <Text style={styles.metricValue}>
              {systemStatus.performance.animationFPS}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Voice Latency</Text>
            <Text style={styles.metricValue}>
              {systemStatus.performance.voiceLatency}ms
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Memory Usage</Text>
            <Text style={styles.metricValue}>
              {systemStatus.performance.memoryUsage}MB
            </Text>
          </View>
        </View>
      </View>

      {/* Cache Statistics */}
      <View style={styles.cacheCard}>
        <Text style={styles.cardTitle}>Cache Statistics</Text>
        <View style={styles.cacheStats}>
          <Text style={styles.cacheItem}>
            Voice Responses: {systemStatus.cache?.voiceResponses || 0} cached
          </Text>
          <Text style={styles.cacheItem}>
            Animations: {systemStatus.cache?.animations || 0} cached
          </Text>
          <Text style={styles.cacheItem}>
            User Data: {systemStatus.cache?.userData || 0} entries
          </Text>
        </View>
      </View>

      {/* Optimization Controls */}
      <View style={styles.controlsCard}>
        <Text style={styles.cardTitle}>Optimization Controls</Text>
        <View style={styles.optimizationControls}>
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Performance Monitoring</Text>
            <Switch
              value={systemStatus.optimizationsActive} // Example: connect to actual optimization state
              onValueChange={(value) => handleOptimizationToggle('enablePerformanceMonitoring', value)}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
            />
          </View>
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Adaptive Quality</Text>
            <Switch
              value={systemStatus.optimizationsActive} // Example: connect to actual optimization state
              onValueChange={(value) => handleOptimizationToggle('enableAdaptiveQuality', value)}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
            />
          </View>
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Smart Caching</Text>
            <Switch
              value={systemStatus.optimizationsActive} // Example: connect to actual optimization state
              onValueChange={(value) => handleOptimizationToggle('enableSmartCaching', value)}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  header: {
    padding: 20,
    paddingTop: 40, // Adjust for status bar
    backgroundColor: '#1F1F1F',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  monitoringToggle: {
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  scoreCard: {
    backgroundColor: '#1F1F1F',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -18 }], // Adjust to center
  },
  deviceCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  deviceInfo: {
    alignItems: 'center',
  },
  deviceTier: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deviceTierText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceDetails: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  chartCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  metricButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    margin: 4,
  },
  selectedMetricButton: {
    backgroundColor: '#8E54E9',
  },
  metricButtonText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  selectedMetricButtonText: {
    color: '#FFFFFF',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  metricsCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 15,
  },
  metricLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cacheCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  cacheStats: {
    gap: 8,
  },
  cacheItem: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  controlsCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  optimizationControls: {
    gap: 15,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

// Removed unused imports AvatarPerformanceMonitor, DevicePerformanceAdapter, AvatarCacheManager as they were not used in the component logic.
// If they are intended for future use or were mistakenly removed, they can be re-added.
export default AvatarPerformanceDashboard;

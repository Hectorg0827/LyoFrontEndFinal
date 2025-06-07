// Enhanced Avatar Performance Dashboard Component
// Real-time monitoring of avatar system performance metrics with additional learning analytics

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LineChart, ProgressChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { enhancedAvatarService } from '../../services/enhancedAvatarService';
import { DevicePerformanceAdapter } from '../../utils/devicePerformanceAdapter';
import { AvatarCacheManager } from '../../utils/smartCache';
import { AvatarPerformanceMonitor } from '../../utils/performanceMonitor';
import { 
  PerformanceMetrics, 
  AvatarEmotion 
} from '../../types/avatar'; 

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

interface EmotionData {
  emotion: AvatarEmotion;
  count: number;
  color: string;
}

interface LearningData {
  subject: string;
  score: number;
}

const EMOTION_COLORS: Record<AvatarEmotion, string> = {
  'happy': '#4CAF50',
  'sad': '#2196F3',
  'angry': '#F44336',
  'surprised': '#FF9800',
  'confused': '#9C27B0',
  'thinking': '#3F51B5',
  'excited': '#FFC107',
  'neutral': '#607D8B'
};

const EnhancedAvatarPerformanceDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderTime: [],
    animationFPS: [],
    voiceLatency: [],
    memoryUsage: [],
    timestamps: [],
  });

  const [systemStatus, setSystemStatus] = useState<any | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [learningData, setLearningData] = useState<LearningData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<NumericMetricKeys>('renderTime');
  const [activeTab, setActiveTab] = useState<'performance' | 'learning'>('performance');

  // Generate mock emotion data
  const generateEmotionData = () => {
    const emotions: AvatarEmotion[] = ['happy', 'sad', 'angry', 'surprised', 'confused', 'thinking', 'excited', 'neutral'];
    return emotions.map(emotion => ({
      emotion,
      count: Math.floor(Math.random() * 20) + 1,
      color: EMOTION_COLORS[emotion]
    }));
  };

  // Generate mock learning data
  const generateLearningData = () => {
    const subjects = ['Math', 'Science', 'History', 'Language', 'Art'];
    return subjects.map(subject => ({
      subject,
      score: Math.floor(Math.random() * 100)
    }));
  };

  // Refresh interval for real-time updates
  useEffect(() => {
    if (!isMonitoring) {
      return;
    }

    // Initialize with some mock data
    setEmotionData(generateEmotionData());
    setLearningData(generateLearningData());

    const interval = setInterval(async () => {
      try {
        // Get performance report
        const performanceReport = enhancedAvatarService.getPerformanceReport();
        
        // Get device capabilities
        const deviceCapabilities = await DevicePerformanceAdapter.initializeDeviceProfile();
        
        // Get cache stats
        const cacheStats = AvatarCacheManager.getAllStats();
        
        // Create system status object
        const status = {
          deviceTier: deviceCapabilities.tier,
          optimizationsActive: deviceCapabilities.supportsNativeDriver,
          performance: {
            renderTime: AvatarPerformanceMonitor.getLastRenderTime() || 16.67,
            animationFPS: AvatarPerformanceMonitor.getLastFPS() || 60,
            voiceLatency: Math.random() * 100 + 200, // Mock voice latency between 200-300ms
            memoryUsage: Math.random() * 50 + 50, // Mock memory usage between 50-100MB
            errorRate: Math.random() * 0.1, // Mock error rate between 0-10%
          },
          cache: {
            voiceResponses: cacheStats.voice.size,
            animations: cacheStats.animation.size,
            userData: cacheStats.userData.size,
          },
          performanceReport,
        };
        
        setSystemStatus(status);

        const metrics = status.performance;
        const now = new Date().toLocaleTimeString();

        setPerformanceData(prev => {
          const maxDataPoints = 20;
          
          const updateArray = (arr: number[], newValue: number) => {
            const updated = [...arr, newValue];
            return updated.length > maxDataPoints ? updated.slice(-maxDataPoints) : updated;
          };

          return {
            renderTime: updateArray(prev.renderTime, metrics.renderTime),
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
        data: performanceData[selectedMetric],
        color: (opacity = 1) => `rgba(142, 84, 233, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  // Emotion chart data
  const getEmotionChartData = () => {
    return emotionData.map(item => ({
      name: item.emotion,
      count: item.count,
      color: item.color,
      legendFontColor: '#CCC',
      legendFontSize: 12,
    }));
  };

  // Learning progress chart data
  const getLearningChartData = () => {
    return {
      labels: learningData.map(item => item.subject),
      datasets: [{
        data: learningData.map(item => item.score / 100),
        color: (opacity = 1) => `rgba(142, 84, 233, ${opacity})`,
        strokeWidth: 2,
      }],
    };
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Enhanced Avatar Dashboard</Text>
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

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'performance' && styles.activeTabButton]}
          onPress={() => setActiveTab('performance')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'performance' && styles.activeTabButtonText]}>
            Performance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'learning' && styles.activeTabButton]}
          onPress={() => setActiveTab('learning')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'learning' && styles.activeTabButtonText]}>
            Learning Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {activeTab === 'performance' ? (
          // Performance Tab Content
          <>
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
                    onPress={() => setSelectedMetric(metric as NumericMetricKeys)}
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
                  data={chartData}
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
                    {systemStatus.performance.voiceLatency.toFixed(1)}ms
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Memory Usage</Text>
                  <Text style={styles.metricValue}>
                    {systemStatus.performance.memoryUsage.toFixed(1)}MB
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
          </>
        ) : (
          // Learning Analytics Tab Content
          <>
            {/* Emotion Distribution */}
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Emotion Distribution</Text>
              <Text style={styles.chartSubtitle}>
                User emotional responses during learning sessions
              </Text>
              <PieChart
                data={getEmotionChartData()}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>

            {/* Learning Progress */}
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Learning Progress by Subject</Text>
              <Text style={styles.chartSubtitle}>
                Completion percentage for each subject area
              </Text>
              <ProgressChart
                data={getLearningChartData()}
                width={screenWidth - 40}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(142, 84, 233, ${opacity})`,
                }}
              />
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.cardTitle}>Personalized Recommendations</Text>
              <View style={styles.recommendationList}>
                <View style={styles.recommendationItem}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>Focus on Science</Text>
                    <Text style={styles.recommendationDescription}>
                      Your progress in science topics is excellent. Consider advanced quantum physics lessons.
                    </Text>
                  </View>
                </View>
                <View style={styles.recommendationItem}>
                  <Ionicons name="trending-down" size={24} color="#F44336" />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>Improve History</Text>
                    <Text style={styles.recommendationDescription}>
                      Your engagement in history lessons is lower. Try interactive history simulations.
                    </Text>
                  </View>
                </View>
                <View style={styles.recommendationItem}>
                  <Ionicons name="time" size={24} color="#FF9800" />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>Optimal Learning Time</Text>
                    <Text style={styles.recommendationDescription}>
                      Your focus is highest in morning sessions. Schedule complex topics between 9-11 AM.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Learning Patterns */}
            <View style={styles.patternsCard}>
              <Text style={styles.cardTitle}>Detected Learning Patterns</Text>
              <View style={styles.patternList}>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Preferred Format</Text>
                  <Text style={styles.patternValue}>Interactive Simulations</Text>
                </View>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Concentration Span</Text>
                  <Text style={styles.patternValue}>25-30 minutes</Text>
                </View>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Learning Style</Text>
                  <Text style={styles.patternValue}>Visual-Spatial</Text>
                </View>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Retention Rate</Text>
                  <Text style={styles.patternValue}>78% after 1 week</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
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
    paddingTop: 10,
    backgroundColor: '#1F1F1F',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  monitoringToggle: {
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#AAAAAA',
    fontSize: 10,
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#8E54E9',
  },
  tabButtonText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
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
    transform: [{ translateX: -20 }, { translateY: -18 }],
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
  chartSubtitle: {
    color: '#AAAAAA',
    fontSize: 14,
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
  recommendationsCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  recommendationList: {
    gap: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  recommendationContent: {
    marginLeft: 12,
    flex: 1,
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationDescription: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  patternsCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  patternList: {
    gap: 12,
  },
  patternItem: {
    backgroundColor: '#2D2D2D',
    padding: 12,
    borderRadius: 8,
  },
  patternLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  patternValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnhancedAvatarPerformanceDashboard;
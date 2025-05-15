import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useAvatar } from '../components/Avatar/AvatarContext';

// Types for course data
interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  resources: string[];
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
}

const AIClassroomScreen: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [generatingCourse, setGeneratingCourse] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [step, setStep] = useState<'input' | 'creating' | 'result'>('input');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const navigation = useNavigation();
  const { setAvatarState } = useAvatar();

  // Sample function to generate a course - in a real app, this would call an AI service
  const generateCourse = async () => {
    setStep('creating');
    setGeneratingCourse(true);
    setAvatarState('processing');

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create a mock course based on the topic
    const newCourse: Course = {
      id: Date.now().toString(),
      title: `${topic} Fundamentals`,
      description: `A comprehensive course on ${topic} designed for ${difficulty} learners. This course covers essential concepts and practical applications.`,
      level: difficulty,
      duration: difficulty === 'beginner' ? '4 weeks' : difficulty === 'intermediate' ? '6 weeks' : '8 weeks',
      progress: 0,
      modules: [
        {
          id: '1',
          title: `Introduction to ${topic}`,
          description: `Learn the basic concepts and principles of ${topic}.`,
          duration: '1 week',
          resources: ['Video lectures', 'Interactive quizzes', 'Reading materials'],
          completed: false,
        },
        {
          id: '2',
          title: `${topic} Theory and Concepts`,
          description: 'Dive deeper into theoretical frameworks and core concepts.',
          duration: '1 week',
          resources: ['Video lectures', 'Case studies', 'Discussion forums'],
          completed: false,
        },
        {
          id: '3',
          title: `Practical ${topic} Applications`,
          description: 'Apply your knowledge to real-world scenarios and problems.',
          duration: '1 week',
          resources: ['Project work', 'Labs', 'Peer review sessions'],
          completed: false,
        },
        {
          id: '4',
          title: `Advanced ${topic} Topics`,
          description: 'Explore cutting-edge developments and specialized areas.',
          duration: '1 week',
          resources: ['Expert interviews', 'Research papers', 'Final project'],
          completed: false,
        },
      ],
    };

    setCourse(newCourse);
    setGeneratingCourse(false);
    setStep('result');
    setAvatarState('idle');
  };

  const renderInputStep = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>What would you like to learn about?</Text>
      <TextInput
        style={styles.topicInput}
        placeholder="e.g., Quantum Physics, Machine Learning, Art History..."
        placeholderTextColor="#666"
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.difficultyLabel}>Select difficulty level:</Text>
      <View style={styles.difficultyOptions}>
        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyOption,
              difficulty === level && styles.selectedDifficulty,
            ]}
            onPress={() => setDifficulty(level)}
          >
            <Text
              style={[
                styles.difficultyText,
                difficulty === level && styles.selectedDifficultyText,
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.generateButton, !topic.trim() && styles.disabledButton]}
        onPress={generateCourse}
        disabled={!topic.trim()}
      >
        <LinearGradient
          colors={['#4776E6', '#8E54E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.generateButtonGradient}
        >
          <Text style={styles.generateButtonText}>Create My Course</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCreatingStep = () => (
    <View style={styles.creatingContainer}>
      <ActivityIndicator size="large" color="#8E54E9" />
      <Text style={styles.creatingText}>Lyo is creating your personalized course...</Text>
      <Text style={styles.creatingSubtext}>This may take a moment</Text>
    </View>
  );

  const renderResultStep = () => {
    if (!course) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
        
        <View style={styles.courseMetadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={20} color="#8E54E9" />
            <Text style={styles.metadataText}>{course.duration}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="school-outline" size={20} color="#8E54E9" />
            <Text style={styles.metadataText}>{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="book-outline" size={20} color="#8E54E9" />
            <Text style={styles.metadataText}>{course.modules.length} modules</Text>
          </View>
        </View>

        <Text style={styles.modulesTitle}>Course Modules</Text>
        <FlatList
          data={course.modules}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{item.title}</Text>
                <Text style={styles.moduleDuration}>{item.duration}</Text>
              </View>
              <Text style={styles.moduleDescription}>{item.description}</Text>
              <View style={styles.resourcesContainer}>
                <Text style={styles.resourcesTitle}>Resources:</Text>
                {item.resources.map((resource, index) => (
                  <View key={index} style={styles.resourceItem}>
                    <Ionicons name="document-text-outline" size={16} color="#8E54E9" />
                    <Text style={styles.resourceText}>{resource}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.enrollButton}>
          <LinearGradient
            colors={['#4776E6', '#8E54E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enrollButtonGradient}
          >
            <Text style={styles.enrollButtonText}>Enroll in Course</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.startOverButton} onPress={() => setStep('input')}>
          <Text style={styles.startOverText}>Create Another Course</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Classroom</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'input' && renderInputStep()}
        {step === 'creating' && renderCreatingStep()}
        {step === 'result' && renderResultStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderView: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputLabel: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  topicInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
  },
  difficultyLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  difficultyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: 'rgba(142, 84, 233, 0.3)',
    borderWidth: 1,
    borderColor: '#8E54E9',
  },
  difficultyText: {
    color: '#ccc',
    fontWeight: '500',
  },
  selectedDifficultyText: {
    color: '#fff',
  },
  generateButton: {
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateButtonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  creatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  creatingSubtext: {
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  courseDescription: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  courseMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    color: '#ccc',
    marginLeft: 8,
  },
  modulesTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  moduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  moduleDuration: {
    color: '#8E54E9',
    fontSize: 14,
  },
  moduleDescription: {
    color: '#ccc',
    marginBottom: 15,
  },
  resourcesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
  },
  resourcesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  resourceText: {
    color: '#ccc',
    marginLeft: 8,
  },
  enrollButton: {
    marginTop: 20,
  },
  enrollButtonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startOverButton: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
  },
  startOverText: {
    color: '#8E54E9',
    fontSize: 16,
  },
});

export default AIClassroomScreen;

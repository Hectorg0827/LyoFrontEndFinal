import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Course {
  id: string;
  title: string;
  author: string;
  duration: string;
  level: string;
  imageUrl: string;
  progress?: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  instructorName: string;
  instructorImage: string;
  attendees: number;
}

interface SkillPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  imageUrl: string;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Data Science',
    author: 'Dr. Sarah Williams',
    duration: '4h 30m',
    level: 'Beginner',
    imageUrl: 'https://picsum.photos/500/300',
    progress: 0.35,
  },
  {
    id: '2',
    title: 'Advanced JavaScript Patterns',
    author: 'Mark Brown',
    duration: '6h 15m',
    level: 'Intermediate',
    imageUrl: 'https://picsum.photos/501/300',
  },
  {
    id: '3',
    title: 'Psychology 101',
    author: 'Dr. Emily Johnson',
    duration: '8h 45m',
    level: 'Beginner',
    imageUrl: 'https://picsum.photos/502/300',
    progress: 0.15,
  },
];

const events: Event[] = [
  {
    id: '1',
    title: 'Deep Learning Workshop',
    date: 'Tomorrow',
    time: '6:00 PM',
    instructorName: 'Prof. Alex Chen',
    instructorImage: 'https://placekitten.com/100/100',
    attendees: 48,
  },
  {
    id: '2',
    title: 'Creative Writing Masterclass',
    date: 'May 18',
    time: '3:30 PM',
    instructorName: 'Jane Austen',
    instructorImage: 'https://placekitten.com/101/101',
    attendees: 36,
  },
];

const skillPaths: SkillPath[] = [
  {
    id: '1',
    title: 'Machine Learning Engineer',
    description: 'Master the fundamentals of ML and build real-world projects',
    duration: '2 months',
    modules: 12,
    imageUrl: 'https://picsum.photos/503/300',
  },
  {
    id: '2',
    title: 'Full Stack Web Development',
    description: 'Learn modern web development from frontend to backend',
    duration: '3 months',
    modules: 18,
    imageUrl: 'https://picsum.photos/504/300',
  },
];

const LearnScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Continue Learning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {courses.filter(course => course.progress).map(course => (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <Image source={{ uri: course.imageUrl }} style={styles.courseImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.courseGradient}
                />
                <View style={styles.courseContent}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{course.level}</Text>
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseAuthor}>{course.author}</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${(course.progress || 0) * 100}%` }]} />
                    <Text style={styles.progressText}>{Math.round((course.progress || 0) * 100)}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Just in case there are no courses in progress */}
            {courses.filter(course => course.progress).length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>Start a course to see your progress here</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Live & Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live & Upcoming</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsContainer}
          >
            {events.map(event => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <LinearGradient
                  colors={['#4A00E0', '#8E2DE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventGradient}
                >
                  <View style={styles.eventStatus}>
                    <View style={styles.liveDot} />
                    <Text style={styles.eventStatusText}>LIVE SOON</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventTimeContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#fff" />
                    <Text style={styles.eventTime}>{event.date} • {event.time}</Text>
                  </View>
                  <View style={styles.eventInstructor}>
                    <Image source={{ uri: event.instructorImage }} style={styles.instructorImage} />
                    <Text style={styles.instructorName}>with {event.instructorName}</Text>
                  </View>
                  <View style={styles.attendeesContainer}>
                    <Ionicons name="people-outline" size={14} color="#fff" />
                    <Text style={styles.attendeesText}>{event.attendees} attending</Text>
                  </View>
                  <TouchableOpacity style={styles.remindButton}>
                    <Text style={styles.remindButtonText}>Remind Me</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {courses.map(course => (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <Image source={{ uri: course.imageUrl }} style={styles.courseImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.courseGradient}
                />
                <View style={styles.courseContent}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{course.level}</Text>
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseAuthor}>{course.author}</Text>
                  <View style={styles.courseInfo}>
                    <Ionicons name="time-outline" size={12} color="#aaa" />
                    <Text style={styles.courseInfoText}>{course.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Skill Paths Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skill Paths</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {skillPaths.map(path => (
            <TouchableOpacity key={path.id} style={styles.pathCard}>
              <Image source={{ uri: path.imageUrl }} style={styles.pathImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.pathGradient}
              />
              <View style={styles.pathContent}>
                <Text style={styles.pathTitle}>{path.title}</Text>
                <Text style={styles.pathDescription}>{path.description}</Text>
                <View style={styles.pathDetails}>
                  <View style={styles.pathDetailItem}>
                    <Ionicons name="time-outline" size={14} color="#aaa" />
                    <Text style={styles.pathDetailText}>{path.duration}</Text>
                  </View>
                  <View style={styles.pathDetailItem}>
                    <Ionicons name="layers-outline" size={14} color="#aaa" />
                    <Text style={styles.pathDetailText}>{path.modules} modules</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.enrollButton}>
                  <Text style={styles.enrollButtonText}>Enroll Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactive Learning</Text>
          
          <View style={styles.toolsGrid}>
            <TouchableOpacity style={[styles.toolCard, styles.quizTool]}>
              <LinearGradient
                colors={['#FF416C', '#FF4B2B']}
                style={styles.toolGradient}
              >
                <Ionicons name="help-circle" size={32} color="#fff" />
                <Text style={styles.toolTitle}>Daily Quiz</Text>
                <Text style={styles.toolDescription}>Test your knowledge with AI-generated questions</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolCard, styles.flashcardsTool]}>
              <LinearGradient
                colors={['#4776E6', '#8E54E9']}
                style={styles.toolGradient}
              >
                <Ionicons name="albums" size={32} color="#fff" />
                <Text style={styles.toolTitle}>Flashcards</Text>
                <Text style={styles.toolDescription}>Review key concepts with spaced repetition</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolCard, styles.arTool]}>
              <LinearGradient
                colors={['#00c6ff', '#0072ff']}
                style={styles.toolGradient}
              >
                <Ionicons name="cube" size={32} color="#fff" />
                <Text style={styles.toolTitle}>AR Lessons</Text>
                <Text style={styles.toolDescription}>Interactive 3D models coming soon</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolCard, styles.practiceTool]}>
              <LinearGradient
                colors={['#16A085', '#2ECC71']}
                style={styles.toolGradient}
              >
                <Ionicons name="code-slash" size={32} color="#fff" />
                <Text style={styles.toolTitle}>Practice Lab</Text>
                <Text style={styles.toolDescription}>Hands-on coding exercises with feedback</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* The floating Learn button would be part of the tab navigator */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3498db',
    fontSize: 14,
  },
  coursesContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  courseCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  courseGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  courseContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  levelBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  courseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseAuthor: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 8,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseInfoText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 8,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    bottom: 6,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 280,
    height: 180,
    backgroundColor: '#111',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  eventsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  eventCard: {
    width: 220,
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  eventGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff375f',
    marginRight: 6,
  },
  eventStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTime: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  eventInstructor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    color: '#fff',
    fontSize: 12,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendeesText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  remindButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  remindButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pathCard: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  pathImage: {
    width: '100%',
    height: '100%',
  },
  pathGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  pathContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  pathTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  pathDescription: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 12,
  },
  pathDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pathDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  pathDetailText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
  },
  enrollButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    height: 160,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toolGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  toolTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  toolDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 16,
  },
  quizTool: {
    backgroundColor: '#e74c3c',
  },
  flashcardsTool: {
    backgroundColor: '#9b59b6',
  },
  arTool: {
    backgroundColor: '#3498db',
  },
  practiceTool: {
    backgroundColor: '#2ecc71',
  },
});

export default LearnScreen;

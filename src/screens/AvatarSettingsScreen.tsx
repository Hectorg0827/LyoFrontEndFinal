import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Slider,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useAvatar } from '../components/Avatar/AvatarContext';
import { LinearGradient } from 'expo-linear-gradient';

const AvatarSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userPreferences, updateUserPreference } = useAvatar();
  
  // Local state for form values
  const [voiceEnabled, setVoiceEnabled] = useState(userPreferences.voiceEnabled);
  const [animationsEnabled, setAnimationsEnabled] = useState(userPreferences.animationsEnabled);
  const [avatarColor, setAvatarColor] = useState(userPreferences.avatarColor);
  const [voiceRate, setVoiceRate] = useState(userPreferences.voiceRate);
  const [voicePitch, setVoicePitch] = useState(userPreferences.voicePitch);
  const [newInterest, setNewInterest] = useState('');
  
  // Available color themes for the avatar
  const colorThemes = [
    '#8E54E9', // Default purple
    '#4776E6', // Blue
    '#00C9FF', // Cyan
    '#FF5454', // Red
    '#FF8008', // Orange
    '#16A085', // Green
  ];

  // Update local state when preferences change
  useEffect(() => {
    setVoiceEnabled(userPreferences.voiceEnabled);
    setAnimationsEnabled(userPreferences.animationsEnabled);
    setAvatarColor(userPreferences.avatarColor);
    setVoiceRate(userPreferences.voiceRate);
    setVoicePitch(userPreferences.voicePitch);
  }, [userPreferences]);

  // Handle adding a new learning interest
  const handleAddInterest = () => {
    if (newInterest.trim() === '') return;
    
    // Check if already exists
    if (userPreferences.learningInterests.includes(newInterest.trim())) {
      Alert.alert('Already added', 'This interest is already in your list.');
      return;
    }
    
    updateUserPreference('learningInterests', [
      ...userPreferences.learningInterests,
      newInterest.trim(),
    ]);
    setNewInterest('');
  };

  // Handle removing a learning interest
  const handleRemoveInterest = (interest: string) => {
    updateUserPreference(
      'learningInterests',
      userPreferences.learningInterests.filter(item => item !== interest)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lyo Settings</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Avatar Color</Text>
            <View style={styles.colorOptionsContainer}>
              {colorThemes.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    avatarColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => {
                    setAvatarColor(color);
                    updateUserPreference('avatarColor', color);
                  }}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Animations</Text>
            <Switch
              value={animationsEnabled}
              onValueChange={(value) => {
                setAnimationsEnabled(value);
                updateUserPreference('animationsEnabled', value);
              }}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Voice</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={(value) => {
                setVoiceEnabled(value);
                updateUserPreference('voiceEnabled', value);
              }}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Voice Speed</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={voiceRate}
                onValueChange={setVoiceRate}
                onSlidingComplete={(value) => {
                  updateUserPreference('voiceRate', value);
                }}
                minimumTrackTintColor="#8E54E9"
                maximumTrackTintColor="#3e3e3e"
                thumbTintColor="#f4f3f4"
                disabled={!voiceEnabled}
              />
              <Text style={styles.sliderValue}>{voiceRate.toFixed(1)}x</Text>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Voice Pitch</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={voicePitch}
                onValueChange={setVoicePitch}
                onSlidingComplete={(value) => {
                  updateUserPreference('voicePitch', value);
                }}
                minimumTrackTintColor="#8E54E9"
                maximumTrackTintColor="#3e3e3e"
                thumbTintColor="#f4f3f4"
                disabled={!voiceEnabled}
              />
              <Text style={styles.sliderValue}>{voicePitch.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Interests</Text>
          <Text style={styles.sectionDescription}>
            Add your learning interests to get personalized recommendations from Lyo.
          </Text>
          
          <View style={styles.interestInputContainer}>
            <TextInput
              style={styles.interestInput}
              placeholder="Add a learning interest..."
              placeholderTextColor="#777"
              value={newInterest}
              onChangeText={setNewInterest}
              onSubmitEditing={handleAddInterest}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddInterest}
              disabled={!newInterest.trim()}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.interestTagsContainer}>
            {userPreferences.learningInterests.length === 0 ? (
              <Text style={styles.noInterestsText}>
                No interests added yet. Add your first interest above!
              </Text>
            ) : (
              userPreferences.learningInterests.map((interest) => (
                <View key={interest} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                  <TouchableOpacity
                    style={styles.removeInterestButton}
                    onPress={() => handleRemoveInterest(interest)}
                  >
                    <Ionicons name="close-circle" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning History</Text>
          <Text style={styles.sectionDescription}>
            Courses and topics you've explored with Lyo.
          </Text>
          
          <View style={styles.historyList}>
            {userPreferences.courseHistory.length === 0 ? (
              <Text style={styles.noHistoryText}>
                You haven't explored any courses with Lyo yet.
              </Text>
            ) : (
              userPreferences.courseHistory.map((course, index) => (
                <View key={index} style={styles.historyItem}>
                  <Ionicons name="book-outline" size={20} color="#8E54E9" />
                  <Text style={styles.historyText}>{course}</Text>
                </View>
              ))
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.resetButton} onPress={() => {
          Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all Lyo settings to default values?',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                  // Reset all settings to default
                  updateUserPreference('voiceEnabled', true);
                  updateUserPreference('animationsEnabled', true);
                  updateUserPreference('avatarColor', '#8E54E9');
                  updateUserPreference('voiceRate', 1.0);
                  updateUserPreference('voicePitch', 1.0);
                  // Keep learning interests and history
                }
              }
            ]
          );
        }}>
          <Text style={styles.resetButtonText}>Reset to Default Settings</Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  sectionDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  settingLabel: {
    color: '#ddd',
    fontSize: 16,
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    color: '#ddd',
    width: 40,
    textAlign: 'right',
  },
  interestInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  interestInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#8E54E9',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noInterestsText: {
    color: '#777',
    fontStyle: 'italic',
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 84, 233, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  interestTagText: {
    color: '#fff',
    marginRight: 5,
  },
  removeInterestButton: {
    padding: 2,
  },
  historyList: {
    marginTop: 5,
  },
  noHistoryText: {
    color: '#777',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyText: {
    color: '#ddd',
    marginLeft: 10,
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#FF5454',
    fontSize: 16,
  },
});

export default AvatarSettingsScreen;

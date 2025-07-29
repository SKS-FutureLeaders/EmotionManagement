import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

// Time of day options with custom colors
const timeOfDay = [
  { name: 'Morning', icon: 'sunny-outline', emoji: '🌅', color: '#64B5F6' }, // Light blue
  { name: 'Afternoon', icon: 'partly-sunny-outline', emoji: '🌤️', color: '#FF9800' }, // Orange
  { name: 'Evening', icon: 'moon-outline', emoji: '🌆', color: '#1A237E' }, // Dark blue
  { name: 'Night', icon: 'star-outline', emoji: '🌙', color: '#212121' }, // Black
];

// Updated kid-friendly emotions with more engaging emojis
const emotions = [
  { name: 'Happy', icon: 'happy-outline', color: '#4CAF50', emoji: '😄' },
  { name: 'Sad', icon: 'sad-outline', color: '#2196F3', emoji: '😢' },
  { name: 'Angry', icon: 'flame-outline', color: '#FF5252', emoji: '😡' },
  { name: 'Scared', icon: 'ghost-outline', color: '#9C27B0', emoji: '😨' },
  { name: 'Excited', icon: 'star-outline', color: '#FF9800', emoji: '🤩' },
  { name: 'Calm', icon: 'water-outline', color: '#00BCD4', emoji: '😌' },
  { name: 'Proud', icon: 'trophy-outline', color: '#FFC107', emoji: '🥳' },
  { name: 'Silly', icon: 'ice-cream-outline', color: '#8BC34A', emoji: '🤪' },
];

// Intensity level images for the slider
const intensityImages = [
  'https://cdn-icons-png.flaticon.com/512/742/742751.png', // Small/mild
  'https://cdn-icons-png.flaticon.com/512/1791/1791330.png'  // Angry face for anger journal
];

// Backend API URL - update this with your actual API endpoint
const API_URL = Platform.OS === "web" 
      ? "http://localhost:5000" 
      : "http://192.168.136.40:5000";

interface JournalEntryScreenProps {
  navigation: any;
}

const JournalEntryScreen: React.FC<JournalEntryScreenProps> = ({ navigation }) => {
  const [headline, setHeadline] = useState(''); // News headline style entry
  const [angerTrigger, setAngerTrigger] = useState(''); // What made me angry
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>(''); 
  const [emotionIntensity, setEmotionIntensity] = useState(3); 
  const [coping, setCoping] = useState('');
  const [consequences, setConsequences] = useState('');
  const [improvements, setImprovements] = useState('');
  const [wobble] = useState(new Animated.Value(0)); 
  const [bounce] = useState(new Animated.Value(1)); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Wobble animation for fun feedback
  const startWobble = () => {
    Animated.sequence([
      Animated.timing(wobble, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
    
    // Add haptic feedback if available
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Bounce animation for selections
  const startBounce = () => {
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  // Time of day selection
  const selectTimeOfDay = (time: string) => {
    startBounce();
    setSelectedTimeOfDay(time);
  };

  // Changed to single emotion selection
  const selectEmotion = (emotion: string) => {
    startBounce();
    startWobble();
    setSelectedEmotion(emotion);
  };

  const getRandomEncouragement = () => {
    const encouragements = [
      "Amazing job! 🌟",
      "You're doing great! 🎉",
      "Wow! Super thinking! 🦸‍♂️",
      "That's awesome! 🚀",
      "Way to go! 🏆",
      "Super cool! 🤩",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  // Function to submit data to backend
  const submitToBackend = async (journalEntry: any) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("No user token found");
        }

        const response = await fetch(`${API_URL}/childauth/journal`, { // Adjust API route
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(journalEntry),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Journal update success:", responseData);
        return responseData;
    } catch (error) {
        console.error("Error submitting journal entry:", error);
        throw error;
    }
};


  // Save locally as fallback

  const handleSave = async () => {
    // Validate form with kid-friendly messages
    if (selectedTimeOfDay === '') {
      Alert.alert('Quick question! ⏰', 'When did this happen? Morning, afternoon, evening, or night?');
      return;
    }
    
    if (headline.trim() === '') {
      Alert.alert('Make a headline! 📰', 'Give your story a cool news headline!');
      return;
    }
    
    if (angerTrigger.trim() === '') {
      Alert.alert('One more thing! 😡', 'What made you feel angry? Tell us what happened!');
      return;
    }
    
    if (!selectedEmotion) {
      Alert.alert('One more thing! 🎯', 'How did you feel? Tap a feeling bubble!');
      return;
    }
    
    if (coping.trim() === '') {
      Alert.alert('Almost there! 🚀', 'Tell us what you did about it!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get child ID from storage
      
      // Create journal entry object
      const journalEntry = {
        date: new Date().toISOString(),
        timeOfDay: selectedTimeOfDay,
        headline,
        angerTrigger,
        emotion: selectedEmotion,
        emotionIntensity,
        coping,
        consequences,
        improvements
      };

      // Submit to backend
      await submitToBackend(journalEntry);

      resetForm();
      
      // Show success message
      Alert.alert(
        getRandomEncouragement(), 
        'Your anger journal has been saved! 📓\n\nGreat job working on your feelings!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              // Return to previous screen
              router.push('/dashboard')
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTimeOfDay('');
    setHeadline('');
    setAngerTrigger('');
    setSelectedEmotion('');
    setEmotionIntensity(3);
    setCoping('');
    setConsequences('');
    setImprovements('');
  };

  const renderStarIcon = () => (
    <Ionicons name="star" size={20} color="#FFD700" style={{marginRight: 5}} />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2641/2641403.png' }} 
            style={styles.journalIcon} 
          />
          <Text style={styles.headerText}>My Anger Journal</Text>
          <Text style={styles.dateText}>Today is {new Date().toLocaleDateString()} 📅</Text>
        </View>

        {/* Time of Day Selection with custom colors */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>1</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>When did this happen? ⏰</Text>
              <Text style={styles.sectionSubtitle}>Tap the time of day</Text>
            </View>
          </View>
          
          <View style={styles.timeOfDayContainer}>
            {timeOfDay.map((time) => (
              <TouchableOpacity
                key={time.name}
                style={[
                  styles.timeButton,
                  selectedTimeOfDay === time.name && {
                    backgroundColor: time.color,
                    borderColor: time.color,
                  },
                ]}
                onPress={() => selectTimeOfDay(time.name)}
              >
                <Text style={styles.timeEmoji}>{time.emoji}</Text>
                <Ionicons
                  name={time.icon as keyof typeof Ionicons.glyphMap}
                  size={26}
                  color={selectedTimeOfDay === time.name ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.timeText,
                    selectedTimeOfDay === time.name && styles.selectedTimeText,
                  ]}
                >
                  {time.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Headline */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>2</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>Make a headline! 📰</Text>
              <Text style={styles.sectionSubtitle}>Like a news story</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Example: 'Mom on rampage - No video games!'"
            placeholderTextColor="#BBBBBB"
            value={headline}
            onChangeText={setHeadline}
            maxLength={50}
          />
          <Text style={styles.characterCount}>{headline.length}/50 characters</Text>
        </View>

        {/* Anger Trigger */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>3</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>What made you feel angry? 😡</Text>
              <Text style={styles.sectionSubtitle}>Tell me what happened</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            multiline
            placeholder="I got angry because..."
            placeholderTextColor="#BBBBBB"
            value={angerTrigger}
            onChangeText={setAngerTrigger}
          />
        </View>

        {/* Emotions */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>4</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>How did you feel? 💭</Text>
              <Text style={styles.sectionSubtitle}>Besides angry, did you feel something else too?</Text>
            </View>
          </View>
          <View style={styles.emotionsContainer}>
            {emotions.map((emotion) => (
              <Animated.View 
                key={emotion.name}
                style={{
                  transform: [{ scale: selectedEmotion === emotion.name ? bounce : 1 }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.emotionButton,
                    selectedEmotion === emotion.name && { 
                      backgroundColor: emotion.color,
                      borderColor: emotion.color,
                      transform: [{ scale: 1.05 }]
                    },
                  ]}
                  onPress={() => selectEmotion(emotion.name)}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Ionicons
                    name={emotion.icon as keyof typeof Ionicons.glyphMap}
                    size={30}
                    color={selectedEmotion === emotion.name ? '#fff' : emotion.color}
                  />
                  <Text
                    style={[
                      styles.emotionText,
                      selectedEmotion === emotion.name && styles.selectedEmotionText,
                    ]}
                  >
                    {emotion.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          <Text style={styles.helperText}>Tap one feeling that you had!</Text>
        </View>

        {/* Anger Intensity */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>5</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>How angry were you? 🌋</Text>
              <Text style={styles.sectionSubtitle}>From a little to SUPER angry</Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabel}>
              <Image source={{ uri: intensityImages[0] }} style={styles.smallEmoji} />
              <Text style={styles.sliderLabelText}>Little</Text>
            </View>
            
            <View style={styles.slider}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Animated.View
                  key={level}
                  style={{
                    transform: [
                      { translateY: emotionIntensity === level ? wobble : new Animated.Value(0) }
                    ]
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.sliderBubble,
                      { 
                        backgroundColor: level <= emotionIntensity ? 
                          `rgba(${Math.min(255, 180 + level * 15)}, ${Math.max(0, 100 - level * 22)}, ${Math.max(0, 50 - level * 10)}, 1)` : 
                          '#E0E0E0',
                        width: 30 + (level * 5),
                        height: 30 + (level * 5),
                      },
                    ]}
                    onPress={() => {
                      setEmotionIntensity(level);
                      startWobble();
                    }}
                  >
                    <Text style={styles.sliderText}>{level}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            
            <View style={styles.sliderLabel}>
              <Image source={{ uri: intensityImages[1] }} style={styles.largeEmoji} />
              <Text style={styles.sliderLabelText}>SUPER!</Text>
            </View>
          </View>
        </View>

        {/* Coping */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>6</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>How did you handle it? 🧠</Text>
              <Text style={styles.sectionSubtitle}>What did you do when you felt angry?</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            multiline
            placeholder="When I was angry, I..."
            placeholderTextColor="#BBBBBB"
            value={coping}
            onChangeText={setCoping}
          />
          <View style={styles.tipContainer}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3588/3588214.png' }} 
              style={styles.tipIcon} 
            />
            <Text style={styles.tipText}>It's OK to ask for help with big angry feelings! 🤝</Text>
          </View>
        </View>

        {/* Consequences */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>7</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>What happened after? ⏭️</Text>
              <Text style={styles.sectionSubtitle}>What was the result?</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            multiline
            placeholder="After I got angry, what happened was..."
            placeholderTextColor="#BBBBBB"
            value={consequences}
            onChangeText={setConsequences}
          />
        </View>

        {/* Future Improvements */}
        <View style={styles.card}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>8</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.sectionTitle}>Next time I could try... 🚀</Text>
              <Text style={styles.sectionSubtitle}>Better ways to handle my anger</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Next time I'm angry, I could try..."
            placeholderTextColor="#BBBBBB"
            value={improvements}
            onChangeText={setImprovements}
          />
          <View style={styles.tipContainer}>
            {renderStarIcon()}
            <Text style={styles.tipText}>Learning to manage anger makes you stronger!</Text>
            {renderStarIcon()}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={resetForm}
            disabled={isSubmitting}
          >
            <Ionicons name="refresh-outline" size={24} color="#666" style={styles.buttonIcon} />
            <Text style={styles.cancelButtonText}>Start Over</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="save-outline" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Save My Story!</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footerContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2450/2450351.png' }} 
            style={styles.footerImage} 
          />
          <Text style={styles.footerText}>You're awesome for working on your anger! 💪</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F6', // Warmer background for anger theme
  },
  scrollContainer: {
    padding: 18,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  journalIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#E53935', // Red for anger theme
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 20,
    color: '#7986CB',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  offlineText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E0E8FF',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionNumber: {
    backgroundColor: '#4F6DF5',
    color: 'white',
    width: 38,
    height: 38,
    borderRadius: 19,
    textAlign: 'center',
    lineHeight: 38,
    fontWeight: 'bold',
    fontSize: 22,
    marginRight: 12,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  input: {
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 16,
    paddingTop: 16,
    borderWidth: 2,
    borderColor: '#E0E8FF',
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    letterSpacing: 0.5,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emotionButton: {
    width: 90,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: '#E0E0FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emotionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emotionText: {
    marginTop: 6,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  selectedEmotionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 12,
  },
  sliderLabel: {
    alignItems: 'center',
    width: 60,
  },
  sliderLabelText: {
    fontSize: 18,
    color: '#666',
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  smallEmoji: {
    width: 35,
    height: 35,
  },
  largeEmoji: {
    width: 45,
    height: 45,
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sliderBubble: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    padding: 10,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  tipIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  tipText: {
    color: '#5C7CFA',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 0.65,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7', // Lighter
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 0.32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  buttonIcon: {
    marginRight: 8,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  footerImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 22,
    color: '#666',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  // New styles for time of day and headline
  timeOfDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  characterCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
});

export default JournalEntryScreen;

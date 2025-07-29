import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  Platform,
  Alert,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { saveJournalEntry, getSummary } from '../../constants/api';

// Time of day options
const timeOptions = [
  { name: 'Morning', icon: 'sunny-outline', emoji: '🌅', color: '#FF9800' }, // Orange
  { name: 'Afternoon', icon: 'partly-sunny-outline', emoji: '☀️', color: '#FFC107' }, // Amber
  { name: 'Evening', icon: 'moon-outline', emoji: '🌆', color: '#673AB7' }, // Deep Purple
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

const EmotionalJournal = () => {
  const router = useRouter();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('');
  const [headline, setHeadline] = useState('');
  const [trigger, setTrigger] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [emotionIntensity, setEmotionIntensity] = useState(3);
  const [coping, setCoping] = useState('');
  const [consequences, setConsequences] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [childName, setChildName] = useState<string>("Me");
  
  // Animations
  const [wobble] = useState(new Animated.Value(0));
  const [bounce] = useState(new Animated.Value(1));
  
  useEffect(() => {
    // Get user info
    const getUserInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo);
          if (parsedInfo.name) {
            setChildName(parsedInfo.name);
          }
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };
    
    getUserInfo();
  }, []);

  // Animation functions
  const startWobble = () => {
    Animated.sequence([
      Animated.timing(wobble, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -5, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const startBounce = () => {
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  // Time of day selection
  const selectTimeOfDay = (time: string) => {
    startBounce();
    setSelectedTimeOfDay(time);
  };

  // Emotion selection
  const selectEmotion = (emotion: string) => {
    startBounce();
    startWobble();
    setSelectedEmotion(emotion);
  };

  // Get random encouragement for success message
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

  // Submit journal entry
  const handleSubmit = async () => {
    // Validate form with kid-friendly messages
    if (selectedTimeOfDay === '') {
      Alert.alert('Quick question! ⏰', 'When did this happen? Morning, afternoon, evening, or night?');
      return;
    }
    
    if (headline.trim() === '') {
      Alert.alert('Make a headline! 📰', 'Give your story a cool news headline!');
      return;
    }
    
    if (trigger.trim() === '') {
      Alert.alert('One more thing! 😡', 'What made you feel this way? Tell us what happened!');
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
      // Create journal entry object
      const journalEntry = {
        date: new Date().toISOString(),
        timeOfDay: selectedTimeOfDay,
        headline,
        angerTrigger: trigger, // For compatibility with existing code
        trigger: trigger, // More general name for trigger
        emotions: [selectedEmotion],
        emotionIntensity,
        coping,
        consequence: consequences,
        improvement: improvements
      };

      // Submit to backend
      const success = await saveJournalEntry(journalEntry);

      if (success) {
        resetForm();
        
        // Show success message
        Alert.alert(
          getRandomEncouragement(), 
          'Your emotions journal has been saved! 📓\n\nGreat job working on your feelings!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Oops!', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Oops!', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTimeOfDay('');
    setHeadline('');
    setTrigger('');
    setSelectedEmotion('');
    setEmotionIntensity(3);
    setCoping('');
    setConsequences('');
    setImprovements('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Emotions Journal</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3209/3209230.png' }} 
              style={styles.journalIcon} 
            />
            <Text style={styles.headerText}>My Feelings Today</Text>
          </View>
          
          {/* When did this happen? */}
          <View style={styles.card}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionNumber}>1</Text>
              <View style={styles.questionTextContainer}>
                <Text style={styles.sectionTitle}>When did this happen? 🕒</Text>
                <Text style={styles.sectionSubtitle}>Morning, afternoon, evening or night?</Text>
              </View>
            </View>
            
            <View style={styles.timeOptionsContainer}>
              {timeOptions.map((option) => (
                <Animated.View 
                  key={option.name}
                  style={{
                    transform: [{ scale: selectedTimeOfDay === option.name ? bounce : 1 }]
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.timeOption,
                      selectedTimeOfDay === option.name && { 
                        backgroundColor: option.color,
                        borderColor: option.color 
                      }
                    ]}
                    onPress={() => selectTimeOfDay(option.name)}
                  >
                    <Text style={styles.timeEmoji}>{option.emoji}</Text>
                    <Ionicons
                      name={option.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={selectedTimeOfDay === option.name ? '#fff' : option.color}
                    />
                    <Text
                      style={[
                        styles.timeText,
                        selectedTimeOfDay === option.name && styles.selectedTimeText
                      ]}
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
          
          {/* Headline */}
          <View style={styles.card}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionNumber}>2</Text>
              <View style={styles.questionTextContainer}>
                <Text style={styles.sectionTitle}>What happened? 📰</Text>
                <Text style={styles.sectionSubtitle}>Give your story a headline</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={headline}
              onChangeText={setHeadline}
              placeholder="Something happened that made me feel..."
              placeholderTextColor="#BBBBBB"
            />
          </View>
          
          {/* What triggered the emotion? */}
          <View style={styles.card}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionNumber}>3</Text>
              <View style={styles.questionTextContainer}>
                <Text style={styles.sectionTitle}>What caused this feeling? 💭</Text>
                <Text style={styles.sectionSubtitle}>Tell us what happened</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              multiline
              placeholder="I felt this way because..."
              placeholderTextColor="#BBBBBB"
              value={trigger}
              onChangeText={setTrigger}
            />
          </View>
          
          {/* Emotions */}
          <View style={styles.card}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionNumber}>4</Text>
              <View style={styles.questionTextContainer}>
                <Text style={styles.sectionTitle}>How did you feel? 💭</Text>
                <Text style={styles.sectionSubtitle}>What emotions did you experience?</Text>
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
            <Text style={styles.helperText}>Tap the feeling that describes you best!</Text>
          </View>
          
          {/* Emotion Intensity */}
          <View style={styles.card}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionNumber}>5</Text>
              <View style={styles.questionTextContainer}>
                <Text style={styles.sectionTitle}>How strong was this feeling? 🌋</Text>
                <Text style={styles.sectionSubtitle}>From a little to SUPER strong</Text>
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
          
          {/* Coping strategy */}
          <View style={styles.card}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionNumber}>6</Text>
              <View style={styles.questionTextContainer}>
                <Text style={styles.sectionTitle}>What did you do about it? 🤔</Text>
                <Text style={styles.sectionSubtitle}>How did you handle your feelings?</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              multiline
              placeholder="When I felt this way, I..."
              placeholderTextColor="#BBBBBB"
              value={coping}
              onChangeText={setCoping}
            />
            <View style={styles.tipContainer}>
              <Ionicons name="information-circle" size={20} color="#2196F3" style={{marginRight: 5}} />
              <Text style={styles.tipText}>It's OK to ask for help with big feelings! 🤝</Text>
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
              placeholder="After I felt this way, what happened was..."
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
                <Text style={styles.sectionTitle}>Next time? 🔮</Text>
                <Text style={styles.sectionSubtitle}>What might help next time?</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Next time I could try to..."
              placeholderTextColor="#BBBBBB"
              value={improvements}
              onChangeText={setImprovements}
            />
          </View>
          
          {/* Submit button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Save Journal Entry</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>You're awesome for working on your feelings! 💪</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F6', // Warmer background
  },
  header: {
    backgroundColor: '#4F6DF5',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
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
    color: '#4F6DF5', // Blue for general emotion journal theme
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  subHeaderText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  questionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4F6DF5',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 10,
    overflow: 'hidden',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  questionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
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
  tipText: {
    fontSize: 16,
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  submitButton: {
    backgroundColor: '#4F6DF5',
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: 'rgba(79, 109, 245, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 9,
    elevation: 6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeOption: {
    width: 80,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 16,
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
  timeEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmotionalJournal;

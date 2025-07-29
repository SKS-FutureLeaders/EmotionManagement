import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  withSpring,
  withRepeat,  // Add this import
  Easing 
} from 'react-native-reanimated';
// Rest of your imports...
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.12.240:5000";

const { width } = Dimensions.get('window');

// Sample kindness actions with corresponding images
const kindnessActions = [
  {
    id: '1',
    title: 'Help someone who dropped something',
    image: require('../../../assets/images/help-pickup.png'),
    animation: 'wave'
  },
  {
    id: '2',
    title: 'Share your toys or snacks with others',
    image: require('../../../assets/images/sharing.png'),
    animation: 'wave'
  },
  {
    id: '3',
    title: 'Say something nice to make someone smile',
    image: require('../../../assets/images/kind-words.png'),
    animation: 'wave'
  },
  {
    id: '4',
    title: 'Include someone who feels left out',
    image: require('../../../assets/images/include-others.png'),
    animation: 'wave'
  },
];

// Image descriptions for assets:
// help-pickup.png - A child bending down to help another pick up dropped books or toys
// sharing.png - Two children sharing food, toys, or supplies together
// kind-words.png - Children talking with speech bubbles containing hearts or kind words
// include-others.png - A group of children inviting a lone child to join their activity

export default function KindnessLesson() {
  const router = useRouter();
  const [completedSections, setCompletedSections] = useState({
    lesson: false,
    story: false,
    quiz: false
  });
  const [progress, setProgress] = useState(0);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const sparkleScale = useSharedValue(0.5);
  const actionAnimations = kindnessActions.map(() => ({
    opacity: useSharedValue(0),
    translateX: useSharedValue(width),
    scale: useSharedValue(1)
  }));
  
  useEffect(() => {
    // Fetch user progress
    fetchProgress();
    
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 800 });
    
    // Content fade in
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    
    // Sparkle effect
    sparkleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    sparkleScale.value = withDelay(800, 
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 400 })
      )
    );
    
    // Staggered animation for action cards
    kindnessActions.forEach((_, index) => {
      actionAnimations[index].opacity.value = withDelay(
        1000 + (index * 200),
        withTiming(1, { duration: 400 })
      );
      
      actionAnimations[index].translateX.value = withDelay(
        1000 + (index * 200),
        withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
      );
      
      // Start the specific animation for this action
      startActionAnimation(index);
    });
  }, []);
  
  // Fetch user's progress from the API
  const fetchProgress = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/curriculum/progress/kindness`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const { lesson, story, quiz } = response.data.progress;
        setCompletedSections({
          lesson: lesson || false,
          story: story || false,
          quiz: quiz || false
        });
        
        // Calculate overall progress percentage
        let completedCount = 0;
        if (lesson) completedCount++;
        if (story) completedCount++;
        if (quiz) completedCount++;
        
        setProgress((completedCount / 3) * 100);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Continue with default values if API call fails
    }
  };
  
  // Start the animation specific to each action card
  const startActionAnimation = (index) => {
    const animations = {
      bounce: () => {
        actionAnimations[index].scale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 200 }),
            withTiming(1, { duration: 200 })
          ),
          -1, // Repeat infinitely
          true // Reverse
        );
      },
      pulse: () => {
        actionAnimations[index].scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 700, easing: Easing.in(Easing.sin) }),
            withTiming(0.95, { duration: 700, easing: Easing.out(Easing.sin) })
          ),
          -1, // Repeat infinitely
          true // Reverse
        );
      },
      wave: () => {
        // A gentle side-to-side wave animation
        actionAnimations[index].translateX.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 800, easing: Easing.inOut(Easing.quad) }),
            withTiming(-5, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          ),
          -1, // Repeat infinitely
          true // Reverse
        );
      },
      wobble: () => {
        // A wobble rotation animation
        actionAnimations[index].scale.value = withRepeat(
          withSequence(
            withTiming(1.03, { duration: 150 }),
            withTiming(0.97, { duration: 150 }),
            withTiming(1, { duration: 300 })
          ),
          -1, // Repeat infinitely
          true // Reverse
        );
      }
    };
    
    const animationType = kindnessActions[index].animation;
    if (animations[animationType]) {
      animations[animationType]();
    }
  };
  
  // Mark the lesson section as completed
  const completeLesson = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/curriculum/progress/kindness`,
        { section: 'lesson', completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCompletedSections(prev => ({
        ...prev,
        lesson: true
      }));
      
      // Update progress
      setProgress(prev => {
        const completedCount = Object.values({...completedSections, lesson: true}).filter(Boolean).length;
        return (completedCount / 3) * 100;
      });
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  // Navigate to different sections
  const navigateToStory = () => {
    completeLesson(); // Mark lesson as completed
    router.push('/core-values/kindness/story');
  };
  
  const navigateToQuiz = () => {
    router.push('/core-values/kindness/quiz');
  };
  
  // Header animated style
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));
  
  // Content animated style
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));
  
  // Sparkle animated style
  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [{ scale: sparkleScale.value }]
  }));
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Kindness</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>
          
          <Animated.View style={sparkleAnimatedStyle}>
            <Image 
              source={require('../../../assets/images/sparkle.png')} 
              style={styles.sparkleImage}
            />
          </Animated.View>
        </Animated.View>
        
        {/* Main content */}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <Text style={styles.introText}>
            Kindness means being friendly, generous, and considerate to others and yourself.
          </Text>
          
          <Text style={styles.subheading}>Why is kindness important?</Text>
          
          <View style={styles.reasonsContainer}>
            <View style={styles.reasonItem}>
              <Image 
                source={require('../../../assets/images/happy-heart.png')} 
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>It makes others feel good</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <Image 
                source={require('../../../assets/images/friendship.png')} 
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>It helps build friendships</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <Image 
                source={require('../../../assets/images/inner-peace.png')} 
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>It makes you feel happier too!</Text>
            </View>
          </View>
          
          <Text style={styles.subheading}>Ways to show kindness:</Text>
          
          <View style={styles.actionsContainer}>
            {kindnessActions.map((action, index) => {
              // Animated style for each action card
              const actionAnimatedStyle = useAnimatedStyle(() => ({
                opacity: actionAnimations[index].opacity.value,
                transform: [
                  { translateX: actionAnimations[index].translateX.value },
                  { scale: actionAnimations[index].scale.value }
                ]
              }));
              
              return (
                <Animated.View key={action.id} style={[styles.actionCard, actionAnimatedStyle]}>
                  <Image source={action.image} style={styles.actionImage} />
                  <Text style={styles.actionText}>{action.title}</Text>
                </Animated.View>
              );
            })}
          </View>
          
          {/* Navigation buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navigationButton, styles.storyButton]} 
              onPress={navigateToStory}
            >
              <Image 
                source={require('../../../assets/images/story-icon.png')} 
                style={styles.navigationIcon}
              />
              <Text style={styles.navigationText}>Read a Story</Text>
              {completedSections.story && (
                <Image 
                  source={require('../../../assets/images/check.png')} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navigationButton, styles.quizButton]} 
              onPress={navigateToQuiz}
            >
              <Image 
                source={require('../../../assets/images/quiz-icon.png')} 
                style={styles.navigationIcon}
              />
              <Text style={styles.navigationText}>Take the Quiz</Text>
              {completedSections.quiz && (
                <Image 
                  source={require('../../../assets/images/check.png')} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Back button */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.replace('/core-values')}
            >
              <Text style={styles.backButtonText}>Back to Values</Text>
            </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Image descriptions for assets:
// sparkle.png - A decorative sparkle/star icon to highlight kindness
// happy-heart.png - A heart with a happy face
// friendship.png - Two hands shaking or high-fiving
// inner-peace.png - A peaceful, smiling face with a glow
// story-icon.png - An open book icon
// quiz-icon.png - A question mark or pencil/paper icon
// check.png - A green checkmark to mark completed activities

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7', // Light pink background for kindness theme
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B8B', // Warm pink for kindness
    marginBottom: 10,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#FFD6E0',
    borderRadius: 3,
    width: '100%',
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B8B',
    borderRadius: 3,
  },
  sparkleImage: {
    width: 60,
    height: 60,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  introText: {
    fontSize: 18,
    color: '#444',
    lineHeight: 26,
    marginBottom: 24,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B8B',
    marginBottom: 16,
  },
  reasonsContainer: {
    marginBottom: 24,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBF0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  reasonIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  reasonText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#FFEBF0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navigationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  storyButton: {
    backgroundColor: '#FFD6E0',
    marginRight: 8,
  },
  quizButton: {
    backgroundColor: '#D6EAFF',
    marginLeft: 8,
  },
  navigationIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  navigationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  checkIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#FF6B8B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
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
  withRepeat,
  Easing 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Values data for curriculum
// Find and replace the coreValues array with this updated version:
const coreValues = [
  {
    id: 'kindness',
    title: 'Kindness',
    description: 'Learn about being kind to yourself and others',
    color: '#FF9FB1', // Soft pink
    image: require('../../assets/images/kindness.png'), // Image showing children helping each other
    available: true,
  },
  {
    id: 'integrity',
    title: 'Integrity',
    description: 'Discover what it means to do the right thing',
    color: '#A0CED9', // Soft blue
    image: require('../../assets/images/integrity.png'), // Image showing honest behavior
    available: true, // Changed to true
  },
  {
    id: 'responsibility',
    title: 'Responsibility',
    description: 'Learn how to be dependable and trustworthy',
    color: '#FFC09F', // Soft orange
    image: require('../../assets/images/responsibility.png'), // Image showing responsible behavior
    available: true, // Changed to true
  }
];

export default function CoreValuesCurriculum() {
  const router = useRouter();
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const cardAnimations = coreValues.map(() => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(50),
    scale: useSharedValue(0.9)
  }));
  
  // Character bobbing animation
  const characterPosition = useSharedValue(0);
  
  useEffect(() => {
    // Animate header
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withTiming(0, { duration: 800 });
    
    // Staggered animation for cards
    coreValues.forEach((_, index) => {
      cardAnimations[index].opacity.value = withDelay(
        400 + (index * 200),
        withTiming(1, { duration: 600 })
      );
      
      cardAnimations[index].translateY.value = withDelay(
        400 + (index * 200),
        withTiming(0, { duration: 600 })
      );
      
      cardAnimations[index].scale.value = withDelay(
        400 + (index * 200),
        withSpring(1, { damping: 12 })
      );
    });
    
    // Start continuous bobbing animation for character
    characterPosition.value = withRepeat(
      withSequence(
        withTiming(5, { 
          duration: 1000, 
          easing: Easing.inOut(Easing.sin) // Fix: use sin instead of sine
        }),
        withTiming(-5, { 
          duration: 1000, 
          easing: Easing.inOut(Easing.sin) // Fix: use sin instead of sine
        })
      ),
      -1, // Repeat infinitely
      true // Reverse
    );
  }, []);
  
  // Navigate to a specific value lesson
    const navigateToLesson = (valueId) => {
      if (valueId === 'kindness') {
        router.push('/core-values/kindness');
      } else if (valueId === 'integrity') {
        router.push('/core-values/integrity');
      } else if (valueId === 'responsibility') {
        router.push('/core-values/responsibility');
      } else {
        // For values that aren't fully implemented yet
        const index = coreValues.findIndex(v => v.id === valueId);
        if (index >= 0) {
          cardAnimations[index].scale.value = withSequence(
            withTiming(0.95, { duration: 100 }),
            withTiming(1.05, { duration: 100 }),
            withTiming(1, { duration: 200 })
          );
        }
      }
    };
  
  // Header animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }]
  }));
  
  // Character animated style
  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: characterPosition.value }
    ]
  }));
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Core Values</Text>
              <Text style={styles.headerSubtitle}>Fun lessons on leadership</Text>
            </View>
            
            <Animated.View style={characterAnimatedStyle}>
              <Image 
                source={require('../../assets/images/guide-character.png')} 
                style={styles.guideCharacter}
              />
            </Animated.View>
          </View>
          
          <Text style={styles.description}>
            Learn important values through stories, games, and quizzes!
          </Text>
        </Animated.View>
        
        {/* Value Cards */}
        {coreValues.map((value, index) => {
          // Create animated style for each card
          const cardAnimatedStyle = useAnimatedStyle(() => ({
            opacity: cardAnimations[index].opacity.value,
            transform: [
              { translateY: cardAnimations[index].translateY.value },
              { scale: cardAnimations[index].scale.value }
            ]
          }));
          
          return (
            <Animated.View key={value.id} style={cardAnimatedStyle}>
              <TouchableOpacity 
                style={[styles.valueCard, { backgroundColor: value.color }]}
                onPress={() => navigateToLesson(value.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.valueTitle}>{value.title}</Text>
                    <Text style={styles.valueDescription}>{value.description}</Text>
                    
                    <View style={styles.startButtonContainer}>
                      <Text style={styles.startButtonText}>Start Learning</Text>
                    </View>
                  </View>
                  
                  <Image source={value.image} style={styles.valueImage} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        
        {/* Back to Dashboard Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8ff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  description: {
    marginTop: 12,
    color: '#212121',
    fontSize: 16,
  },
  guideCharacter: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  valueCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 120,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  valueTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  valueDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
  },
  valueImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  startButtonContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  startButtonText: {
    color: '#FF8A5B',
    fontWeight: 'bold',
  },
  comingSoonTag: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    color: '#888',
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
  },
  backButton: {
    backgroundColor: '#7E57C2',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
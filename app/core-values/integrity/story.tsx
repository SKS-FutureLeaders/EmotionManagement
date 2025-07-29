import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.12.240:5000";

// Sound effects
const SOUNDS = {
  pageFlip: require('../../../assets/sounds/page-flip.mp3'),
  success: require('../../../assets/sounds/success.mp3'),
  tap: require('../../../assets/sounds/tap.mp3'),
  background: require('../../../assets/sounds/gentle-background.mp3'),
};

// Interactive elements for each page
const interactiveElements = [
  { id: 1, x: 0.6, y: 0.5, animation: 'bounce', sound: 'tap', message: 'This is Timmy the Turtle!' },
  { id: 2, x: 0.4, y: 0.6, animation: 'pulse', sound: 'tap', message: 'Look at the shiny coin!' },
  { id: 3, x: 0.6, y: 0.4, animation: 'shake', sound: 'tap', message: 'The other animals are hiding' },
  { id: 4, x: 0.5, y: 0.5, animation: 'spin', sound: 'tap', message: 'Timmy is thinking...' },
  { id: 5, x: 0.4, y: 0.6, animation: 'pulse', sound: 'tap', message: 'Timmy makes a decision' },
  { id: 6, x: 0.7, y: 0.4, animation: 'bounce', sound: 'tap', message: 'Timmy is returning the coin!' },
  { id: 7, x: 0.3, y: 0.6, animation: 'spin', sound: 'tap', message: 'Oliver is surprised!' },
  { id: 8, x: 0.6, y: 0.5, animation: 'shake', sound: 'tap', message: 'Mrs. Fox is proud of Timmy' },
  { id: 9, x: 0.5, y: 0.4, animation: 'bounce', sound: 'tap', message: 'Sharing is caring!' },
  { id: 10, x: 0.5, y: 0.3, animation: 'pulse', sound: 'tap', message: 'Integrity makes you feel good inside!' },
];

// Story content 2 check?
const storyPages = [
  { id: 1, imageSource: require('../../../assets/images/story-turtle-walking.jpg'), text: "Timmy the Turtle was on his way to school when he found a shiny golden coin on the sidewalk.", duration: 6000 },
  { id: 2, imageSource: require('../../../assets/images/story-turtle-coin.jpg'), text: "Timmy picked up the coin and noticed that it had dropped from the backpack of Oliver Owl, who was walking ahead.", duration: 7000 },
  { id: 3, imageSource: require('../../../assets/images/story-turtle-thinking.jpg'), text: "Timmy thought to himself, 'No one saw me find this coin. I could keep it and buy that special treat I've been wanting.'", duration: 7000 },
  { id: 4, imageSource: require('../../../assets/images/story-inside-voice.jpg'), text: "But a little voice inside reminded him, 'Doing the right thing means being honest, even when no one is watching.'", duration: 6000 },
  { id: 5, imageSource: require('../../../assets/images/story-turtle-decision.jpg'), text: "Even though he really wanted to keep the coin, Timmy knew that wouldn't be honest. He decided to do the right thing.", duration: 7000 },
  { id: 6, imageSource: require('../../../assets/images/story-turtle-returning.jpg'), text: "'Excuse me, Oliver!' called Timmy. 'I think you dropped this coin from your backpack.'", duration: 6000 },
  { id: 7, imageSource: require('../../../assets/images/story-owl-surprised.jpg'), text: "Oliver was surprised and very grateful. 'Thank you so much! This is my lunch money. I would have been so hungry without it!'", duration: 7000 },
  { id: 8, imageSource: require('../../../assets/images/story-teacher-smiling.jpg'), text: "Mrs. Fox, their teacher, saw what happened. 'Timmy, I'm proud of your honesty. That shows real integrity!'", duration: 6000 },
  { id: 9, imageSource: require('../../../assets/images/story-friends-playing2.jpg'), text: "At lunch, Oliver shared his cookies with Timmy to say thank you. Timmy felt much better than if he had kept the coin.", duration: 7000 },
  { id: 10, imageSource: require('../../../assets/images/story-integrity-message.jpg'), text: "Integrity means doing the right thing, even when no one is watching. When you have integrity, people trust you and respect you!", duration: 9000 },
];

export default function IntegrityStoryMobile() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState(null);
  const [effectSounds, setEffectSounds] = useState({});
  
  // Animation values
  const scaleAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const bounceAnim = useSharedValue(0);
  const pageTransition = useSharedValue(0);
  const characterBounce = useSharedValue(0);
  const textFade = useSharedValue(0);
  const bubbleScale = useSharedValue(0);
  
  // Refs to track state in callbacks
  const currentPageRef = useRef(currentPage);
  const isPlayingRef = useRef(isPlaying);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lottieRef = useRef(null);
  
  // Update refs when state changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load sounds
  useEffect(() => {
    async function loadSounds() {
      try {
        // Load background music
        const bgSound = new Audio.Sound();
        await bgSound.loadAsync(SOUNDS.background);
        await bgSound.setIsLoopingAsync(true);
        await bgSound.setVolumeAsync(0.1);
        setBackgroundSound(bgSound);
        
        // Load effect sounds
        const pageFlipSound = new Audio.Sound();
        await pageFlipSound.loadAsync(SOUNDS.pageFlip);
        
        const successSound = new Audio.Sound();
        await successSound.loadAsync(SOUNDS.success);
        
        const tapSound = new Audio.Sound();
        await tapSound.loadAsync(SOUNDS.tap);
        
        setEffectSounds({
          pageFlip: pageFlipSound,
          success: successSound,
          tap: tapSound
        });
        
        setSoundsLoaded(true);
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    }
    
    if (Platform.OS !== 'web') {
      loadSounds();
    } else {
      setSoundsLoaded(true);
    }
    
    return () => {
      // Unload sounds when component unmounts
      if (Platform.OS !== 'web') {
        if (backgroundSound) backgroundSound.unloadAsync();
        Object.values(effectSounds).forEach(sound => {
          if (sound) sound.unloadAsync();
        });
      }
    };
  }, []);

  // Play background music when ready
  useEffect(() => {
    if (soundsLoaded && backgroundSound && !isLoading && Platform.OS !== 'web') {
      backgroundSound.playAsync();
    }
    
    return () => {
      if (Platform.OS !== 'web' && backgroundSound) {
        backgroundSound.stopAsync();
      }
    };
  }, [soundsLoaded, backgroundSound, isLoading]);

  // Cleanup function to stop all audio and timers
  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Speech.stop();
  };

  useEffect(() => {
    // Cleanup function when component unmounts or during navigation
    return () => {
      cleanup();
      isMountedRef.current = false;
      
      // Clean up any web-specific resources
      if (Platform.OS === 'web') {
        // Force cleanup of any Lottie animations
        setShowPopup(false);
        bubbleScale.value = 0;
      }
    };
  }, []);

  // Play a sound effect
  const playSound = async (soundName) => {
    if (Platform.OS === 'web') return; // Skip sounds on web
    
    try {
      if (effectSounds[soundName]) {
        await effectSounds[soundName].replayAsync();
      }
    } catch (error) {
      console.error(`Error playing ${soundName} sound:`, error);
    }
  };

  // Change page with animation
  const changePage = async (newPage) => {
    // First stop any current speech and clear timers
    cleanup();
    
    // Validate page number
    if (newPage < 0 || newPage >= storyPages.length) return;
    
    // Page flip animation
    pageTransition.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
    
    // Play page flip sound
    await playSound('pageFlip');
    
    // Reset animations for new page
    scaleAnim.value = 0;
    textFade.value = 0;
    characterBounce.value = 0;
    
    // Change the page
    setCurrentPage(newPage);
    
    // Start new page animations
    setTimeout(() => {
      scaleAnim.value = withSpring(1);
      textFade.value = withTiming(1, { duration: 800 });
      characterBounce.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 1000 }),
          withTiming(-5, { duration: 1000 })
        ),
        -1,
        true
      );
    }, 300);
    
    // If we're playing, speak the new page
    if (isPlayingRef.current) {
      // Small delay to ensure UI updates first
      setTimeout(() => {
        if (isMountedRef.current) {
          speakCurrentPage(newPage);
        }
      }, 400);
    }
  };

  const speakCurrentPage = (pageIndex) => {
    if (!isPlayingRef.current || !isMountedRef.current) return;
  
    const page = storyPages[pageIndex];
  
    // Ensure any previous speech is stopped
    Speech.stop();
  
    // Get available voices for better TTS
    setTimeout(() => {
      if (!isMountedRef.current || !isPlayingRef.current) return;
  
      Speech.getAvailableVoicesAsync().then(voices => {
        let voiceOptions = {};
  
        // Prefer male voices on both platforms
        const maleVoice = voices.find(v => 
          v.identifier?.toLowerCase().includes('male') &&
          v.language?.startsWith('en')
        );
  
        if (maleVoice) {
          voiceOptions = {
            voice: maleVoice.identifier
          };
          if (Platform.OS === 'ios' && maleVoice.quality === 'Enhanced') {
            voiceOptions.quality = 'Enhanced';
          }
        }
  
        // Speak with the selected male voice
        Speech.speak(page.text, {
          language: 'en-US',
          rate: 0.75,
          pitch: 0.7,
          ...voiceOptions,
          onDone: () => {
            if (isMountedRef.current && currentPageRef.current === pageIndex && isPlayingRef.current) {
              timerRef.current = setTimeout(() => {
                if (isMountedRef.current && currentPageRef.current === pageIndex && isPlayingRef.current) {
                  if (pageIndex < storyPages.length - 1) {
                    changePage(pageIndex + 1);
                  } else {
                    handleStoryCompletion();
                  }
                }
              }, 1000);
            }
          },
          onError: (error) => {
            console.warn("Speech error:", error);
            if (isMountedRef.current && currentPageRef.current === pageIndex && isPlayingRef.current) {
              timerRef.current = setTimeout(() => {
                if (pageIndex < storyPages.length - 1) {
                  changePage(pageIndex + 1);
                } else {
                  handleStoryCompletion();
                }
              }, page.duration);
            }
          }
        });
      }).catch(error => {
        console.warn("Error getting voices:", error);
  
        // Fallback speech
        Speech.speak(page.text, {
          language: 'en-US',
          rate: 0.75,
          pitch: 0.1,
          onDone: () => {
            if (isMountedRef.current && currentPageRef.current === pageIndex && isPlayingRef.current) {
              timerRef.current = setTimeout(() => {
                if (isMountedRef.current && currentPageRef.current === pageIndex && isPlayingRef.current) {
                  if (pageIndex < storyPages.length - 1) {
                    changePage(pageIndex + 1);
                  } else {
                    handleStoryCompletion();
                  }
                }
              }, 1000);
            }
          },
          onError: (error) => {
            console.warn("Speech error:", error);
            if (isMountedRef.current && currentPageRef.current === pageIndex && isPlayingRef.current) {
              timerRef.current = setTimeout(() => {
                if (pageIndex < storyPages.length - 1) {
                  changePage(pageIndex + 1);
                } else {
                  handleStoryCompletion();
                }
              }, page.duration);
            }
          }
        });
      });
    }, 250);
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      changePage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < storyPages.length - 1) {
      changePage(currentPage + 1);
    } else {
      handleStoryCompletion();
    }
  };

  const togglePlayPause = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    if (newPlayState) {
      // Starting playback
      speakCurrentPage(currentPage);
    } else {
      // Pausing
      cleanup();
    }
  };

  // Handle story completion with celebration effects
  const handleStoryCompletion = async () => {
    cleanup();
    
    // Play success sound
    await playSound('success');
    
    // Mark story as completed
    await markStoryAsCompleted();
    
    // Trigger completion animation
    setStoryCompleted(true);
    
    // Start confetti animation when lottie is loaded
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  // Mark story as completed in backend
  const markStoryAsCompleted = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      await axios.post(
        `${API_URL}/curriculum/progress/integrity`,
        { section: 'story', completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Integrity story marked as completed');
    } catch (error) {
      console.error('Error marking story as completed:', error);
    }
  };

  // Handle interactive elements
  const handleInteractiveElement = (element) => {
    playSound('tap');
    
    // Set popup message and position
    setPopupMessage(element.message);
    setPopupPosition({
      x: element.x * width,
      y: element.y * height * 0.6
    });
    
    // Show popup with animation
    setShowPopup(true);
    bubbleScale.value = withSequence(
      withSpring(1),
      withDelay(1500, withTiming(0, { duration: 300 }))
    );
    
    // Hide popup after animation
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  // Initialize the story
  useEffect(() => {
    // Start with initial animations
    setTimeout(() => {
      setIsLoading(false);
      scaleAnim.value = withSpring(1);
      textFade.value = withTiming(1, { duration: 800 });
      characterBounce.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 1000 }),
          withTiming(-5, { duration: 1000 })
        ),
        -1,
        true
      );
    }, 1000);
    
    // Start story narration with delay
    const startupTimer = setTimeout(() => {
      if (isMountedRef.current) {
        speakCurrentPage(0);
      }
    }, 1500);
    
    // Cleanup function for unmounting
    return () => {
      isMountedRef.current = false;
      cleanup();
      clearTimeout(startupTimer);
    };
  }, []);

  // Animated styles
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleAnim.value },
        { translateY: characterBounce.value }
      ]
    };
  });
  
  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textFade.value,
      transform: [
        { translateY: (1 - textFade.value) * 20 }
      ]
    };
  });
  
  const pageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - pageTransition.value,
      transform: [
        { scale: 1 - (pageTransition.value * 0.1) },
        { rotateY: `${pageTransition.value * 30}deg` }
      ]
    };
  });
  
  const popupAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: bubbleScale.value,
      transform: [
        { scale: bubbleScale.value }
      ]
    };
  });

  // Handle image loading errors
  const handleImageError = () => {
    console.error(`Failed to load image for page ${currentPage + 1}`);
    setImageError(true);
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View 
          entering={ZoomIn.duration(1000)}
          style={styles.loadingAnimation}
        >
          <Image 
            source={require('../../../assets/images/story-turtle-walking.jpg')} 
            style={styles.loadingImage} 
          />
        </Animated.View>
        <ActivityIndicator size="large" color="#4A90A0" />
        <Text style={styles.loadingText}>Getting story ready...</Text>
        <Text style={styles.loadingSubtext}>A story about honesty awaits!</Text>
      </View>
    );
  }

  // Completion screen with celebration effects
  if (storyCompleted) {
    return (
      <SafeAreaView style={styles.completionContainer}>
        {/* Only show confetti animation on mobile */}
        {Platform.OS !== 'web' && (
          <LottieView
            ref={lottieRef}
            source={require('../../../assets/animations/confetti.json')}
            style={styles.confetti}
            autoPlay
            loop={false}
          />
        )}
        
        <Animated.View 
          entering={ZoomIn.duration(800)}
          style={styles.completionCard}
        >
          <LinearGradient
            colors={['#4A90A0', '#3A748C']}
            style={styles.completionHeader}
          >
            <Text style={styles.completionHeaderText}>Great Job!</Text>
          </LinearGradient>
          
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" style={styles.completionIcon} />
          
          <Text style={styles.completionTitle}>Story Complete!</Text>
          <Text style={styles.completionText}>
            You've learned about the power of integrity! 
            Being honest, even when no one is watching, makes you trustworthy!
          </Text>
          
          {/* Only show stars animation on mobile */}
          {Platform.OS !== 'web' && (
            <LottieView
              source={require('../../../assets/animations/stars.json')}
              style={styles.starsAnimation}
              autoPlay
              loop
            />
          )}
          
          {/* For web, use a simple static decoration */}
          {Platform.OS === 'web' && (
            <View style={styles.webStarsContainer}>
              <Text style={styles.webStarEmoji}>⭐ ✨ ⭐ ✨ ⭐</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.completionButton}
            onPress={() => router.push('/core-values/integrity')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90A0', '#3A748C']}
              style={styles.completionButtonGradient}
            >
              <Text style={styles.completionButtonText}>Back to Integrity Lessons</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Main story screen
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with character */}
      <LinearGradient
        colors={['#4A90A0', '#3A748C']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>The Honest Turtle</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${((currentPage + 1) / storyPages.length) * 100}%` }
                ]} 
              />
              <View style={styles.progressBarDecorations}>
                {[...Array(storyPages.length)].map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.progressDot,
                      currentPage >= index && styles.progressDotActive
                    ]} 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.pageIndicator}>
              Page {currentPage + 1} of {storyPages.length}
            </Text>
          </View>
          
          <Animated.Image
            source={require('../../../assets/images/story-turtle-walking.jpg')}
            style={[styles.headerCharacter, imageAnimatedStyle]}
          />
        </View>
      </LinearGradient>

      {/* Content Area */}
      <Animated.View style={[styles.contentArea, pageAnimatedStyle]}>
        {/* Image with interactive elements */}
        <View style={styles.imageWrapper}>
          <TouchableWithoutFeedback
            onPress={() => handleInteractiveElement(interactiveElements[currentPage])}
          >
            <View style={styles.imageContainer}>
              {imageError ? (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={60} color="#4A90A0" />
                  <Text style={styles.placeholderText}>Image not available</Text>
                </View>
              ) : (
                <Animated.Image
                  source={storyPages[currentPage].imageSource}
                  style={[styles.storyImage, imageAnimatedStyle]}
                  resizeMode="contain"
                  onError={handleImageError}
                />
              )}
              
              {/* Interactive element indicator */}
              <Animated.View
                style={[
                  styles.interactiveIndicator,
                  {
                    top: interactiveElements[currentPage].y * height * 0.3,
                    left: interactiveElements[currentPage].x * width * 0.7,
                  }
                ]}
              >
                {Platform.OS !== 'web' ? (
                  <LottieView
                    source={require('../../../assets/animations/tap-here.json')}
                    style={styles.tapAnimation}
                    autoPlay
                    loop
                  />
                ) : (
                  <View style={styles.webTapHere}>
                    <Text style={styles.webTapHereText}></Text>
                  </View>
                )}
              </Animated.View>
              
              {/* Popup message bubble */}
              {showPopup && (
                <Animated.View
                  style={[
                    styles.popupBubble,
                    {
                      top: popupPosition.y - 80,
                      left: popupPosition.x - 100,
                    },
                    popupAnimatedStyle
                  ]}
                >
                  <Text style={styles.popupText}>{popupMessage}</Text>
                </Animated.View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* Text */}
        <Animated.View style={[styles.textWrapper, textAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(220,237,240,0.95)']}
            style={styles.textContainer}
          >
            <Text style={styles.storyText}>{storyPages[currentPage].text}</Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controlsWrapper}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentPage === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={currentPage === 0 ? ['#bdbdbd', '#9e9e9e'] : ['#4A90A0', '#3A748C']}
            style={styles.navButtonGradient}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={togglePlayPause}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ffffff', '#e6f3f5']}
            style={styles.playPauseGradient}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={36} 
              color="#4A90A0" 
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton, 
            currentPage === storyPages.length - 1 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={currentPage === storyPages.length - 1}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={currentPage === storyPages.length - 1 ? ['#bdbdbd', '#9e9e9e'] : ['#4A90A0', '#3A748C']}
            style={styles.navButtonGradient}
          >
            <Ionicons name="arrow-forward" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main containers
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5', // Light blue for integrity theme
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F3F5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 22,
    color: '#4A90A0',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#3A748C',
    fontWeight: '400',
    opacity: 0.8,
  },
  loadingAnimation: {
    marginBottom: 20,
  },
  loadingImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#4A90A0',
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerCharacter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    marginLeft: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressBarContainer: {
    width: '100%',
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 7,
  },
  progressBarDecorations: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressDotActive: {
    backgroundColor: 'white',
  },
  pageIndicator: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  
  // Content area
  contentArea: {
    flex: 1,
  },
  
  // Image section
  imageWrapper: {
    flex: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '95%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#E6F3F5',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A90A0',
  },
  interactiveIndicator: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  tapAnimation: {
    width: 60,
    height: 60,
  },
  popupBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 15,
    minWidth: 150,
    maxWidth: 200,
    borderWidth: 2,
    borderColor: '#4A90A0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  popupText: {
    color: '#4A90A0',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Text section
  textWrapper: {
    flex: 2.5,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  textContainer: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#C6E2E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#0F4A55',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Controls
  controlsWrapper: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  navButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  playPauseGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4A90A0',
  },
  disabledButton: {
    opacity: 0.6,
  },
  
  // Completion screen
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#C6E2E8',
  },
  completionCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: '95%',
    maxWidth: 400,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  completionHeader: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  completionHeaderText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completionIcon: {
    marginTop: 10,
    marginBottom: 10,
  },
  starsAnimation: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: 10,
    opacity: 0.6,
  },
  confetti: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90A0',
    marginBottom: 15,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  completionButton: {
    width: '80%',
    height: 60,
    borderRadius: 30,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  completionButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webStarsContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  webStarEmoji: {
    fontSize: 32,
    color: '#FFC107',
    letterSpacing: 8,
  },
  webTapHere: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(195, 208, 211, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  webTapHereText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
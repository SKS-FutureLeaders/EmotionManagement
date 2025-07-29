import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Define challenge data
const challenges = {
  currentWeek: [
    {
      id: 1,
      title: "Feelings Match",
      description: "Match emotions with situations in this fun memory game",
      image: require('../assets/images/feelings-match.jpeg'),
      routePath: "/challenge",
      color: "#9C27B0",
      icon: "🃏",
      stars: 0,
      available: true,
      completed: false
    },
  ],
  upcomingWeek: [
    {
      id: 2,
      title: "Breathing Buddy",
      description: "Help your buddy stay calm with breathing exercises",
      image: require('../assets/images/breathing-buddy.jpeg'),
      color: "#2196F3",
      icon: "🧘‍♂️",
      stars: 0,
      available: false,
      unlockDate: "May 10, 2025"
    },
    {
      id: 3,
      title: "Emotion Heroes",
      description: "Capture floating emotions and complete exciting missions!",
      image: require('../assets/images/emotion-heroes.jpeg'),
      color: "#FF9800",
      icon: "🎮",
      stars: 0,
      available: false,
      unlockDate: "May 15, 2025"
    },
    {
      id: 4,
      title: "Mood Monsters",
      description: "Tame wild mood monsters by identifying your feelings",
      image: require('../assets/images/mood-monsters.jpeg'),
      color: "#4CAF50",
      icon: "👾",
      stars: 0,
      available: false,
      unlockDate: "May 13, 2025"
    }
  ]
};

const ChallengeDashboard = () => {
  const router = useRouter();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [activeDay, setActiveDay] = useState(4);
  const [showGuideTip, setShowGuideTip] = useState(true);
  const tipAnimation = useRef(null);
  
  // Animated values
  const cardScale = useSharedValue(1);
  const headerBounce = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  // Pre-create animated styles for all possible challenges
  const currentWeekStyles = challenges.currentWeek.map(() => 
    useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }]
    }))
  );
  
  const nextWeekStyles = challenges.upcomingWeek.map(() => 
    useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }]
    }))
  );

  // Week data
  // Generate dynamic dates for the weeks
  const generateWeekData = () => {
    // Get current date
    const today = new Date();
    
    // Find the start of this week (Sunday)
    const thisWeekStart = new Date(today);
    const daysSinceSunday = today.getDay();
    thisWeekStart.setDate(today.getDate()-daysSinceSunday-2);
    
    // Format function for dates
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    // Format function for day names
    const formatDay = (date) => {
      return date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);
    };
    
    // Generate this week's data
    const thisWeekDates = [];
    const thisWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(thisWeekStart);
      date.setDate(thisWeekStart.getDate() + i);
      thisWeekDates.push(formatDate(date));
      thisWeekDays.push(formatDay(date));
    }
    
    // Generate next week's data
    const nextWeekDates = [];
    const nextWeekDays = [];
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(nextWeekStart);
      date.setDate(nextWeekStart.getDate() + i);
      nextWeekDates.push(formatDate(date));
      nextWeekDays.push(formatDay(date));
    }
    
    return [
      {
        label: "This Week",
        dates: thisWeekDates,
        days: thisWeekDays,
        challenges: challenges.currentWeek,
        active: true
      },
      {
        label: "Next Week",
        dates: nextWeekDates,
        days: nextWeekDays,
        challenges: challenges.upcomingWeek,
        active: false
      }
    ];
  };

  const weeks = generateWeekData();
  
  // Animations
  useEffect(() => {
    // Bounce header initially
    headerBounce.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 }),
      withDelay(300, withTiming(1, { duration: 300 })),
      withTiming(0, { duration: 300 })
    );
    
    // Show tip animation
    if (tipAnimation.current) {
      tipAnimation.current.play();
    }
    
    // Hide tip after some time
    const tipTimer = setTimeout(() => {
      setShowGuideTip(false);
    }, 5000);
    
    return () => {
      clearTimeout(tipTimer);
      // Clean up animations when component unmounts
      if (Platform.OS === 'web') {
        confettiOpacity.value = 0;
      }
    };
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(headerBounce.value, [0, 1], [0, -10], Extrapolate.CLAMP) }
      ]
    };
  });
  
  const handlePressIn = () => {
    cardScale.value = withTiming(0.95, { duration: 100 });
  };
  
  const handlePressOut = () => {
    cardScale.value = withSpring(1);
  };
  
  const navigateToChallenge = (challenge) => {
    if (!challenge.available) return;
    
    // Show confetti first
    confettiOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(1500, withTiming(0, { duration: 500 }))
    );
    
    // Then navigate
    setTimeout(() => {
      router.push(challenge.routePath);
    }, 300);
  };

  const calculateTotalStars = () => {
    // Get stars from current week challenges
    const currentWeekStars = challenges.currentWeek.reduce((total, challenge) => 
      total + (challenge.stars || 0), 0);
      
    // Get stars from next week challenges (if any are completed)
    const nextWeekStars = challenges.upcomingWeek.reduce((total, challenge) => 
      total + (challenge.stars || 0), 0);
      
    return currentWeekStars + nextWeekStars;
  };
  
  // Get the total possible stars
  const getTotalPossibleStars = () => {
    // Each challenge can have max 3 stars
    return (challenges.currentWeek.length + challenges.upcomingWeek.length) * 3;
  };
  // Render a week day
  const renderDay = (day, date, index) => {
    const isToday = currentWeekIndex === 0 && index === activeDay;
    
    return (
      <TouchableOpacity 
        key={index}
        style={[
          styles.dayButton,
          isToday && styles.todayButton
        ]}
        onPress={() => setActiveDay(index)}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.dayText,
          isToday && styles.todayText
        ]}>{day}</Text>
        <Text style={[
          styles.dateText,
          isToday && styles.todayText
        ]}>{date}</Text>
        {isToday && (
          <View style={styles.todayDot} />
        )}
      </TouchableOpacity>
    );
  };
  
  // Render challenge card
  const renderChallengeCard = (challenge, index) => {
    const locked = !challenge.available;
    const animatedStyle = currentWeekIndex === 0 
      ? currentWeekStyles[index] 
      : nextWeekStyles[index];
    
    return (
      <AnimatedTouchable
        key={challenge.id}
        style={[
          styles.challengeCard,
          { backgroundColor: locked ? '#E0E0E0' : challenge.color },
          animatedStyle
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigateToChallenge(challenge)}
        activeOpacity={0.9}
        disabled={locked}
      >
        <LinearGradient
          colors={[
            `${challenge.color}CC`, 
            `${challenge.color}99`
          ]}
          style={styles.cardGradient}
        >
          {/* Challenge Icon */}
          <View style={styles.challengeIconContainer}>
            <Text style={styles.challengeIcon}>{challenge.icon}</Text>
          </View>
          
          {/* Challenge Content */}
          <View style={styles.challengeContent}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            
            {/* Stars/Rewards */}
            <View style={styles.starsContainer}>
              {[1, 2, 3].map(star => (
                <FontAwesome5 
                  key={star}
                  name="star" 
                  size={20} 
                  color={star <= challenge.stars ? '#FFD700' : '#E0E0E0'} 
                  style={styles.starIcon}
                />
              ))}
            </View>
          </View>
          
          {/* Start or Locked Button */}
          <View style={styles.challengeAction}>
            {locked ? (
              <View style={styles.lockedContainer}>
                <Ionicons name="lock-closed" size={24} color="#757575" />
                <Text style={styles.lockedText}>Unlocks {challenge.unlockDate}</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5']}
                style={styles.startButton}
              >
                <Text style={[styles.startButtonText, { color: challenge.color }]}>
                  START{' '}
                  <Ionicons name="arrow-forward" size={16} color={challenge.color} />
                </Text>
              </LinearGradient>
            )}
          </View>
          
          {/* Locked Overlay */}
          {locked && (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={40} color="#FFFFFF" />
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </View>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  };
  
  // Week Selector
  const renderWeekSelector = () => {
    return (
      <View style={styles.weekSelector}>
        <TouchableOpacity 
          style={[
            styles.weekTab, 
            currentWeekIndex === 0 && styles.activeWeekTab
          ]}
          onPress={() => setCurrentWeekIndex(0)}
        >
          <Text style={[
            styles.weekTabText,
            currentWeekIndex === 0 && styles.activeWeekTabText
          ]}>This Week</Text>
          {currentWeekIndex === 0 && <View style={styles.activeWeekIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.weekTab, 
            currentWeekIndex === 1 && styles.activeWeekTab
          ]}
          onPress={() => setCurrentWeekIndex(1)}
        >
          <Text style={[
            styles.weekTabText,
            currentWeekIndex === 1 && styles.activeWeekTabText
          ]}>Next Week</Text>
          {currentWeekIndex === 1 && <View style={styles.activeWeekIndicator} />}
        </TouchableOpacity>
      </View>
    );
  };
  
  // Guide Tip bubble
  const renderGuideTip = () => {
    if (!showGuideTip) return null;
    
    return (
      <View style={styles.guideTipContainer}>
        {Platform.OS !== 'web' ? (
          <LottieView
            ref={tipAnimation}
            source={require('../assets/animations/sparkle.json')}
            style={styles.sparkleAnimation}
            autoPlay
            loop
          />
        ) : (
          // Use a simple animated view for web
          <Animated.View 
            style={[
              styles.sparkleAnimation,
              { 
                backgroundColor: '#FFD700', 
                opacity: 0.7, 
                borderRadius: 50,
                width: 100,
                height: 100 
              }
            ]}
          />
        )}
        <View style={styles.guideTipBubble}>
          <Text style={styles.guideTipText}>Complete challenges to earn stars! 🌟</Text>
          <View style={styles.tipArrow} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/images/challenge-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Confetti overlay */}
        <Animated.View 
          style={[
            styles.confettiContainer,
            { opacity: confettiOpacity }
          ]}
          pointerEvents="none"
        >
          {Platform.OS !== 'web' ? (
            <LottieView
              source={require('../assets/animations/confetti.json')}
              style={styles.confettiAnimation}
              autoPlay
              loop={false}
            />
          ) : (
            // Simple fallback for web with explicit dimensions
            <View style={[styles.confettiAnimation, { width: width, height: 300 }]}>
              {}
            </View>
          )}
        </Animated.View>
        
        {/* Week Selector */}
        {renderWeekSelector()}
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar Days */}
          <View style={styles.daysContainer}>
            {weeks[currentWeekIndex].days.map((day, index) => (
              renderDay(day, weeks[currentWeekIndex].dates[index], index)
            ))}
          </View>
          
          {/* Challenge Cards */}
          <View style={styles.challengesContainer}>
            <Text style={styles.sectionTitle}>
              {currentWeekIndex === 0 ? "Current Challenges" : "Upcoming Challenges"}
            </Text>
            
            {weeks[currentWeekIndex].challenges.map((challenge, index) => (
              renderChallengeCard(challenge, index)
            ))}
          </View>
          
          {/* Tip Bubble */}
          {renderGuideTip()}
          
          {/* Rewards Section */}
          <View style={styles.rewardsSection}>
            <LinearGradient
              colors={['#FFD700', '#FFA000']}
              style={styles.rewardsContainer}
            >
              <View style={styles.rewardsHeader}>
                <FontAwesome5 name="trophy" size={24} color="#FFFFFF" />
                <Text style={styles.rewardsTitle}>Your Rewards</Text>
              </View>
              <Text style={styles.rewardsSubtitle}>Complete challenges to unlock exciting rewards!</Text>
              
              <View style={styles.rewardsProgress}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill, 
                    { width: `${(calculateTotalStars() / getTotalPossibleStars()) * 100}%` }
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {calculateTotalStars()}/{getTotalPossibleStars()} stars collected
                </Text>
              </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  confettiAnimation: {
    width: width,
    height: height,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  weekSelector: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  weekTab: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeWeekTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  weekTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeWeekTabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeWeekIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    backgroundColor: '#9C27B0',
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  daysContainer: {
    flexDirection: 'row',
    marginVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  dayButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    width: (width - 40) / 7,
  },
  todayButton: {
    backgroundColor: '#9C27B0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  todayText: {
    color: '#FFF',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginTop: 5,
  },
  challengesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  challengeCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardGradient: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  challengeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  challengeIcon: {
    fontSize: 30,
  },
  challengeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 5,
  },
  challengeAction: {
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  startButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  lockedContainer: {
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
    textAlign: 'center',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  comingSoonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
  guideTipContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 100,
  },
  sparkleAnimation: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -30,
    right: -10,
  },
  guideTipBubble: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    maxWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  guideTipText: {
    fontSize: 14,
    color: '#333',
  },
  tipArrow: {
    position: 'absolute',
    right: 20,
    bottom: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  rewardsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  rewardsContainer: {
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  rewardsProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    flex: 1,
    marginRight: 15,
  },
  progressBar: {
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 5,
  },
  nextReward: {
    alignItems: 'center',
  },
  rewardImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  nextRewardText: {
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
  },
});

export default ChallengeDashboard;
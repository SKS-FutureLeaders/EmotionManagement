// app/challenge.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Game data - emotions and situations that match
const GAME_DATA = [
  {
    emotion: 'happy',
    emoji: '😊',
    color: '#FFC107',
    situations: [
      'Getting a present',
      'Playing with friends',
      'Eating ice cream'
    ]
  },
  {
    emotion: 'sad',
    emoji: '😢',
    color: '#2196F3',
    situations: [
      'Dropping your ice cream',
      'A friend moved away',
      'Losing a game'
    ]
  },
  {
    emotion: 'angry',
    emoji: '😠',
    color: '#F44336',
    situations: [
      'Someone breaks your toy',
      'Being blamed unfairly',
      'Having to stop playing'
    ]
  },
  {
    emotion: 'scared',
    emoji: '😨',
    color: '#9C27B0',
    situations: [
      'Seeing a spider',
      'Hearing a loud noise',
      'Being in the dark'
    ]
  },
  {
    emotion: 'surprised',
    emoji: '😲',
    color: '#4CAF50',
    situations: [
      'Getting an unexpected gift',
      'Seeing a magic trick',
      'Friend jumping out to say hi'
    ]
  }
];

// Card Types
type CardType = 'emotion' | 'situation';

// Card Interface
interface Card {
  id: string;
  type: CardType;
  value: string;
  emotion: string;
  emoji?: string;
  color?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const FeelingsMatchGame = () => {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Refs for animations and sounds
  const lottieRef = useRef(null);
  const soundEffects = useRef<Record<string, Audio.Sound>>({}).current;
  
  // Level settings
  const levelSettings = [
    { pairs: 3, emotions: ['happy', 'sad'] },
    { pairs: 4, emotions: ['happy', 'sad', 'angry'] },
    { pairs: 5, emotions: ['happy', 'sad', 'angry', 'scared'] },
    { pairs: 6, emotions: ['happy', 'sad', 'angry', 'scared', 'surprised'] }
  ];

  // Initialize game
  useEffect(() => {
    setupGame();
    loadSounds();
    
    // Fade in the game
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    return () => {
      // Cleanup sounds
      Object.values(soundEffects).forEach(sound => {
        sound?.unloadAsync();
      });
    };
  }, []);
  
  // Effect for level changes
  useEffect(() => {
    if (level > 1) {
      setupGame();
      playSound('level-up');
      triggerSuccessAnimation();
    }
  }, [level]);
  
  // Load sound effects
  const loadSounds = async () => {
    try {
      const sounds = {
        'flip': require('../assets/sounds/card-flip.mp3'),
        'match': require('../assets/sounds/match.mp3'),
        'wrong': require('../assets/sounds/wrong.mp3'),
        'level-up': require('../assets/sounds/level-up.mp3'),
        'win': require('../assets/sounds/win.mp3'),
      };
      
      for (const [key, value] of Object.entries(sounds)) {
        const { sound } = await Audio.Sound.createAsync(value);
        soundEffects[key] = sound;
      }
    } catch (error) {
      console.log('Error loading sounds', error);
    }
  };
  
  // Play a sound effect
  const playSound = async (name: string) => {
    try {
      const sound = soundEffects[name];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound', error);
    }
  };
  
  // Set up the game cards
  const setupGame = () => {
    setIsLoading(true);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    
    const currentLevel = levelSettings[level - 1];
    const emotionSubset = GAME_DATA.filter(data => 
      currentLevel.emotions.includes(data.emotion)
    );
    
    let gameCards: Card[] = [];
    let pairCount = 0;
    
    // Create card pairs (emotion + situation)
    emotionSubset.forEach(emotionData => {
      // We use a random subset of situations based on the level
      const situationsToUse = [...emotionData.situations]
        .sort(() => 0.5 - Math.random())
        .slice(0, level === 1 ? 1 : 
          (level === 2 && emotionData.emotion === 'angry') ? 1 : 2);
      
      // Create emotion card
      gameCards.push({
        id: `emotion-${emotionData.emotion}`,
        type: 'emotion',
        value: emotionData.emotion,
        emotion: emotionData.emotion,
        emoji: emotionData.emoji,
        color: emotionData.color,
        isFlipped: false,
        isMatched: false
      });
      
      // Create situation cards that match this emotion
      situationsToUse.forEach((situation, idx) => {
        gameCards.push({
          id: `situation-${emotionData.emotion}-${pairCount}`,
          type: 'situation',
          value: situation,
          emotion: emotionData.emotion,
          color: emotionData.color, // Add color to situation cards too
          isFlipped: false,
          isMatched: false
        });
        pairCount++;
      });
    });
    
    // Shuffle the cards
    gameCards = shuffleArray(gameCards);
    setCards(gameCards);
    setIsLoading(false);
  };
  
  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle card flip
  const handleCardPress = (card: Card) => {
    // Ignore if card is already flipped or matched
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }
    
    // Vibration feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Play flip sound
    playSound('flip');
    
    // Flip the card
    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);
    
    // Add to flipped cards
    const updatedFlippedCards = [...flippedCards, card];
    setFlippedCards(updatedFlippedCards);
    
    // Check for match if we have two cards flipped
    if (updatedFlippedCards.length === 2) {
      setMoves(moves + 1);
      checkForMatch(updatedFlippedCards);
    }
  };
  
  // Check if flipped cards match
  const checkForMatch = (flippedPair: Card[]) => {
    const [first, second] = flippedPair;
    
    // We have a match if:
    // 1. One card is an emotion and one is a situation
    // 2. The emotion values match
    const isMatch = first.emotion === second.emotion && 
                   first.type !== second.type;
    
    setTimeout(() => {
      if (isMatch) {
        // Handle match
        handleMatch(flippedPair);
      } else {
        // Handle no match
        handleNoMatch(flippedPair);
      }
    }, 1000);
  };
  
  // Handle when cards match
  const handleMatch = (matchedCards: Card[]) => {
    // Play match sound
    playSound('match');
    
    // Give haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Update cards to matched state - IMPORTANT: Keep isFlipped true!
    const updatedCards = cards.map(card => 
      matchedCards.some(c => c.id === card.id) 
        ? { ...card, isMatched: true, isFlipped: true } 
        : card
    );
    setCards(updatedCards);
    setFlippedCards([]);
    
    // Update matched pairs and score
    const newMatchedPairs = matchedPairs + 1;
    setMatchedPairs(newMatchedPairs);
    setScore(score + 10 * level); // More points for higher levels
    
    // Trigger success animation
    triggerBounceAnimation();
    
    // Check if level is complete
    const totalPairsInLevel = level === 1 ? 2 : level + 1;
    if (newMatchedPairs >= totalPairsInLevel) {
      handleLevelComplete();
    }
  };
  
  // Handle when cards don't match
  const handleNoMatch = (cards: Card[]) => {
    // Play wrong sound
    playSound('wrong');
    
    // Give haptic feedback (light)
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Flip cards back over
    setCards(prev => 
      prev.map(card => 
        cards.some(c => c.id === card.id) 
          ? { ...card, isFlipped: false } 
          : card
      )
    );
    setFlippedCards([]);
  };
  
  // Handle level completion
  const handleLevelComplete = () => {
    setTimeout(() => {
      if (level < levelSettings.length) {
        // Move to next level
        setLevel(level + 1);
      } else {
        // Game complete!
        setIsGameComplete(true);
        playSound('win');
        triggerSuccessAnimation();
        saveGameResults();
      }
    }, 1500);
  };
  
  // Save game results
  const saveGameResults = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      // You would normally send this to your backend
      console.log('Game completed with score:', score);
      
      // Mark activity as completed
      // This function would come from your notification service
      // markActivityCompleted('feelings-match');
    } catch (error) {
      console.log('Error saving game results', error);
    }
  };
  
  // Animation helpers
  const triggerBounceAnimation = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };
  
  const triggerSuccessAnimation = () => {
    celebrationAnim.setValue(0);
    Animated.timing(celebrationAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };
  
  // Calculate the appropriate card size based on screen and level
// Modify the calculateCardSize function
const calculateCardSize = () => {
  // Get proper dimensions based on platform
  const containerWidth = isWeb ? Math.min(width, 600) : width;
  
  if (level === 1) {
    // Fixed size for level 1 (2 cards per row)
    return {
      width: (containerWidth - 60) / 2,
      height: ((containerWidth - 60) / 2) * (isWeb ? 0.8 : 1)  // Lower height ratio on web
    };
  } else {
    // For level 2+: adjust cards per row based on platform
    const availableWidth = containerWidth - 40;
    const cardsPerRow = isWeb ? 4 : 2;
    const cardWidth = (availableWidth - 30) / cardsPerRow;
    const cardHeight = cardWidth * (isWeb ? 0.6 : 0.53);
    
    return { 
      width: cardWidth * 0.9, 
      height: cardHeight * 0.9
    };
  }
};

  // Render a card
  const renderCard = (card: Card, index: number) => {
    const cardSize = calculateCardSize();
    
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.cardContainer, 
          { width: cardSize.width, height: cardSize.height },
          isWeb && styles.webCardContainer
        ]}
        onPress={() => handleCardPress(card)}
        activeOpacity={0.8}
        disabled={card.isFlipped || card.isMatched}
      >
        <View style={[
          styles.card,
          card.isMatched && styles.matchedCard
        ]}>
          {/* Card Back (shown by default) */}
          <View style={[
            styles.cardFace, 
            styles.cardBack,
            card.isFlipped && (isWeb 
              ? { transform: [{ rotateY: '180deg' }], opacity: 0 } // Web version
              : { transform: [{ rotateY: '180deg' }] } // Native version
            )
          ]}>
            <Text style={styles.cardBackText}>?</Text>
          </View>
          
          {/* Card Front (hidden by default) */}
          <View style={[
            styles.cardFace, 
            styles.cardFront,
            card.type === 'emotion' ? styles.emotionCard : styles.situationCard,
            { backgroundColor: card.color || '#6A5ACD' },
            !card.isFlipped && (isWeb
              ? { transform: [{ rotateY: '180deg' }], opacity: 0 } // Web version 
              : { transform: [{ rotateY: '180deg' }] } // Native version
            )
          ]}>
            {card.type === 'emotion' ? (
              <>
                <Text style={styles.emojiText}>{card.emoji}</Text>
                <Text style={styles.emotionText}>{card.value}</Text>
              </>
            ) : (
              <Text style={styles.situationText}>{card.value}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render the tutorial overlay
  const renderTutorial = () => {
    if (!showTutorial) return null;
    
    return (
      <TouchableOpacity 
        style={styles.tutorialOverlay}
        activeOpacity={1}
        onPress={() => setShowTutorial(false)}
      >
        <View style={styles.tutorialCard}>
          <Text style={styles.tutorialTitle}>How to Play</Text>
          <View style={styles.tutorialStep}>
            <Text style={styles.tutorialNumber}>1</Text>
            <Text style={styles.tutorialText}>Flip cards to find matching emotions and situations</Text>
          </View>
          <View style={styles.tutorialStep}>
            <Text style={styles.tutorialNumber}>2</Text>
            <Text style={styles.tutorialText}>Match all pairs to complete the level</Text>
          </View>
          <View style={styles.tutorialStep}>
            <Text style={styles.tutorialNumber}>3</Text>
            <Text style={styles.tutorialText}>Each level adds more emotions to match!</Text>
          </View>
          <TouchableOpacity 
            style={styles.tutorialButton}
            onPress={() => setShowTutorial(false)}
          >
            <Text style={styles.tutorialButtonText}>Let's Play!</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render level complete overlay
  const renderLevelComplete = () => {
    if (!isGameComplete) return null;
    
    return (
      <View style={styles.gameCompleteOverlay}>
        <Animated.View 
          style={[
            styles.gameCompleteCard,
            {
              opacity: celebrationAnim,
              transform: [
                { scale: celebrationAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.1, 1]
                })}
              ]
            }
          ]}
        >
          {!isWeb ? (
            // Native animation
            <LottieView
              ref={lottieRef}
              source={require('../assets/animations/confetti.json')}
              style={styles.lottieAnimation}
              loop={false}
              autoPlay={false}
            />
          ) : (
            // Web confetti alternative
            <View style={styles.webConfetti}>
              {Array(12).fill('🎉').map((emoji, i) => (
                <Text 
                  key={i}
                  style={{
                    position: 'absolute',
                    top: Math.random() * 100,
                    left: Math.random() * 350,
                    fontSize: 24,
                    opacity: 0.8,
                    transform: [{ rotate: `${Math.random() * 360}deg` }]
                  }}
                >
                  {emoji}
                </Text>
              ))}
            </View>
          )}
          
          <Text style={styles.gameCompleteTitle}>Amazing Job!</Text>
          <Text style={styles.gameCompleteScore}>Score: {score}</Text>
          <Text style={styles.gameCompleteText}>You matched all the emotions with their situations!</Text>
          
          <TouchableOpacity 
            style={styles.playAgainButton}
            onPress={() => {
              setLevel(1);
              setIsGameComplete(false);
              setScore(0);
              setupGame();
            }}
          >
            <LinearGradient
              colors={['#6A5ACD', '#9370DB']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={() => router.back()}
          >
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
      <Animated.View 
        style={[
          styles.gameContainer,
          { opacity: fadeAnim },
          isWeb && styles.webGameContainer
        ]}
      >
        {/* Header with level and score */}
        <View style={styles.header}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Level</Text>
            <Animated.Text 
              style={[
                styles.levelText,
                { transform: [{ scale: bounceAnim }] }
              ]}
            >
              {level}
            </Animated.Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Animated.Text 
              style={[
                styles.scoreText,
                { transform: [{ scale: bounceAnim }] }
              ]}
            >
              {score}
            </Animated.Text>
          </View>
        </View>
        
        {/* Game instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Match emotions with situations!
          </Text>
        </View>
        
        {/* Cards grid */}
        <View style={[styles.cardsContainer, isWeb && styles.webCardsContainer]}>
          {level === 1 ? (
            // For level 1, explicitly arrange in 2x2 grid
            <>
              <View style={styles.cardRow}>
                {cards.slice(0, 2).map((card, index) => renderCard(card, index))}
              </View>
              <View style={styles.cardRow}>
                {cards.slice(2, 4).map((card, index) => renderCard(card, index + 2))}
              </View>
            </>
          ) : (
            // For level 2+, use the normal flow
            cards.map((card, index) => renderCard(card, index))
          )}
        </View>
        
        {/* Game stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moves}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pairs</Text>
            <Text style={styles.statValue}>{matchedPairs}</Text>
          </View>
        </View>
        
        {/* Exit button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/dashboard')}  // Change from router.back()
        >
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Overlays */}
      {renderTutorial()}
      {renderLevelComplete()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  exitButtonWrapper: {
    width: '100%', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 5,
  },
  backButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 30, // Increased horizontal padding
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 150, // Ensure minimum width
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A5ACD', // Changed to match app color theme
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gameContainer: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    zIndex: 10,
  },
  levelContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  levelLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A5ACD',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A5ACD',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 5,
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
// Update these styles in your StyleSheet

cardsContainer: {
  flex: 1,
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between', // This is good
  alignContent: 'flex-start',
  paddingBottom: 20,
  paddingHorizontal: 7, // Slightly more horizontal padding
},

cardContainer: {
  margin: 5,
  perspective: 1000,
  width: '40%', // Make this slightly closer to 50% minus margins
  minWidth: 10, // Ensure minimum width for small screens
  marginBottom: 15, // Add bottom margin to separate rows clearly
},
// Alternative approach (if needed)
// Remove the 'margin: 5' from cardContainer style above
// And add this style:

cardRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 15,
},
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardBack: {
    backgroundColor: '#6A5ACD',
    zIndex: 1,
  },
  cardFront: {
    zIndex: 0,
  },
  emotionCard: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  situationCard: {
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardBackText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emojiText: {
    fontSize: 40,
    marginBottom: 5,
  },
  emotionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  situationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  matchedCard: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A5ACD',
  },
  backButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10, // Add bottom margin to ensure button is not cut off
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tutorialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A5ACD',
    marginBottom: 20,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  tutorialNumber: {
    backgroundColor: '#6A5ACD',
    color: '#FFFFFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tutorialText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  tutorialButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  tutorialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gameCompleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameCompleteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
  },
  gameCompleteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A5ACD',
    marginTop: 10,
    marginBottom: 10,
  },
  gameCompleteScore: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 20,
  },
  gameCompleteText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  playAgainButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exitButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  exitButtonText: {
    fontSize: 16,
    color: '#6A5ACD',
  },
  webContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  webGameContainer: {
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  webCardsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  webCardContainer: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    margin: 8,
  },
  webConfetti: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});

export default FeelingsMatchGame;

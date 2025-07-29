import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BreathingExercises() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const animation = useRef(new Animated.Value(1)).current;
  const [breathingPhase, setBreathingPhase] = useState('ready'); // 'inhale', 'hold', 'exhale', 'ready'
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [practiceTime, setPracticeTime] = useState(3); // Default 3 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // In seconds
  const [focusMode, setFocusMode] = useState(false);
  const timerAnimation = useRef(new Animated.Value(1)).current;
  
  // Breathing exercises for kids
  const exercises = [
    {
      id: 'balloon',
      title: 'Balloon Breathing',
      description: 'Pretend to inflate a big balloon in your tummy',
      icon: 'rocket',
      color: '#FF9800',
      instructions: [
        'Sit or stand comfortably',
        'Place your hands on your tummy',
        'Breathe in deeply through your nose for 4 counts - feel your tummy grow like a balloon',
        'Hold your breath for 2 counts',
        'Slowly breathe out through your mouth for 4 counts - feel your balloon deflate',
        'Repeat 5 times',
      ],
      animationTiming: {
        inhale: 4000,
        hold: 2000, 
        exhale: 4000,
      },
      image: 'https://cdn-icons-png.flaticon.com/512/3588/3588323.png', // balloon image
    },
    {
      id: 'bunny',
      title: 'Bunny Breathing',
      description: 'Quick sniffs like a bunny to feel energized',
      icon: 'rabbit',
      color: '#4CAF50',
      instructions: [
        'Sit comfortably',
        'Take three quick sniffs through your nose',
        'Let it out with one long exhale through your mouth',
        'Repeat 5 times',
      ],
      animationTiming: {
        inhale: 1000,
        hold: 500, 
        exhale: 3000,
      },
      image: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png', // bunny image
    },
    {
      id: 'dragon',
      title: 'Dragon Fire Breath',
      description: 'Breathe fire like a dragon to release anger',
      icon: 'fire',
      color: '#F44336',
      instructions: [
        'Sit up tall',
        'Take a deep breath in through your nose',
        'Exhale forcefully through your mouth, like you\'re breathing fire!',
        'Repeat 5 times',
      ],
      animationTiming: {
        inhale: 4000, // Increased from 3000 to give more time
        hold: 1000,   // Increased from 500 to make the hold more noticeable
        exhale: 3000, // Increased from 2000 to allow for a more complete exhale
      },
      image: 'https://cdn-icons-png.flaticon.com/512/7626/7626347.png', // dragon image
    },
    {
      id: 'starfish',
      title: 'Starfish Breathing',
      description: 'Trace your fingers like a starfish as you breathe',
      icon: 'star',
      color: '#2196F3',
      instructions: [
        'Spread one hand like a starfish',
        'Using the pointer finger of your other hand',
        'Slowly trace up your thumb as you breathe in',
        'Slowly trace down as you breathe out',
        'Continue for each finger',
      ],
      animationTiming: {
        inhale: 5000, // Increased from 3000 for a slower, more deliberate trace
        hold: 500,    // Added a small hold between inhale and exhale
        exhale: 5000, // Increased from 3000 for a slower, more deliberate trace
      },
      image: 'https://cdn-icons-png.flaticon.com/512/7983/7983906.png', // starfish image
    },
    {
      id: 'triangle',
      title: 'Triangle Breathing',
      description: 'Imagine a triangle as you breathe and count',
      icon: 'play',
      color: '#9C27B0',
      instructions: [
        'Imagine drawing a triangle in the air',
        'Breathe in for 3 counts - first side',
        'Hold for 3 counts - second side',
        'Breathe out for 3 counts - third side',
        'Repeat 3-5 times',
      ],
      animationTiming: {
        inhale: 4500, // Increased from 3000 to slow down the exercise
        hold: 4500,   // Increased from 3000 to match the inhale time
        exhale: 4500, // Increased from 3000 to match the other phases
      },
      image: 'https://cdn-icons-png.flaticon.com/512/6382/6382319.png', // triangle image
    },
  ];

  // Animation for the breathing circle
  const startBreathingAnimation = (exercise) => {
    if (!exercise) return;

    const { inhale, hold, exhale } = exercise.animationTiming;
    
    // Reset animation value
    animation.setValue(1);
    setBreathingPhase('ready');

    // Run the animation sequence with better phase synchronization
    setTimeout(() => {
      setBreathingPhase('inhale');
      
      Animated.sequence([
        // Inhale - expand
        Animated.timing(animation, {
          toValue: 1.8,
          duration: inhale,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After inhale completes
        if (hold > 0) {
          setBreathingPhase('hold');
          
          Animated.timing(animation, {
            toValue: 1.8,
            duration: hold,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start(() => {
            // After hold completes
            setBreathingPhase('exhale');
            
            Animated.timing(animation, {
              toValue: 1,
              duration: exhale,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              // After exhale completes
              setBreathingPhase('ready');
              
              // Loop the animation if still selected
              if (selectedExercise === exercise.id) {
                setTimeout(() => {
                  startBreathingAnimation(exercise);
                }, 500); // Small pause between cycles
              }
            });
          });
        } else {
          // Skip hold phase if hold time is 0
          setBreathingPhase('exhale');
          
          Animated.timing(animation, {
            toValue: 1,
            duration: exhale,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            setBreathingPhase('ready');
            
            if (selectedExercise === exercise.id) {
              setTimeout(() => {
                startBreathingAnimation(exercise);
              }, 500);
            }
          });
        }
      });
    }, 1500); // Increased from 1000 to give more preparation time
  };

  // Start animation when exercise is selected
  useEffect(() => {
    const exercise = exercises.find(ex => ex.id === selectedExercise);
    if (exercise) {
      startBreathingAnimation(exercise);
    }
  }, [selectedExercise]);

  // Stop animation when component unmounts
  useEffect(() => {
    return () => {
      animation.stopAnimation();
    };
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          const newTime = time - 1;
          // Update timer animation
          Animated.timing(timerAnimation, {
            toValue: newTime / (practiceTime * 60),
            duration: 1000,
            useNativeDriver: false,
          }).start();
          
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      setTimerActive(false);
      setFocusMode(false); // Exit focus mode when timer completes
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const startTimer = () => {
    setTimeRemaining(practiceTime * 60);
    setTimerActive(true);
    setTimerModalVisible(false);
    setFocusMode(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getBreathingText = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      default: return 'Get Ready...';
    }
  };
  
  const getBreathingInstructions = () => {
    const exercise = exercises.find(ex => ex.id === selectedExercise);
    if (!exercise) return '';
    
    switch (breathingPhase) {
      case 'inhale': 
        if (exercise.id === 'bunny') {
          return 'Take three quick sniffs through your nose!';
        } else if (exercise.id === 'dragon') {
          return 'Fill your lungs completely with air...';
        } else if (exercise.id === 'starfish') {
          return 'Trace up your finger as you breathe in...';
        } else if (exercise.id === 'triangle') {
          return 'Breathe in as you trace the first side...';
        } else {
          return 'Fill your lungs slowly and deeply';
        }
      case 'hold': 
        if (exercise.id === 'bunny') {
          return 'Just a quick pause...';
        } else if (exercise.id === 'dragon') {
          return 'Feel the energy building...';
        } else if (exercise.id === 'starfish') {
          return 'Pause at the fingertip...';
        } else if (exercise.id === 'triangle') {
          return 'Hold as you trace the second side...';
        } else {
          return 'Hold gently, stay relaxed';
        }
      case 'exhale': 
        if (exercise.id === 'dragon') {
          return 'Release your breath like a mighty dragon!';
        } else if (exercise.id === 'starfish') {
          return 'Trace down your finger as you breathe out...';
        } else if (exercise.id === 'triangle') {
          return 'Breathe out as you trace the third side...';
        } else {
          return 'Let all the air flow out completely';
        }
      default: 
        if (exercise.id === 'triangle') {
          return 'Get ready to trace your triangle...';
        } else if (exercise.id === 'starfish') {
          return 'Get ready to trace your starfish hand...';
        } else if (exercise.id === 'dragon') {
          return 'Prepare to breathe fire like a dragon...';
        } else {
          return 'Prepare for the next breath cycle';
        }
    }
  };

  const renderExerciseList = () => (
    <>
      <Text style={styles.heading}>Breathing Exercises</Text>
      <Text style={styles.intro}>
        Breathing exercises help you calm down when you're feeling angry, worried, or just need to focus.
        Choose an exercise below to get started!
      </Text>
      
      {exercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          style={[styles.exerciseCard, { borderLeftColor: exercise.color }]}
          onPress={() => setSelectedExercise(exercise.id)}
        >
          <View style={[styles.iconContainer, { backgroundColor: exercise.color }]}>
            <FontAwesome5 name={exercise.icon} size={24} color="#FFF" />
          </View>
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          </View>
          <Image 
            source={{ uri: exercise.image }}
            style={styles.exerciseThumbnail}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>
          <FontAwesome5 name="lightbulb" size={16} color="#FFD700" /> Remember
        </Text>
        <Text style={styles.tipText}>
          You can use these breathing exercises anytime you feel angry, worried, or just need to calm down!
        </Text>
      </View>
    </>
  );

  const renderExerciseDetail = () => {
    const exercise = exercises.find(ex => ex.id === selectedExercise);
    if (!exercise) return null;

    // In focus mode, show only the essential elements
    if (focusMode) {
      return (
        <View style={styles.focusModeContainer}>
          {/* Timer display */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <View style={styles.timerProgressContainer}>
              <Animated.View 
                style={[
                  styles.timerProgressBar, 
                  { 
                    width: timerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Minimalist breathing animation */}
          <View style={styles.focusAnimationContainer}>
            <Animated.View
              style={[
                styles.breathingCircleFocus,
                {
                  backgroundColor: `${exercise.color}22`,
                  borderColor: exercise.color,
                  transform: [{ scale: animation }],
                },
              ]}
            >
              <FontAwesome5 name={exercise.icon} size={60} color={exercise.color} />
            </Animated.View>
            <Text style={styles.focusBreathingText}>{getBreathingText()}</Text>
          </View>

          {/* Exit focus mode button */}
          <TouchableOpacity
            style={styles.exitFocusModeButton}
            onPress={() => {
              setFocusMode(false);
              setTimerActive(false);
            }}
          >
            <FontAwesome5 name="times" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.exerciseDetailContainer}>
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={() => setSelectedExercise(null)}
        >
          <FontAwesome5 name="arrow-left" size={16} color={exercise.color} />
          <Text style={[styles.backToListText, { color: exercise.color }]}>
            Back to exercises
          </Text>
        </TouchableOpacity>

        <Text style={[styles.detailTitle, { color: exercise.color }]}>
          {exercise.title}
        </Text>
        
        <Image 
          source={{ uri: exercise.image }}
          style={styles.exerciseImage}
          resizeMode="contain"
        />

        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                backgroundColor: `${exercise.color}22`,
                borderColor: exercise.color,
                transform: [{ scale: animation }],
              },
            ]}
          >
            <FontAwesome5 name={exercise.icon} size={40} color={exercise.color} />
          </Animated.View>
          <Text style={styles.breathingText}>{getBreathingText()}</Text>
          <Text style={styles.breathingInstructions}>{getBreathingInstructions()}</Text>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to do it:</Text>
          {exercise.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={[styles.instructionBullet, { backgroundColor: exercise.color }]} />
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Timer start button */}
        <TouchableOpacity
          style={[styles.timerButton, { backgroundColor: exercise.color }]}
          onPress={() => setTimerModalVisible(true)}
        >
          <FontAwesome5 name="clock" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.timerButtonText}>Start Timed Practice</Text>
        </TouchableOpacity>

        <View style={[styles.tipContainer, { backgroundColor: `${exercise.color}22` }]}>
          <Text style={[styles.tipTitle, { color: exercise.color }]}>
            <FontAwesome5 name="star" size={16} color={exercise.color} /> Fun fact
          </Text>
          <Text style={styles.tipText}>
            {exercise.id === 'balloon' && "When you breathe deeply, your body gets more oxygen which helps your brain work better!"}
            {exercise.id === 'bunny' && "Bunnies breathe up to 20 times per minute! That's a lot faster than humans."}
            {exercise.id === 'dragon' && "Dragon breathing is a real yoga technique that helps clear your mind and release strong feelings."}
            {exercise.id === 'starfish' && "Starfish don't have lungs like we do - they breathe through tiny tubes on their skin!"}
            {exercise.id === 'triangle' && "Following shapes while you breathe helps your brain focus and relax at the same time."}
          </Text>
        </View>
      </View>
    );
  };

  // Timer setting modal
  const renderTimerModal = () => (
    <Modal
      visible={timerModalVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Practice Time</Text>
          <Text style={styles.modalSubtitle}>How many minutes would you like to practice?</Text>
          
          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              style={styles.timeAdjustButton}
              onPress={() => setPracticeTime(Math.max(1, practiceTime - 1))}
            >
              <Text style={styles.timeAdjustButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.timeDisplay}>
              <Text style={styles.timeDisplayText}>{practiceTime}</Text>
              <Text style={styles.timeUnitText}>min</Text>
            </View>
            
            <TouchableOpacity
              style={styles.timeAdjustButton}
              onPress={() => setPracticeTime(Math.min(20, practiceTime + 1))}
            >
              <Text style={styles.timeAdjustButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setTimerModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.startButton]}
              onPress={startTimer}
            >
              <Text style={styles.modalButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!focusMode && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Breathing Exercises</Text>
        </View>
      )}

      {!focusMode ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {selectedExercise ? renderExerciseDetail() : renderExerciseList()}
          
          {/* Footer Image - Kid-friendly visual */}
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2549/2549371.png' }}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </ScrollView>
      ) : (
        renderExerciseDetail()
      )}
      
      {/* Timer Setting Modal */}
      {renderTimerModal()}
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f7ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6a11cb',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
    textAlign: 'center',
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  tipContainer: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF9800',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  exerciseDetailContainer: {
    flex: 1,
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: 20,
    height: 200,
    justifyContent: 'center',
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  instructionsContainer: {
    marginVertical: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  instructionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  footerImage: {
    width: width - 32,
    height: 120,
    marginTop: 20,
    alignSelf: 'center',
    opacity: 0.8,
  },
  exerciseThumbnail: {
    width: 50,
    height: 50,
    marginLeft: 8,
  },
  exerciseImage: {
    width: width - 32,
    height: 150,
    marginVertical: 15,
    alignSelf: 'center',
  },
  breathingInstructions: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    textAlign: 'center',
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  timerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeAdjustButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeAdjustButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  timeDisplay: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  timeDisplayText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4F6DF5',
  },
  timeUnitText: {
    fontSize: 16,
    color: '#666',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  focusModeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f7ff',
  },
  focusAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  breathingCircleFocus: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusBreathingText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 24,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
    width: '100%',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timerProgressContainer: {
    width: '80%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  timerProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  exitFocusModeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  FlatList,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from './styles';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.83.240:5000";

// Situations that trigger anger
const situations = [
  "When plans are cancelled",
  "When someone calls you names",
  "When you feel threatened or bullied",
  "When you see someone cheat",
  "When someone is teasing you",
  "When mom asks you to stop playing video games",
  "When you have to be nice to people you don't like such as a relative",
  "When your brother or sister bugs you or takes your stuff"
];

// Get the coping skills (same as page3)
const copingSkills = [
  'Just walk away',
  'Take 3 deep breaths',
  'Sit down',
  'Keep your mouth shut',
  'Take a time out',
  'Tell yourself to cool down',
  'Think - I\'m okay',
  'Make a joke',
  'Don\'t take the bait',
  'Fake it. Pretend to be cool',
  'Do something nice',
  'Give a compliment',
  'Ask for a hug',
  'Hug your pet',
  'Take a break and go to the restroom',
  'Use "I" statements',
  'Push against a wall or the floor',
  'Scribble about what\'s bothering you',
  'Squeeze your hands and let go',
  'Take a quick shower',
  'Listen to music',
];

export default function Activity5Page4() {
  const router = useRouter();
  const [responses, setResponses] = useState({});
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listItemAnims = situations.map(() => useRef(new Animated.Value(0)).current);
  const confettiAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in main content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Staggered animation for situations
    Animated.stagger(100,
      listItemAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
  
  // Handle dropdown selection
  const toggleDropdown = (situationIndex) => {
    if (currentDropdown === situationIndex) {
      setCurrentDropdown(null);
    } else {
      setCurrentDropdown(situationIndex);
    }
  };
  
  // Handle selecting a coping strategy
  const selectCopingStrategy = (situation, strategy) => {
    setResponses(prev => ({
      ...prev,
      [situation]: strategy
    }));
    setCurrentDropdown(null);
  };
  
  // Check if all situations have a selected response
  const allSituationsAnswered = () => {
    return situations.every(situation => responses[situation]);
  };
  
  // Save responses to database
  const handleSave = async () => {
    if (!allSituationsAnswered()) {
      setError('Please select a coping strategy for each situation.');
      return;
    }
    
    setSaving(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/activity5/responses`,
        { 
          situationResponses: responses,
          completedAt: new Date() 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSaving(false);
      setCompleted(true);
      
      // Animate confetti
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
      
    } catch (err) {
      console.error('Error saving responses:', err);
      setSaving(false);
      setError('Failed to save your choices. Please try again.');
    }
  };
  
  // Go back to dashboard when done
  const handleComplete = () => {
    router.push('/dashboard');
  };
  
  // Render celebration confetti
  const renderConfetti = () => {
    const confetti = [];
    for (let i = 0; i < 30; i++) {
      // Random confetti properties for diversity
      const size = Math.random() * 10 + 5;
      const left = Math.random() * 100;
      const delay = Math.random() * 500;
      const duration = Math.random() * 1000 + 2000;
      const color = [colors.primary, colors.secondary, colors.accent][Math.floor(Math.random() * 3)];
      
      // Individual confetti animation style
      const confettiStyle = {
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        position: 'absolute',
        left: `${left}%`,
        top: -20,
        opacity: confettiAnim.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        }),
        transform: [
          {
            translateY: confettiAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 500],
            }),
          },
          {
            rotate: confettiAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${Math.random() * 360}deg`],
            }),
          },
        ],
      };
      
      confetti.push(
        <Animated.View
          key={i}
          style={confettiStyle}
        />
      );
    }
    
    return confetti;
  };
  
  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={[colors.primary, '#7b1fa2']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>Let's Do Something About It!</Text>
          </LinearGradient>
          
          <Text style={styles.subtitle}>
            Situation or Context → Response
          </Text>
          
          <Text style={styles.instruction}>
            Choose a coping strategy for each situation:
          </Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Animated.View>
        
        {/* List of situations with dropdown selectors */}
        {situations.map((situation, index) => (
          <Animated.View 
            key={situation}
            style={[
              { opacity: listItemAnims[index] },
              { transform: [{ 
                translateY: listItemAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]}
            ]}
          >
            <View style={styles.situationCard}>
              <Text style={styles.situationText}>{situation}</Text>
              
              <TouchableOpacity 
                style={[
                  styles.dropdownContainer,
                  responses[situation] ? styles.dropdownSelected : {}
                ]} 
                onPress={() => toggleDropdown(index)}
              >
                <Text style={styles.dropdownSelected}>
                  {responses[situation] || "Select a coping strategy"}
                </Text>
              </TouchableOpacity>
              
              {currentDropdown === index && (
                <View style={styles.dropdownList}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {copingSkills.map(skill => (
                      <TouchableOpacity 
                        key={skill} 
                        style={styles.dropdownItem}
                        onPress={() => selectCopingStrategy(situation, skill)}
                      >
                        <Text style={styles.dropdownItemText}>{skill}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </Animated.View>
        ))}
        
        {completed ? (
          <>
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>
                Great job! You've completed Activity 5!
              </Text>
              
              <TouchableOpacity 
                style={commonStyles.button}
                onPress={handleComplete}
              >
                <Text style={commonStyles.buttonText}>Back to Dashboard</Text>
              </TouchableOpacity>
            </View>
            
            {renderConfetti()}
          </>
        ) : (
          <TouchableOpacity 
            style={[
              commonStyles.button,
              saving && styles.savingButton,
              !allSituationsAnswered() && styles.disabledButton
            ]}
            onPress={handleSave}
            disabled={saving || !allSituationsAnswered()}
          >
            <Text style={commonStyles.buttonText}>
              {saving ? "Saving..." : "Complete Activity"}
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={commonStyles.progressIndicator}>
          <View style={commonStyles.progressDot} />
          <View style={commonStyles.progressDot} />
          <View style={commonStyles.progressDot} />
          <View style={[commonStyles.progressDot, commonStyles.progressDotActive]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  situationCard: {
    backgroundColor: colors.cardBg,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  situationText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 10,
  },
  dropdownContainer: {
    height: 50,
    borderColor: '#d0d0d0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dropdownSelected: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  savingButton: {
    backgroundColor: colors.textLight,
  },
  disabledButton: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0.05,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
    marginBottom: 20,
  },
});
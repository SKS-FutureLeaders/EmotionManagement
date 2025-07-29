import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from './styles';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// List of coping skills
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

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.83.240:5000";

export default function Activity5Page3() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listItemAnims = copingSkills.map(() => useRef(new Animated.Value(0)).current);
  
  useEffect(() => {
    // Fade in main content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Staggered animation for list items
    Animated.stagger(50,
      listItemAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
  
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
    setError('');
  };
  
  const handleSave = async () => {
    if (selectedSkills.length < 3) {
      setError('Please select at least 3 coping skills.');
      // Shake animation for error message
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      return;
    }
    
    setSaving(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/activity5/copingskills`,
        { 
          selectedSkills,
          completedAt: new Date() 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSaving(false);
      router.push('/activities/activity5/page4');
    } catch (err) {
      console.error('Error saving coping skills:', err);
      setSaving(false);
      setError('Failed to save your choices. Please try again.');
    }
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
          
          <Text style={[commonStyles.subtitle, styles.question]}>
            Are you ready to take control?
          </Text>
          
          <Text style={styles.instruction}>
            Check at least 3 coping skills that you can use to manage your anger:
          </Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Animated.View>
        
        {copingSkills.map((skill, index) => (
          <Animated.View 
            key={skill} 
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
            <TouchableOpacity 
              style={[
                commonStyles.checkboxContainer,
                selectedSkills.includes(skill) && commonStyles.checkboxSelected
              ]}
              onPress={() => toggleSkill(skill)}
              activeOpacity={0.7}
            >
              <View style={commonStyles.checkbox}>
                {selectedSkills.includes(skill) && <View style={commonStyles.checkboxInner} />}
              </View>
              <Text style={commonStyles.checkboxLabel}>{skill}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
        
        <TouchableOpacity 
          style={[
            commonStyles.button, 
            saving && styles.savingButton
          ]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={commonStyles.buttonText}>
            {saving ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>
        
        <View style={commonStyles.progressIndicator}>
          <View style={commonStyles.progressDot} />
          <View style={commonStyles.progressDot} />
          <View style={[commonStyles.progressDot, commonStyles.progressDotActive]} />
          <View style={commonStyles.progressDot} />
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
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 5,
  },
  instruction: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  savingButton: {
    backgroundColor: colors.textLight,
  },
});
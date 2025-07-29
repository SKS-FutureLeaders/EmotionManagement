import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from './styles';
import { LinearGradient } from 'expo-linear-gradient';

const symptoms = [
  'Dark', 'Dizzy', 'Heart rate spikes', 'Feel blood pressure rise',
  'Sweaty', 'Muscle tightness', 'Headache', 'Trembling',
  'Nausea', 'Can\'t sleep', 'Fatigue', 'Can\'t breathe properly'
];

export default function Activity5Page1() {
  const router = useRouter();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Staggered animation for symptoms
  const symptomAnims = symptoms.map(() => useRef(new Animated.Value(0)).current);
  
  useEffect(() => {
    // Fade in main content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animate symptoms with staggered effect
    Animated.stagger(100, 
      symptomAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
  
  const handleNext = () => {
    router.push('/activities/activity5/page2');
  };
  
  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <Animated.View 
          style={[
            commonStyles.header, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <LinearGradient
            colors={[colors.primary, '#7b1fa2']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>What's Happening To Me?</Text>
          </LinearGradient>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[commonStyles.subtitle, styles.questionText]}>
            What happens to your body when you're angry?
          </Text>
        </Animated.View>
        
        <View style={styles.symptomsContainer}>
          {symptoms.map((symptom, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.symptomBubble,
                {
                  opacity: symptomAnims[index],
                  transform: [{ scale: symptomAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })}]
                }
              ]}
            >
              <Text style={styles.symptomText}>{symptom}</Text>
            </Animated.View>
          ))}
        </View>
        
        <Animated.View 
          style={[
            commonStyles.card, 
            { opacity: fadeAnim, marginTop: 20 }
          ]}
        >
          <Text style={commonStyles.paragraph}>
            Anger sometimes feels like a wormhole that instantly transports you at warp speed to a dark place.
          </Text>
          <Text style={commonStyles.paragraph}>
            Many situations, people and their words or actions could make you feel angry. We all want to be happy but sometimes what we want isn't what someone else wants.
          </Text>
          <Text style={commonStyles.paragraph}>
            Then, we end up doing things or saying things that we regret later or ends up making us feel annoyed, frustrated, angry or furious.
          </Text>
        </Animated.View>
        
        <TouchableOpacity 
          style={[commonStyles.button, { backgroundColor: colors.primary }]} 
          onPress={handleNext}
        >
          <Text style={commonStyles.buttonText}>Continue</Text>
        </TouchableOpacity>
        
        <View style={commonStyles.progressIndicator}>
          <View style={[commonStyles.progressDot, commonStyles.progressDotActive]} />
          <View style={commonStyles.progressDot} />
          <View style={commonStyles.progressDot} />
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 5,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 15,
  },
  symptomBubble: {
    backgroundColor: '#e1bee7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  symptomText: {
    color: colors.primary,
    fontWeight: '500',
  },
});
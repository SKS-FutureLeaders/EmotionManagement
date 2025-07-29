import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from './styles';
import { LinearGradient } from 'expo-linear-gradient';

export default function Activity5Page2() {
  const router = useRouter();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const brainAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Fade in main content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Brain entrance animation
    Animated.timing(brainAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
      easing: Easing.elastic(1.2),
    }).start();
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        })
      ])
    ).start();
  }, []);
  
  const handleNext = () => {
    router.push('/activities/activity5/page3');
  };
  
  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <Animated.View 
          style={[
            commonStyles.header, 
            { opacity: fadeAnim }
          ]}
        >
          <LinearGradient
            colors={[colors.primary, '#7b1fa2']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>What's Happening To Me?</Text>
          </LinearGradient>
          <Text style={commonStyles.subtitle}>What happens when you feel angry?</Text>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.brainContainer,
            {
              opacity: brainAnim,
              transform: [
                { scale: pulseAnim },
                { 
                  translateY: brainAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Image 
            source={require('../../../assets/images/brain.png')} 
            style={styles.brainImage} 
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={commonStyles.card}>
            <Text style={commonStyles.paragraph}>
              When we are angry, it's like we get a boost of energy that makes us "do something". That ends up with our body reacting in many different ways: our muscles tense up and heart beats faster, our breathing becomes faster, we start sweating. It's all natural.
            </Text>
            
            <Text style={commonStyles.paragraph}>
              There is a part of our brain called the <Text style={commonStyles.emphasizedText}>"Amygdala"</Text> that gives us the fight, flight or freeze reactions.
            </Text>
            
            <Text style={commonStyles.paragraph}>
              Our higher brain functions controlled by <Text style={commonStyles.emphasizedText}>Prefrontal cortex</Text> can help us calm our "Amygdala" and help us realize it's not anger, it could be other emotions like sadness, frustration, and know that our initial reaction can get us into trouble.
            </Text>
          </View>
          
          <View style={[commonStyles.card, styles.highlightCard]}>
            <Text style={commonStyles.paragraph}>
              We get a rush of <Text style={styles.highlightedText}>"Adrenaline"</Text> that gives us that boost of energy to make our body react.
            </Text>
            
            <Text style={commonStyles.paragraph}>
              The minute our "Amygdala" signals, Adrenaline rushes throughout our body and makes us react.
            </Text>
            
            <Text style={[commonStyles.paragraph, { fontWeight: 'bold' }]}>
              Instead of reacting, let's give our "Prefrontal Cortex" to respond by putting a break and taking control.
            </Text>
          </View>
        </Animated.View>
        
        <TouchableOpacity 
          style={commonStyles.button} 
          onPress={handleNext}
        >
          <Text style={commonStyles.buttonText}>Continue</Text>
        </TouchableOpacity>
        
        <View style={commonStyles.progressIndicator}>
          <View style={commonStyles.progressDot} />
          <View style={[commonStyles.progressDot, commonStyles.progressDotActive]} />
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
  brainContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  brainImage: {
    width: '95%',
    height: 200,
  },
  highlightCard: {
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 18,
  },
});
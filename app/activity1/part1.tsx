import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function Part1() {
  const router = useRouter();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    // Create a bouncing animation for the image
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Show emoji after a delay
    const timer = setTimeout(() => setShowEmoji(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Activity 1: Say Hi to Anger</Text>
        
        {showEmoji && (
          <Text style={styles.emoji}>😠 → 😊</Text>
        )}

        <Text style={styles.description}>
          Figuring out what makes us angry is a bit tricky. It seems to come out of nowhere, and sometimes, when we least expect it!
        </Text>
        
        <Text style={styles.description}>
          Some of us get angry around certain people, and some places might make us feel upset too.
        </Text>

        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Image source={require('../../assets/images/anger.png')} style={styles.image} />
        </Animated.View>
        
        <Text style={styles.question}>
          Let's explore together what makes us angry and how it affects us and others around us!
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/activity1/part2')}
        >
          <Text style={styles.buttonText}>Next Adventure!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#FFEBEE', // Light red/pink background
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FF5252', // Vibrant red for the title
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#424242',
    lineHeight: 24,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
    color: '#673AB7',
  },
  image: {
    width: 500,
    height:500,
    resizeMode: 'contain',
    marginVertical: 20,
    borderRadius: 15,
  },
  button: {
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

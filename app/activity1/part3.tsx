import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function Part3() {
  const router = useRouter();
  const [angerTVCharacter, setAngerTVCharacter] = useState('');
  const [angerMotto, setAngerMotto] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [bounceAnim] = useState(new Animated.Value(0));

  const isFormComplete = () => {
    return angerTVCharacter && angerMotto;
  };
  
  // Create a bouncing animation for the images
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
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
  }, []);

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  const emojiOptions = [
    { emoji: '🔥', label: 'Super Hot!' },
    { emoji: '⚡', label: 'Zappy!' },
    { emoji: '🛑', label: 'Stop It!' },
    { emoji: '🌪️', label: 'Stormy!' },
    { emoji: '😈', label: 'Sneaky!' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Anger Adventure!</Text>
      
      <Text style={styles.question}>If your Anger was a TV character, who would it be?</Text>
      <Animated.View style={[styles.imageContainer, { transform: [{ translateY: bounce }] }]}>
        <Image 
          source={require('../../assets/images/anger-character.png')} 
          style={styles.characterImage} 
        />
        <Image 
          source={require('../../assets/images/anger-character3.png')} 
          style={styles.characterImage} 
        />
        <Image 
          source={require('../../assets/images/anger-character2.png')} 
          style={styles.characterImage} 
        />
      </Animated.View>
      <TextInput
        style={styles.input}
        value={angerTVCharacter}
        onChangeText={setAngerTVCharacter}
        placeholder="My anger is like..."
        placeholderTextColor="#9E9E9E"
        multiline={true}
        numberOfLines={3}
      />
      
      <Text style={styles.question}>Pick an emoji that matches your anger!</Text>
      <View style={styles.emojiContainer}>
        {emojiOptions.map((option) => (
          <TouchableOpacity 
            key={option.emoji} 
            style={[
              styles.emojiButton, 
              selectedEmoji === option.emoji && styles.selectedEmojiButton
            ]}
            onPress={() => setSelectedEmoji(option.emoji)}
          >
            <Text style={styles.emojiText}>{option.emoji}</Text>
            <Text style={styles.emojiLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.question}>What's your anger's favorite thing to say?</Text>
      <Text style={styles.instructions}>A motto is like a superhero catchphrase! What does your anger say?</Text>
      <Text style={styles.examples}>Here are some fun examples:</Text>
      <View style={styles.examplesContainer}>
        <Text style={styles.example}>• "Back away before it's too late." 🔥</Text>
        <Text style={styles.example}>• "You don't want to test me." ⚡</Text>
        <Text style={styles.example}>• "Not today." 🛑</Text>
        <Text style={styles.example}>• "You've unleashed the storm." 🌪️</Text>
        <Text style={styles.example}>• "I don't get mad, I get even." 😈</Text>
      </View>
      <TextInput
        style={styles.input}
        value={angerMotto}
        onChangeText={setAngerMotto}
        placeholder="My anger's favorite saying is..."
        placeholderTextColor="#9E9E9E"
        multiline={true}
        numberOfLines={3}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, !isFormComplete() && styles.disabledButton]} 
          onPress={() => router.push('/activity1/part1')}
          disabled={!isFormComplete()} 
        >
          <Text style={styles.buttonText}>
            {isFormComplete() ? "Awesome! I'm Done! 🎉" : "Fill in the blanks first! ✏️"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFF9C4', // Light yellow background - kid friendly
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF5722', // Warm orange color
    marginVertical: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#E91E63', // Pink color - kid friendly
  },
  instructions: {
    fontSize: 16,
    marginBottom: 8,
    color: '#673AB7', // Purple - kid friendly
  },
  input: {
    borderWidth: 2,
    borderColor: '#FF9800', // Orange border
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 4,
  },
  characterImage: {
    width: '32%',
    height: 180,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emojiButton: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 10,
    margin: 6,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: '#B2EBF2',
  },
  selectedEmojiButton: {
    backgroundColor: '#80DEEA',
    borderColor: '#26C6DA',
    transform: [{ scale: 1.05 }],
  },
  emojiText: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 12,
    color: '#424242',
  },
  examples: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#673AB7',
  },
  examplesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  example: {
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 8,
    color: '#424242',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50', // Green
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD', // Gray
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

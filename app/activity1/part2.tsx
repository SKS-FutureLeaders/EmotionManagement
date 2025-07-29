import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

// Get screen width for responsive sizing
const screenWidth = Dimensions.get('window').width;

export default function Part2() {
  const router = useRouter();
  const [angerLook, setAngerLook] = useState('');
  const [angerSmell, setAngerSmell] = useState('');
  const [angerSound, setAngerSound] = useState('');
  const [angerFeel, setAngerFeel] = useState('');

  const isFormComplete = () => {
    return angerLook && angerSmell && angerSound && angerFeel;
  };

  // Calculate progress for progress bar
  const calculateProgress = () => {
    let completedFields = 0;
    if (angerLook) completedFields++;
    if (angerSmell) completedFields++;
    if (angerSound) completedFields++;
    if (angerFeel) completedFields++;
    return (completedFields / 4) * 100;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header with Progress */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MY ANGER DETECTIVE WORK! 🕵️‍♂️</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${calculateProgress()}%` }]} />
          <View style={styles.progressStepsContainer}>
            <View style={[styles.progressStep, angerLook ? styles.completedStep : {}]}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={[styles.progressStep, angerSmell ? styles.completedStep : {}]}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={[styles.progressStep, angerSound ? styles.completedStep : {}]}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <View style={[styles.progressStep, angerFeel ? styles.completedStep : {}]}>
              <Text style={styles.stepText}>4</Text>
            </View>
          </View>
          <Text style={styles.progressText}>{Math.round(calculateProgress())}% Done!</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6590/6590956.png' }} 
                style={styles.cardIcon} 
              />
              <Text style={styles.question}>What does your Anger LOOK like?</Text>
            </View>
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/cute-angry-red-monster-cartoon-character_1308-108633.jpg' }}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
            <Text style={styles.examples}>Some super cool ideas:</Text>
            <Text style={styles.example}>• A big storm cloud with BOOM lightning ⛈️</Text>
            <Text style={styles.example}>• A shaken up soda bottle going POP! 🥤</Text>
            <Text style={styles.example}>• A fire-breathing dragon 🐉</Text>
            <Text style={styles.example}>• A volcano going KA-BOOM! 🌋</Text>
            <TextInput
              style={styles.input}
              value={angerLook}
              onChangeText={setAngerLook}
              placeholder="Draw with words! What does your anger look like?"
              multiline={true}
              placeholderTextColor="#8babc7"
              numberOfLines={3}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3518/3518058.png' }} 
                style={styles.cardIcon} 
              />
              <Text style={styles.question}>What does your Anger SMELL like?</Text>
            </View>
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/cute-bad-cat-holding-nose-because-bad-smell-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated_138676-5418.jpg' }}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
            <Text style={styles.examples}>Try these funny ideas:</Text>
            <Text style={styles.example}>• Burnt toast going YUCK! 🍞</Text>
            <Text style={styles.example}>• Super STINKY gym socks 🧦</Text>
            <Text style={styles.example}>• Smoky campfire making you cough 🔥</Text>
            <Text style={styles.example}>• Smelly broccoli - EWWW! 🥦</Text>
            <TextInput
              style={styles.input}
              value={angerSmell}
              onChangeText={setAngerSmell}
              placeholder="Use your nose! What smells like your anger?"
              multiline={true}
              placeholderTextColor="#8babc7"
              numberOfLines={3}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3992/3992462.png' }} 
                style={styles.cardIcon} 
              />
              <Text style={styles.question}>What does your Anger SOUND like?</Text>
            </View>
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/cute-lion-roaring-cartoon-vector-icon-illustration_138676-2463.jpg' }}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
            <Text style={styles.examples}>Listen to these noisy examples:</Text>
            <Text style={styles.example}>• A lion going ROOOAAAR! 🦁</Text>
            <Text style={styles.example}>• Drums going BOOM BOOM BOOM! 🥁</Text>
            <Text style={styles.example}>• A balloon making a big POP! 🎈</Text>
            <Text style={styles.example}>• Thunder going KA-CRASH! ⚡</Text>
            <TextInput
              style={styles.input}
              value={angerSound}
              onChangeText={setAngerSound}
              placeholder="Open your ears! What sounds like your anger?"
              multiline={true}
              placeholderTextColor="#8babc7"
              numberOfLines={3}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2961/2961957.png' }} 
                style={styles.cardIcon} 
              />
              <Text style={styles.question}>What does your Anger FEEL like?</Text>
            </View>
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/cute-cat-squeezing-stress-ball-cartoon-icon-illustration_138676-2517.jpg' }}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
            <Text style={styles.examples}>Touch these feelings:</Text>
            <Text style={styles.example}>• HOT like touching a warm cookie 🔥</Text>
            <Text style={styles.example}>• BUMPY like riding over rocks 🚵</Text>
            <Text style={styles.example}>• TIGHT like squeezing a squishy toy ✊</Text>
            <Text style={styles.example}>• JUMPY like popcorn going POP POP! 🍿</Text>
            <TextInput
              style={styles.input}
              value={angerFeel}
              onChangeText={setAngerFeel}
              placeholder="Use your hands! How does your anger feel?"
              multiline={true}
              placeholderTextColor="#8babc7"
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.nextButton, 
              !isFormComplete() && styles.nextButtonDisabled
            ]}
            onPress={() => router.push('/activity1/part3')}
            disabled={!isFormComplete()}
          >
            {isFormComplete() ? (
              <View style={styles.buttonContent}>
                <Text style={styles.nextButtonText}>Next Adventure!</Text>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6387/6387888.png' }}
                  style={styles.buttonIcon}
                />
              </View>
            ) : (
              <Text style={styles.nextButtonText}>Fill in all boxes first! ✏️</Text>
            )}
          </TouchableOpacity>

          {/* Extra space at bottom for scrolling past fixed header */}
          <View style={styles.bottomPadding}></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 12,
    alignItems: 'center',
    zIndex: 1000,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    width: '95%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    marginBottom: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5cd65c',
    borderRadius: 15,
  },
  progressStepsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    top: 3,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  completedStep: {
    backgroundColor: '#ffeb3b',
    borderColor: '#ff9800',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    bottom: 0,
    lineHeight: 30,
  },
  scrollView: {
    backgroundColor: '#f0f9ff',
  },
  container: {
    padding: 16,
    alignItems: 'center',
    paddingTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#dceafd',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a6fa5',
    flex: 1,
  },
  illustrationImage: {
    width: screenWidth * 0.7,
    height: 120,
    alignSelf: 'center',
    marginBottom: 15,
  },
  examples: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 10,
    color: '#5d8aa8',
  },
  example: {
    fontSize: 17,
    marginBottom: 8,
    paddingLeft: 10,
    color: '#5d8aa8',
  },
  input: {
    borderWidth: 3,
    borderColor: '#b8dcff',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 18,
    backgroundColor: '#f8fbff',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#ff7f50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 15,
    marginBottom: 30,
    width: '90%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff6347',
  },
  nextButtonDisabled: {
    backgroundColor: '#b8c5d6',
    borderColor: '#a9b9c9',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  bottomPadding: {
    height: 50,
  }
});

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Animated,
  Dimensions,
  useWindowDimensions,
  SafeAreaView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const places = [
  { name: "School", image: require("../../assets/images/school.png"), options: ["Bullying", "Scribbling or doodling", "Want to hurt others", "Muttering under your breath", "Ignoring people"] },
  { name: "Home", image: require("../../assets/images/home.png"), options: ["Yelling", "Throwing objects", "Slam doors", "Silent treatment", "Crying"] },
  { name: "School Bus", image: require("../../assets/images/school_bus.jpg"), options: ["Teasing others", "Pushing", "Shouting", "Ignoring people", "Not talking"] },
  { name: "Car", image: require("../../assets/images/car.png"), options: ["Complaining", "Arguing", "Crying", "Refusing to talk", "Kicking seat"] },
  { name: "Playground", image: require("../../assets/images/playground.png"), options: ["Fighting", "Breaking things", "Shouting", "Storming off", "Ignoring others"] },
  { name: "Shop", image: require("../../assets/images/shop.png"), options: ["Throwing tantrums", "Crying loudly", "Demanding things", "Complaining", "Not listening"] }
];

const GettingToKnowAnger = () => {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768; // Breakpoint for mobile devices
  
  const [activePlace, setActivePlace] = useState(0);
  type PlaceOption = string;
  type PlaceName = string;
  
  interface SelectedOptionsState {
    [placeName: string]: PlaceOption[];
  }

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsState>({});
  const [animation] = useState(new Animated.Value(1));
  const [buttonScale] = useState(new Animated.Value(1));
  const [completedPlaces, setCompletedPlaces] = useState<number[]>([]);
  const [starAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Add animation when changing places
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activePlace]);

  const toggleOption = (option: PlaceOption): void => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Spin the star when selecting
    Animated.timing(starAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      starAnimation.setValue(0);
    });

    setSelectedOptions((prev: SelectedOptionsState) => {
      const currentOptions: PlaceOption[] = prev[places[activePlace].name] || [];
      const newOptions: PlaceOption[] = currentOptions.includes(option)
        ? currentOptions.filter((o: PlaceOption) => o !== option)
        : [...currentOptions, option];

      return { ...prev, [places[activePlace].name]: newOptions };
    });
  };

  // Fix the progress calculation to include current place
  const handleNext = async () => {
    // Always add current place to completed
    if (!completedPlaces.includes(activePlace)) {
      setCompletedPlaces([...completedPlaces, activePlace]);
    }

    if (activePlace < places.length - 1) {
      setActivePlace(activePlace + 1);
    } else {
      // Show celebration animation
      showCelebration();
      setTimeout(async () => {
        await submitAnswers();
      }, 1500);
    }
  };

  const showCelebration = () => {
    // Play a celebration animation when finished
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const API_URL = Platform.OS === "web" 
        ? "http://localhost:5000" 
        : "http://192.168.136.40:5000";
  const submitAnswers = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Retrieve token
      if (!token) {
        Alert.alert("Error", "Authentication required. Please log in.");
        return;
      }

      const response = await fetch(`${API_URL}/childauth/answers`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Include token
        },
        body: JSON.stringify({
          activityName: "GettingToKnowAnger",
          answers: transformAnswers(selectedOptions),
          dateSubmitted: new Date().toISOString(),
        }),
    });

    const result = await response.json();
      if (result.success) {
        Alert.alert("Success", "Your answers have been submitted!");
        setSelectedOptions({}); // Clear state after submission
        setActivePlace(0);
      } else {
        Alert.alert("Error", result.success.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Alert.alert("Error", "Could not submit answers. Please try again.");
    }
  };

  // Convert selectedOptions to match backend format (Map of Boolean values)
  interface FormattedAnswers {
    [place: string]: {
      [option: string]: boolean;
    };
  }

  const transformAnswers = (answers: SelectedOptionsState): FormattedAnswers => {
    let formattedAnswers: FormattedAnswers = {};
    for (const place in answers) {
      formattedAnswers[place] = {};
      answers[place].forEach((option: PlaceOption) => {
        formattedAnswers[place][option] = true;
      });
    }
    return formattedAnswers;
  };

  // Calculate progress including current active place
  const getProgressPercentage = () => {
    // Include current place in calculation
    const uniqueCompletedPlaces = new Set([...completedPlaces, activePlace]);
    return Math.round((uniqueCompletedPlaces.size / places.length) * 100);
  };

  // Generate stars for celebration
  const renderStars = () => {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: [{
            rotate: starAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg']
            })
          }]
        }}
      >
        <Text style={styles.star}>⭐</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          {renderStars()}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${getProgressPercentage()}%` }]} />
              <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
            </View>
            <View style={styles.emotionTracker}>
              {getProgressPercentage() < 50 ? 
                <Text style={styles.bigEmoji}>🤔</Text> : 
                getProgressPercentage() < 100 ?
                <Text style={styles.bigEmoji}>😊</Text> :
                <Text style={styles.bigEmoji}>🎉</Text>
              }
            </View>
          </View>

          <Text style={styles.mainTitle}>Where do you get angry?</Text>

          {/* Places as horizontal scrollable list */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.placesScrollView}
            contentContainerStyle={styles.placesContainer}
          >
            {places.map((place, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.placeButton, 
                  activePlace === index && styles.activePlace,
                  completedPlaces.includes(index) && styles.completedPlace
                ]}
                onPress={() => setActivePlace(index)}
              >
                <Image source={place.image} style={styles.placeImage} />
                <Text style={styles.placeText}>{place.name}</Text>
                {completedPlaces.includes(index) && (
                  <View style={styles.checkmark}>
                    <Text style={{ fontSize: 16, color: 'white' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected place and options */}
          <Animated.View 
            style={[
              styles.optionsPanel,
              { transform: [{ scale: animation }] }
            ]}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.subtitle}>{places[activePlace].name}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {places[activePlace].options.map((option, index) => (
                <Animated.View 
                  key={index} 
                  style={{ 
                    transform: selectedOptions[places[activePlace].name]?.includes(option) ? 
                      [{ scale: buttonScale }] : [{ scale: 1 }],
                    width: '100%'
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionButton, 
                      selectedOptions[places[activePlace].name]?.includes(option) && styles.selectedOption
                    ]}
                    onPress={() => toggleOption(option)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionCheckbox}>
                      {selectedOptions[places[activePlace].name]?.includes(option) ? (
                        <Text style={styles.checkboxText}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={[
                      styles.optionText,
                      selectedOptions[places[activePlace].name]?.includes(option) && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                    {selectedOptions[places[activePlace].name]?.includes(option) && (
                      <Text style={styles.selectedEmoji}>👍</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.nextButtonText}>
                  {activePlace < places.length - 1 ? "Next Place!" : "Finish!"}
                </Text>
                <Text style={styles.buttonEmoji}>
                  {activePlace < places.length - 1 ? "👉" : "🎯"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  container: { 
    flexGrow: 1, 
    flexDirection: "column", 
    padding: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: '#ff9800',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 25,
    width: '75%',
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emotionTracker: {
    width: '20%',
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 36,
  },
  placesScrollView: {
    marginBottom: 15,
  },
  placesContainer: {
    paddingVertical: 10,
  },
  placeButton: { 
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    marginHorizontal: 8,
    backgroundColor: "#fff6e5",
    borderWidth: 2,
    borderColor: '#ffcc80',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: 'relative',
    width: 110,
  },
  activePlace: { 
    backgroundColor: "#ffe0b2", 
    borderColor: '#ff9800',
    borderWidth: 3,
    transform: [{scale: 1.05}]
  },
  completedPlace: {
    borderTopWidth: 8,
    borderTopColor: '#4CAF50',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  placeImage: { 
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffcc80',
  },
  placeText: { 
    fontSize: 14,
    fontWeight: "bold",
    textAlign: 'center',
    color: '#5d4037',
  },
  optionsPanel: { 
    width: '100%',
    padding: 20,
    backgroundColor: "white", 
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    overflow: 'hidden'
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#f5f5f5',
  },
  subtitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color: "#ff9800",
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: "#f5f5f5", 
    borderRadius: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionCheckbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#ff9800',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxText: {
    color: '#ff9800',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectedOption: { 
    backgroundColor: "#fff3e0", 
    borderColor: "#ff9800", 
    borderWidth: 3,
    transform: [{ scale: 1.02 }]
  },
  optionText: { 
    fontSize: 18,
    flex: 1,
    color: '#5d4037',
  },
  selectedOptionText: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  selectedEmoji: {
    fontSize: 24,
    marginLeft: 5,
  },
  nextButton: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    backgroundColor: "#ff9800",
    borderRadius: 25, 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#ffb74d',
  },
  nextButtonText: { 
    color: "white", 
    fontWeight: "bold",
    fontSize: 22,
    marginRight: 10,
  },
  buttonEmoji: {
    fontSize: 24,
  },
  star: {
    fontSize: 40,
  }
});

export default GettingToKnowAnger;

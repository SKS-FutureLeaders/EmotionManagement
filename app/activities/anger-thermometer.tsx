import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  ScrollView, 
  Image,
  Dimensions,
  useWindowDimensions 
} from "react-native";
import scenarios from "../../constants/data";
import brainCalm from "../../assets/images/brain-calm.png";
import brainAnnoyed from "../../assets/images/brain-annoyed.png";
import brainFrustrated from "../../assets/images/brain-frustrated.png";
import brainAngry from "../../assets/images/brain-angry.png";
import brainEnraged from "../../assets/images/brain-enraged.png";

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const levels = ["Calm", "Annoyed", "Frustrated", "Angry", "Enraged"];
const colors = ["#4CAF50", "#FFEB3B", "#FF9800", "#F44336", "#B71C1C"];
const emoji = ["😊", "😐", "😒", "😠", "🤬"];

// Brain image paths would need to be replaced with your actual image assets
const brainImages: Record<string, any> = {
  Calm: brainCalm,
  Annoyed: brainAnnoyed,
  Frustrated: brainFrustrated,
  Angry: brainAngry,
  Enraged: brainEnraged
};

const AngerThermometer = () => {
  // ...existing state and animations code remains the same...
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768; // Breakpoint for mobile devices
  
  const [activeLevel, setActiveLevel] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean[] }>({
    Calm: [],
    Annoyed: [],
    Frustrated: [],
    Angry: [],
    Enraged: [],
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Replace single fill animation with array of fill animations for each level
  const levelFillAnims = useRef(levels.map(() => new Animated.Value(0))).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const brainFadeAnims = useRef(levels.map(() => new Animated.Value(0))).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current; 
  const bobAnim = useRef(new Animated.Value(0)).current;

  // Update fill level when active level changes
  useEffect(() => {
    // Animate each level segment filling
    Animated.parallel(
      levelFillAnims.map((anim, index) => {
        // Only fill levels up to the activeLevel
        return Animated.timing(anim, {
          toValue: index <= activeLevel ? 1 : 0,
          duration: 1500, // Slightly slower for more visible wave effect
          useNativeDriver: false,
        });
      })
    ).start();
    
    // Create wave effect in the liquid - multiple concurrent animations
    // Primary wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
    
    // Secondary wave animation (different timing for more natural look)
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: false,
        }),
      ])
    ).start();
    
    // Bobbing animation for top of liquid
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: false,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1300,
          useNativeDriver: false,
        }),
      ])
    ).start();
    
    // Fade in brain images for current and previous levels
    Animated.parallel(
      brainFadeAnims.map((anim, index) => {
        // Make current and previous levels visible
        return Animated.timing(anim, {
          toValue: index <= activeLevel ? (index === activeLevel ? 1 : 0.8) : 0,
          duration: 500,
          useNativeDriver: false,
        });
      })
    ).start();
  }, [activeLevel, levelFillAnims, waveAnim, waveAnim2, bobAnim, brainFadeAnims]);
  
  // Create pulsing effect for the active level
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Create bounce animation for selections
  const triggerBounce = () => {
    bounceAnim.setValue(0);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const handleNextLevel = () => {
    if (activeLevel < levels.length - 1) {
      setActiveLevel(activeLevel + 1);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start(() => fadeAnim.setValue(0));
    }
  };

  const handlePreviousLevel = () => {
    if (activeLevel > 0) {
      setActiveLevel(activeLevel - 1);
    }
  };

  const toggleOption = (index: number) => {
    const currentLevel = levels[activeLevel];
    const newSelectedOptions = { ...selectedOptions };
    
    // Initialize the array if it doesn't exist
    if (!newSelectedOptions[currentLevel]) {
      newSelectedOptions[currentLevel] = [];
    }
    
    // Toggle the selection
    newSelectedOptions[currentLevel][index] = !newSelectedOptions[currentLevel][index];
    setSelectedOptions(newSelectedOptions);
    
    // Trigger bounce animation
    triggerBounce();
  };

  const API_URL = Platform.OS === "web" 
    ? "http://localhost:5000" 
    : "http://192.168.136.40:5000";

  const handleSubmit = async () => {
    try {
        const activityName = "anger-thermometer";

        // Convert boolean array to object format { 0: true, 1: false, ... }
        const formattedAnswers: { [key: string]: { [index: number]: boolean } } = {};
        Object.keys(selectedOptions).forEach((key) => {
            formattedAnswers[key] = selectedOptions[key].reduce<{ [index: number]: boolean }>((acc, val, index) => {
                acc[index] = val;
                return acc;
            }, {});
        });

        const dateSubmitted = new Date().toISOString().split("T")[0];

        // Retrieve token from localStorage or AsyncStorage (React Native)
        // const token = localStorage.getItem("token"); // If using AsyncStorage, use AsyncStorage.getItem("token")
        let token;
        if (Platform.OS === "web") {
            token = localStorage.getItem("token");
        } else {
            // Use AsyncStorage for React Native
            token = await AsyncStorage.getItem("token");
        }

        if (!token) {
            alert("Authentication token missing. Please log in again.");
            return;
        }

        const response = await fetch(`${API_URL}/childauth/answers`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Include token
            },
            body: JSON.stringify({
                activityName, // Fixed key to match backend
                answers: formattedAnswers,
                dateSubmitted,
            }),
        });

        const result = await response.json();
        if (result.success) {
          alert("Answers submitted successfully!");

          // ✅ Reset state after successful submission
          setSelectedOptions({
              Calm: [],
              Annoyed: [],
              Frustrated: [],
              Angry: [],
              Enraged: [],
          });
          setActiveLevel(0); // Reset to first level
      } else {  
          alert(`Failed to submit answers: ${result.message}`);
      }
    } catch (error) {
        console.error("Error submitting answers:", error);
        alert("Error submitting answers.");
    }
};

  // Wave effects calculations remain the same
  const waveOffset = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-3, 2, -3], 
  });
  
  const waveOffset2 = waveAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [2, -2, 2],
  });
  
  const bobOffset = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const currentLevelScenarios = scenarios[levels[activeLevel]];
  const isLastLevel = activeLevel === levels.length - 1;
  const currentEmoji = emoji[activeLevel];

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
      <View style={styles.container}>
        <Text style={styles.title}>
          My Feelings Thermometer
          <Text style={styles.titleEmoji}>🌡️</Text>
        </Text>
        
        <View style={[
          styles.mainContent, 
          isSmallScreen && styles.mainContentMobile
        ]}>
          <View style={[
            styles.thermometerContainer,
            isSmallScreen && styles.thermometerContainerMobile
          ]}>
            {/* Empty thermometer tube */}
            <View style={styles.thermometerTube}>
              {/* Liquid segments code remains the same */}
              {levels.map((level, index) => {
                if (index === 0) return null;
                
                const segmentHeight = levelFillAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${100 / (levels.length - 1)}%`]
                });
                
                const bottomPositionPercent = (index - 1) * (100 / (levels.length - 1));
                const isActiveSegment = index === activeLevel;
                
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.liquidSegment,
                      {
                        height: segmentHeight,
                        bottom: `${bottomPositionPercent}%`,
                        backgroundColor: colors[index],
                        transform: isActiveSegment ? 
                          [
                            { translateY: waveOffset },
                            { translateX: waveOffset2 }
                          ] : 
                          [{ translateX: waveOffset2 }]
                      }
                    ]}
                  >
                    {/* Wave effects code remains the same */}
                    {isActiveSegment && (
                      <>
                        <Animated.View 
                          style={[
                            styles.liquidWave,
                            {
                              transform: [{ translateY: bobOffset }]
                            }
                          ]}
                        />
                        
                        <View style={styles.wavesContainer}>
                          {[...Array(3)].map((_, i) => (
                            <Animated.View
                              key={i}
                              style={[
                                styles.liquidRipple,
                                {
                                  left: `${25 + i * 20}%`,
                                  transform: [
                                    { translateY: Animated.multiply(bobOffset, 1.2 - i * 0.3) }
                                  ]
                                }
                              ]}
                            />
                          ))}
                        </View>
                      </>
                    )}
                  </Animated.View>
                );
              })}
              
              {/* Level markers remain the same */}
              <View style={styles.levelMarkers}>
                {levels.slice(1).reverse().map((_, index) => {
                  const actualIndex = levels.length - 1 - index;
                  return (
                    <View 
                      key={actualIndex} 
                      style={[
                        styles.levelMarker,
                        { height: `${100 / (levels.length - 1)}%` }
                      ]}
                    />
                  );
                })}
              </View>
              
              {/* Brain images with fade animations */}
              {levels.slice(1).map((level, index) => {
                const actualIndex = index + 1;
                
                return (
                  <Animated.View
                    key={actualIndex}
                    style={[
                      styles.brainImageContainer,
                      { 
                        bottom: `${(actualIndex - 1) * (100 / (levels.length - 1)) + (100 / (levels.length - 1) / 2) - 10}%`,
                        opacity: brainFadeAnims[actualIndex],
                        transform: [
                          { scale: actualIndex === activeLevel ? pulseAnim : 1 }
                        ]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.levelButton}
                      onPress={() => setActiveLevel(actualIndex)}
                    >
                      <Image 
                        source={brainImages[level]} 
                        style={[
                          styles.brainImage,
                          actualIndex === activeLevel && styles.activeBrainImage
                        ]} 
                        resizeMode="contain"
                      />
                      <Text style={[
                        styles.levelEmoji,
                        actualIndex === activeLevel && styles.activeLevelEmoji
                      ]}>
                        {emoji[actualIndex]}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
            
            {/* Calm bulb remains the same */}
            <View style={styles.bulbContainer}>
              <Animated.View
                style={[
                  styles.calmBulb,
                  {
                    backgroundColor: activeLevel >= 0 ? colors[0] : '#e0e0e0',
                    opacity: levelFillAnims[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                    transform: [
                      { scale: activeLevel === 0 ? pulseAnim : 1 }
                    ]
                  }
                ]}
              >
                {activeLevel === 0 && (
                  <Animated.View 
                    style={[
                      styles.bulbWave, 
                      {
                        transform: [
                          { translateY: waveOffset },
                          { translateX: waveOffset2 }
                        ]
                      }
                    ]} 
                  />
                )}
                
                <TouchableOpacity
                  style={styles.levelButton}
                  onPress={() => setActiveLevel(0)}
                >
                  <Animated.View style={{
                    opacity: brainFadeAnims[0],
                    alignItems: 'center'
                  }}>
                    <Image 
                      source={brainImages.Calm} 
                      style={[
                        styles.brainImageBulb,
                        activeLevel === 0 && styles.activeBrainImage
                      ]} 
                      resizeMode="contain"
                    />
                    <Text style={[
                      styles.levelEmoji,
                      activeLevel === 0 && styles.activeLevelEmoji
                    ]}>
                      {emoji[0]}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Options section - no longer in a ScrollView */}
          <View style={[
            styles.optionsContainer,
            isSmallScreen && styles.optionsContainerMobile
          ]}>
            <View style={styles.headerContainer}>
              <Text style={styles.sectionTitle}>
                {levels[activeLevel]} 
                <Text style={styles.emojiText}> {currentEmoji}</Text>
              </Text>
              <Text style={styles.promptText}>When do you feel?</Text>
            </View>
            
            {currentLevelScenarios.map((scenario, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.optionButtonContainer,
                  {
                    transform: [
                      { scale: selectedOptions[levels[activeLevel]][index] ? bounceAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.1, 1]
                        }) : 1 
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,    
                    selectedOptions[levels[activeLevel]][index] && styles.selectedOption
                  ]}
                  onPress={() => toggleOption(index)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOptions[levels[activeLevel]][index] && styles.selectedOptionText
                  ]}>
                    {selectedOptions[levels[activeLevel]][index] ? "✓ " : ""}
                    {scenario}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <View style={styles.navigationButtons}>
              {activeLevel > 0 && (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handlePreviousLevel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>← Go Back</Text>
                </TouchableOpacity>
              )}
              
              {!isLastLevel ? (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleNextLevel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Next Level →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleSubmit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>All Done! ✓</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {activeLevel + 1} of {levels.length} levels
              </Text>
              <View style={styles.progressBar}>
                {levels.map((_, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.progressDot,
                      { backgroundColor: index <= activeLevel ? colors[index] : '#ddd' }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f6ff",
  },
  container: { 
    flexGrow: 1,
    flexDirection: "column",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20,
    textAlign: "center",
    color: "#5B3E96",
    fontFamily: "Arial Rounded MT Bold"
  },
  titleEmoji: {
    fontSize: 32,
    marginLeft: 10
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "flex-start", 
    justifyContent: "space-between",
  },
  mainContentMobile: {
    flexDirection: "column",
    alignItems: "center",
  },
  thermometerContainer: {
    width: 140, // Smaller width
    height: 400, // Smaller height
    marginRight: 20,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative"
  },
  thermometerContainerMobile: {
    width: '100%',
    height: 280, // Even smaller on mobile
    marginRight: 0,
    marginBottom: 30,
    transform: [{ scale: 0.65 }], // Scale down more for mobile
  },
  thermometerTube: {
    width: 70, // Smaller tube width
    height: 320, // Smaller tube height
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 50,
    borderWidth: 5,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    position: "relative"
  },
  // All other styles for thermometer elements remain the same
  liquidSegment: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  liquidWave: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
  },
  levelMarkers: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "space-between",
    flexDirection: "column",
  },
  levelMarker: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.4)"
  },
  bulbContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center"
  },
  calmBulb: {
    width: 90, // Smaller bulb
    height: 90, // Smaller bulb
    borderRadius: 45,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  brainImageContainer: {
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  levelButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  brainImage: {
    width: 50, // Smaller brain image
    height: 40, // Smaller brain image
    margin: 3,
  },
  activeBrainImage: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  brainImageBulb: {
    width: 50, // Smaller brain in bulb
    height: 50 // Smaller brain in bulb
  },
  levelEmoji: {
    fontSize: 16,
    marginTop: 2
  },
  activeLevelEmoji: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionsContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8"
  },
  optionsContainerMobile: {
    width: '100%',
    marginTop: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10
  },
  sectionTitle: {
    fontSize: 24, // Slightly smaller
    fontWeight: "bold",
    color: "#333",
    textAlign: "center"
  },
  emojiText: {
    fontSize: 26 // Slightly smaller
  },
  promptText: {
    fontSize: 16, // Slightly smaller
    color: "#666",
    marginTop: 5
  },
  optionButtonContainer: {
    marginBottom: 12 // Slightly reduced spacing
  },
  optionButton: {
    backgroundColor: "#f7f7f7",
    padding: 15, // Slightly reduced padding
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    minHeight: 60, // Slightly reduced height
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
    shadowColor: "#1976D2",
    shadowOpacity: 0.2
  },
  optionText: {
    fontSize: 16, // Slightly smaller font
    color: "#444",
    fontFamily: "Arial",
  },
  selectedOptionText: {
    color: "#0d47a1",
    fontWeight: "bold"
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 15,
    width: '100%',
  },
  button: {
    padding: 14, // Slightly reduced padding
    backgroundColor: "#7E57C2",
    borderRadius: 12,
    minWidth: 110, // Slightly reduced min width
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    flex: 0.48,
  },
  submitButton: {
    padding: 14, // Slightly reduced padding
    backgroundColor: "#66BB6A",
    borderRadius: 12,
    minWidth: 110, // Slightly reduced min width
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    flex: 0.48,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold"
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "center"
  },
  progressDot: {
    width: 10, // Slightly smaller dots
    height: 10, // Slightly smaller dots
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: "#ddd",
    borderWidth: 1,
    borderColor: "#fff"
  },
  wavesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    overflow: "hidden",
  },
  liquidRipple: {
    position: "absolute",
    top: -6,
    width: 20,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 10,
  },
  bulbWave: {
    position: "absolute",
    top: 30, // Adjusted for smaller bulb
    left: 15, // Adjusted for smaller bulb
    right: 15, // Adjusted for smaller bulb
    height: 30, // Adjusted for smaller bulb
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
  },
});

export default AngerThermometer;
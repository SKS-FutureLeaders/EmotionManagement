import React, { useRef, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  Animated,
  Easing,
  Dimensions,
  Platform,
  Modal,
  ImageBackground
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

// Import your activity images
import angerThermometerImg from "../assets/images/anger-thermometer.avif";
import angerCartoon from "../assets/images/anger-cartoon.jpg";
import angryBird from "../assets/images/angry-bird.jpg";
import allEmotions from "../assets/images/all_emotions.png"
import Science from "../assets/images/science.jpg";

type ActivityCardProps = {
  title: string;
  description: string;
  image: any;
  routePath: string;
  index: number;
  iconName?: string;
  bgColor?: string;
};

const ActivityCard = ({ title, description, image, routePath, index, iconName = "gamepad", bgColor = "#6A5ACD" }: ActivityCardProps) => {
  const router = useRouter();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Staggered entry animation
    Animated.spring(bounceAnim, {
      toValue: 1,
      delay: index * 150,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    // Scale animation on press - slowed down
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // @ts-ignore - Using the navigate function with string route
      router.push(routePath);
    });
  };

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateY: bounceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }
      ],
      opacity: bounceAnim
    }}>
      <TouchableOpacity style={styles.activityCard} onPress={handlePress}>
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.activityImage} resizeMode="contain" />
        </View>
        <View style={styles.activityContent}>
          <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
            <FontAwesome5 name={iconName} size={18} color="white" />
          </View>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activityDescription} numberOfLines={2}>
            {description}
          </Text>
          <View style={[styles.startButton, { backgroundColor: bgColor }]}>
            <Text style={styles.startButtonText}>Let's Play!</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mascot Guide component that provides tips and guidance
const MascotGuide = () => {
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  const mascotTips = [
    "Remember, it's okay to feel angry sometimes! What matters is how we handle it.",
    "Take deep breaths when you feel angry - it helps your body calm down.",
    "Talking about your feelings helps others understand you better.",
    "Everyone makes mistakes - what's important is learning from them!",
    "Being kind to others makes you feel good too!",
    "It's brave to ask for help when you need it.",
    "Your feelings are important, but so are other people's feelings.",
    "Counting to 10 when you're upset gives your brain time to think better.",
    "Every day is a chance to learn something new about your feelings!",
    "You're doing a great job learning about your emotions!"
  ];
  
  useEffect(() => {
    // Start floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Occasional excited bounce
    const bounceInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true
          }),
          Animated.timing(bounceAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true
          })
        ]).start();
      }
    }, 4000);
    
    // Occasional spin for fun
    const spinInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          spinAnim.setValue(0);
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(bounceInterval);
      clearInterval(spinInterval);
    };
  }, []);
  
  const handleMascotPress = () => {
    // Select a random tip
    const randomTip = mascotTips[Math.floor(Math.random() * mascotTips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);
    
    // Animated bounce effect on press
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };
  
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  return (
    <>
      <TouchableOpacity 
        style={styles.mascotContainer} 
        onPress={handleMascotPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [
              { scale: bounceAnim },
              { rotate: spin },
              { translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                })
              }
            ]
          }}
        >
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5961/5961196.png' }}
            style={styles.mascotImage} 
          />
          <View style={styles.mascotBadge}>
            <Text style={styles.mascotBadgeText}>?</Text>
          </View>
        </Animated.View>
        <Text style={styles.mascotName}>Leo the Lion</Text>
        <Text style={styles.mascotRole}>Your Guide</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showTip}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTip(false)}
      >
        <View style={styles.tipModalOverlay}>
          <View style={styles.tipModalContent}>
            <View style={styles.tipModalHeader}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5961/5961196.png' }}
                style={styles.tipModalMascot} 
              />
              <Text style={styles.tipModalTitle}>Leo Says:</Text>
            </View>
            
            <Text style={styles.tipModalText}>{currentTip}</Text>
            
            <TouchableOpacity
              style={styles.tipModalButton}
              onPress={() => setShowTip(false)}
            >
              <Text style={styles.tipModalButtonText}>Thanks Leo!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Component for Featured Journal Entry
const JournalFeature = () => {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing animation
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ]).start(pulseAnimation);
    };
    
    pulseAnimation();
    
    return () => {
      // Clean up animation
      pulseAnim.stopAnimation();
    };
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity 
        style={styles.journalFeatureCard}
        onPress={() => router.push('/activities/JournalEntryScreen')}
      >
        <View style={styles.journalFeatureContent}>
          <View style={styles.journalIconContainer}>
            <FontAwesome5 name="book" size={32} color="#FF9800" />
          </View>
          <View style={styles.journalTextContent}>
            <Text style={styles.journalFeatureTitle}>My Feelings Journal</Text>
            <Text style={styles.journalFeatureSubtitle}>Write about your day and how you feel!</Text>
            
            <View style={styles.journalButtonsContainer}>
              <View style={styles.journalEmotionPills}>
                <View style={[styles.emotionPill, { backgroundColor: '#FF5252' }]}>
                  <Text style={styles.emotionPillText}>😡 Angry</Text>
                </View>
                <View style={[styles.emotionPill, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.emotionPillText}>😄 Happy</Text>
                </View>
              </View>
              <View style={styles.journalButton}>
                <Text style={styles.journalButtonText}>Start Writing</Text>
                <FontAwesome5 name="pencil-alt" size={14} color="white" style={{marginLeft: 5}} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Decorative component for visual flair
type FloatingBubbleProps = {
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
};

const FloatingBubble = ({ x, y, size, delay, color }: FloatingBubbleProps) => {
  const position = useRef(new Animated.ValueXY({ x, y })).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(position, {
              toValue: { x: x + 15, y: y - 20 },
              duration: 2000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin)
            }),
            Animated.timing(position, {
              toValue: { x, y },
              duration: 2000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin)
            })
          ])
        )
      ])
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.floatingBubble, 
        { 
          width: size, 
          height: size, 
          borderRadius: size/2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX: position.x },
            { translateY: position.y }
          ]
        }
      ]} 
    />
  );
};

// Mood Tracker Prompt Component
const MoodPrompt = () => {
  const [mood, setMood] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);
  
  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
  };
  
  const moods = [
    { emoji: '😄', name: 'Happy' },
    { emoji: '😢', name: 'Sad' },
    { emoji: '😡', name: 'Angry' },
    { emoji: '😮', name: 'Surprised' }
  ];
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={styles.moodPromptTitle}>How do you feel today?</Text>
      <View style={styles.moodOptions}>
        {moods.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.moodOption,
              mood === item.name && styles.selectedMoodOption
            ]}
            onPress={() => handleMoodSelect(item.name)}
          >
            <Text style={styles.moodEmoji}>{item.emoji}</Text>
            <Text style={[
              styles.moodText,
              mood === item.name && styles.selectedMoodText
            ]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};
// Dynamic Mascot that moves around the screen and guides the user
const DynamicMascot = () => {
  const [position, setPosition] = useState({ x: width * 0.7, y: 180 });
  const [message, setMessage] = useState("G'day mate! I'm Kenny the Koala! Let me help you!");
  const [showMessage, setShowMessage] = useState(true);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const positionAnim = useRef(new Animated.ValueXY({ x: width * 0.7, y: 180 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Predefined positions and messages for the mascot to guide through
  const guidedTour = [
    { 
      x: width * 0.7, 
      y: 180, 
      message: "G'day! I'm Kenny the Koala! Let's explore our feelings together!", 
      delay: 1000,
      duration: 5000
    },
    { 
      x: width * 0.5, 
      y: 280, 
      message: "How are you feeling today? Take your time choosing - koalas never rush!", 
      delay: 7000,
      duration: 4000
    },
    { 
      x: width * 0.7, 
      y: 420, 
      message: "Writing in your journal is a peaceful way to understand your feelings!",
      delay: 12000,
      duration: 4000
    },
    { 
      x: width * 0.3,
      y: 590, 
      message: "These activities are great! I love the Anger Thermometer - it helps me calm down!",
      delay: 17000,
      duration: 5000
    },
    { 
      x: width * 0.65,
      y: 800, 
      message: "Look at all your achievements! You're as amazing as a eucalyptus tree!",
      delay: 23000,
      duration: 4000
    },
    { 
      routePath: "/activity1/part1",
      x: width * 0.5, 
      y: 380, 
      message: "Tap any activity to play! I'll be here relaxing if you need help!", 
      delay: 28000,
      duration: 4000
    }
  ];
  
  // Moving animation to next position
  type TourPoint = {
    x: number;
    y: number;
    message: string;
    delay: number;
    duration: number;
    routePath?: string;
  };

  interface Position {
    x: number;
    y: number;
  }

  const moveToNextPosition = (index: number): void => {
    if (index >= guidedTour.length) {
      setShowMessage(false);
      return;
    }
    
    const target: TourPoint = guidedTour[index];
    setCurrentTarget(index);
    setIsMoving(true);
    
    // Move the mascot
    Animated.sequence([
      // Scale down slightly before moving
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      }),
      
      // Move to the new position
      Animated.timing(positionAnim, {
        toValue: { x: target.x, y: target.y },
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }),
      
      // Scale back up at the destination
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setPosition({ x: target.x, y: target.y });
      setMessage(target.message);
      setShowMessage(true);
      setIsMoving(false);
      
      // Schedule next move
      setTimeout(() => {
        if (index < guidedTour.length - 1) {
          moveToNextPosition(index + 1);
        } else {
          // After completing the tour, just bounce occasionally
          startRandomBounces();
        }
      }, target.duration);
    });
  };
  
  // Start the tour after component mounts
  useEffect(() => {
    // Start the first message
    setTimeout(() => {
      moveToNextPosition(1);
    }, guidedTour[0].duration);
    
    // Start bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // After tour completes, do random bounces and pop up occasionally
  const startRandomBounces = () => {
    // Randomly show tips after the guided tour
    const randomPopupInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomTarget = Math.floor(Math.random() * guidedTour.length);
        setMessage(getRandomEncouragement());
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      }
    }, 8000);
    
    return () => clearInterval(randomPopupInterval);
  };
  
  // Random encouraging messages to display after tour
  const getRandomEncouragement = () => {
    const encouragements = [
      "Take your time, mate! No need to rush.",
      "The Anger Thermometer helps you cool down - just like my eucalyptus leaves!",
      "Koalas write in their journals when they're feeling stressed!",
      "It's okay to feel angry sometimes! Even koalas get cranky!",
      "Taking deep breaths is how koalas stay calm!",
      "You're doing great with your emotions, mate!",
      "Which activity looks most cuddly to try?",
      "I'm a bit sleepy now, but tap an activity when you're ready!",
      "Koalas are peaceful, but we understand big feelings too!",
      "Remember, listening to others shows you respect them!",
      "Sharing with friends makes everyone happier - just like koalas sharing a tree!",
      "Being honest, even when it's hard, shows how brave you are!",
      "Helping others is one of the most important things you can do!",
      "Everyone makes mistakes - what matters is that we learn from them!",
      "Saying 'please' and 'thank you' shows you care about others' feelings!",
      "Patience is important - just like koalas waiting for the perfect leaf!",
      "You can feel better by making someone else smile!",
      "Being different is what makes you special - just like every koala has unique spots on their nose!",
      "Try looking for the good things even when you're having a tough day!",
      "It's okay to ask for help when you need it - even koalas need help sometimes!",
      "Believing in yourself helps you try new things and grow!",
      "Taking care of our planet helps all animals and people live better!",
      "A kind word can change someone's whole day!"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };
  
  const handleMascotPress = () => {
    setShowMessage(!showMessage);
    
    // Animated bounce effect on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };
  
  return (
    <Animated.View
      style={[
        styles.dynamicMascotContainer,
        {
          transform: [
            { translateX: positionAnim.x },
            { translateY: positionAnim.y },
            { scale: scaleAnim },
            { translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10]
              })
            }
          ]
        }
      ]}
    >
      {showMessage && (
        <View style={styles.mascotSpeechBubble}>
          <Text style={styles.mascotSpeechText}>{message}</Text>
          <View style={styles.mascotSpeechArrow} />
        </View>
      )}
      
      <TouchableOpacity onPress={handleMascotPress} activeOpacity={0.8}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png' }}
          style={styles.dynamicMascotImage} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Koala Facts Component
const KoalaFact = () => {
  // Large collection of koala facts
  const koalaFacts = [
    "Koalas sleep up to 20 hours a day and spend the rest of their time eating eucalyptus leaves!",
    "Baby koalas are called joeys and are only the size of a jellybean when they're born!",
    "Koalas have special fingerprints similar to humans - they can even be confused with ours!",
    "Koalas have two thumbs on their front paws to help them grip branches better!",
    "A koala's diet is so tough to digest that they have a special extra-long digestive organ called a cecum!",
    "Koalas don't need to drink much water - they get most of their moisture from eucalyptus leaves!",
    "Koalas have thick fur that keeps them dry during rain and warm during cold nights!",
    "Koalas communicate with loud bellows that can be heard nearly a kilometer away!",
    "Koalas are marsupials, which means they carry their babies in pouches!",
    "Joey koalas stay in their mother's pouch for about 6-7 months!",
    "Koalas eat about 500 grams of eucalyptus leaves every day!",
    "There are over 600 varieties of eucalyptus trees, but koalas only eat from about 30 types!",
    "Koalas store leaves in their cheek pouches to eat later on!",
    "A group of koalas is called a colony!",
    "Koalas have strong claws to help them climb trees easily!",
    "Koalas live in Australia and nowhere else in the world naturally!"
  ];
  
  // Randomly select one fact to display
  const [selectedFact] = useState(koalaFacts[Math.floor(Math.random() * koalaFacts.length)]);
  
  return (
    <View style={styles.koalaFactContainer}>
      <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png' }}
        style={styles.koalaFactImage} 
      />
      <View style={styles.koalaFactTextContainer}>
        <Text style={styles.koalaFactTitle}>Did you know?</Text>
        <Text style={styles.koalaFactText}>{selectedFact}</Text>
      </View>
    </View>
  );
};

// Values of the Day Component
const ValuesOfTheDay = () => {
  const values = [
    { title: "Kindness", description: "Do something nice for someone today!" },
    { title: "Honesty", description: "Tell the truth, even when it's difficult." },
    { title: "Respect", description: "Listen when others are talking to you." },
    { title: "Responsibility", description: "Take care of your things and help with chores." },
    { title: "Patience", description: "Wait your turn and don't interrupt others." },
    { title: "Courage", description: "Try something that seems a bit scary today!" },
    { title: "Gratitude", description: "Say thank you for the good things in your life." },
    { title: "Empathy", description: "Try to understand how others are feeling." },
    { title: "Perseverance", description: "Keep trying even when things get tough!" },
    { title: "Generosity", description: "Share something with a friend or family member." },
    { title: "Self-control", description: "Take a deep breath before reacting when upset." },
    { title: "Forgiveness", description: "Let go of anger when someone makes a mistake." }
  ];
  
  // Randomly select one value to display
  const [selectedValue] = useState(values[Math.floor(Math.random() * values.length)]);
  
  return (
    <View style={styles.valueOfDayContainer}>
      <View style={styles.valueIconContainer}>
        <FontAwesome5 name="heart" size={28} color="#FF6B6B" />
      </View>
      <View style={styles.valueTextContainer}>
        <Text style={styles.valueTitle}>Today's Value: {selectedValue.title}</Text>
        <Text style={styles.valueDescription}>{selectedValue.description}</Text>
      </View>
    </View>
  );
};

const Dashboard = () => {
  const router = useRouter(); // Add this line at the beginning of the Dashboard component
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create floating animation for the header bubble - made faster
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1000, 
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000, 
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Create rotating animation for the header star
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [floatAnim, rotateAnim]);
  
  // List of activities with kid-friendly descriptions
  const activities = [
    {
      title: "Anger Thermometer",
      description: "How hot is your feeling today? Let's measure your mood on our magic thermometer!",
      image: angerThermometerImg,
      routePath: "activities/anger-thermometer",
      iconName: "thermometer-half",
      bgColor: "#FF5252"
    },
    {
      title: "Say Hi to your Anger",
      description: "Meet your anger buddy and learn how to become friends!",
      image: angerCartoon,
      routePath: "/activity1/part1",
      iconName: "comment-dots",
      bgColor: "#FF9800"
    },
    {
      title: "Getting to know your Anger",
      description: "Join the adventure to discover the secret powers of your feelings!",
      image: angryBird,
      routePath: "activities/activity2",
      iconName: "search",
      bgColor: "#673AB7"
    },
    {
      title: "Identify your emotions",
      description: "Discover your feelings!",
      image: allEmotions,
      routePath: "activities/activity6",
      iconName: "search",
      bgColor: "#673AB7"
    },
    {
      title: "What's Happening to Me?",
      description: "Understand the science behind anger",
      image: Science,
      routePath: "activities/activity5/Activity5",
      iconName: "search",
      bgColor: "#673AB7"
    },
    
  ];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <ImageBackground
      source={{ uri: 'https://img.freepik.com/free-vector/forest-landscape-with-eucalyptus-trees_107791-12947.jpg' }}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        {/* Decorative floating bubbles */}
        <FloatingBubble x={width*0.1} y={100} size={20} delay={200} color="#FFD700" />
        <FloatingBubble x={width*0.85} y={150} size={15} delay={800} color="#FF6B6B" />
        <FloatingBubble x={width*0.65} y={400} size={25} delay={1500} color="#4CAF50" />
        
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>My Emotion Adventures</Text>
            <Animated.View style={{
              transform: [{rotate: spin}],
              marginLeft: 10,
            }}>
              <FontAwesome5 name="star" size={24} color="#FFD700" />
            </Animated.View>
          </View>
          
          <Animated.View style={{
            transform: [{
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10]
              })
            }]
          }}>
            <View style={styles.speechBubble}>
              <Text style={styles.headerSubtitle}>Pick a fun game to play!</Text>
            </View>
          </Animated.View>
          
          <View style={styles.characterContainer}>
            <FontAwesome5 name="smile-beam" size={40} color="#FFD700" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Value of the Day */}
          <ValuesOfTheDay />
          
          {/* Mood check-in component */}
          <MoodPrompt />
          
          {/* Journal Feature */}
          <Text style={styles.sectionTitle}>Write Your Feelings 📝</Text>
          <JournalFeature />
          
          {/* Activities Section */}
          <Text style={styles.sectionTitle}>Fun Games & Activities 🎮</Text>
          <View style={styles.activityGrid}>
            {activities.map((activity, index) => (
              <ActivityCard
                key={index}
                index={index}
                title={activity.title}
                description={activity.description}
                image={activity.image}
                routePath={activity.routePath}
                iconName={activity.iconName}
                bgColor={activity.bgColor}
              />
            ))}
          </View>
          
          {/* Achievements Banner */}
          <TouchableOpacity 
            style={styles.achievementsBanner}
            onPress={() => router.push('/gamification/streaks')}
          >
            <View style={styles.achievementIconContainer}>
              <FontAwesome5 name="trophy" size={28} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.achievementTitle}>Your Achievements</Text>
              <Text style={styles.achievementSubtitle}>See all the badges you've earned!</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={24} color="#6A5ACD" />
          </TouchableOpacity>

          {/* Content Library Banner - Add after achievements banner */}
          <TouchableOpacity 
            style={[styles.achievementsBanner, { marginTop: 0 }]}
            onPress={() => router.push('/content-library')}
          >
            <View style={[styles.achievementIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <FontAwesome5 name="book-reader" size={28} color="#2196F3" />
            </View>
            <View>
              <Text style={[styles.achievementTitle, { color: '#2196F3' }]}>Fun Learning Library</Text>
              <Text style={styles.achievementSubtitle}>Explore special content just for you!</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={24} color="#2196F3" />
          </TouchableOpacity>
          
          {/* Koala fun fact - randomized on each visit */}
          <KoalaFact />

          {/* Positive affirmation */}
          <View style={styles.affirmationContainer}>
            <Text style={styles.affirmationText}>"I can handle big feelings in healthy ways!"</Text>
          </View>
        </ScrollView>
        
        {/* Dynamic mascot guide that moves around the screen */}
        <DynamicMascot />
      </SafeAreaView>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(248, 240, 227, 0.75)", // Semi-transparent light brown background
  },
  header: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "rgba(106, 90, 205, 0.9)", // More transparent purple
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: "#8D6E63",
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6A5ACD",
    fontWeight: "bold",
  },
  characterContainer: {
    position: 'absolute',
    right: 20,
    bottom: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A4A7C",
    marginBottom: 15,
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: width * 0.44, // Adjusted for better sizing
    backgroundColor: "rgba(255, 255, 255, 0.9)", // More transparent white
    borderRadius: 20, // More rounded corners
    overflow: "hidden",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: "#8D6E63", // Brown border for koala theme
  },
  imageContainer: {
    width: "100%",
    height: 130,
    backgroundColor: "#F9F9FF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  activityImage: {
    width: "100%",
    height: "100%",
  },
  iconCircle: {
    position: 'absolute',
    top: -15,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activityContent: {
    padding: 15,
    paddingTop: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#4A4A7C",
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  activityDescription: {
    fontSize: 14,
    color: "#6B6B8D",
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  startButton: {
    backgroundColor: "#6A5ACD",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  // Journal Feature styles
  journalFeatureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: "#8D6E63", // Brown border for koala theme
  },
  journalFeatureContent: {
    flexDirection: 'row',
    padding: 15,
  },
  journalIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#FFF3E0",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  journalTextContent: {
    flex: 1,
  },
  journalFeatureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  journalFeatureSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  journalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalEmotionPills: {
    flexDirection: 'row',
  },
  emotionPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 6,
  },
  emotionPillText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  journalButton: {
    backgroundColor: "#FF9800",
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  journalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  // Floating bubble styles
  floatingBubble: {
    position: 'absolute',
    zIndex: 1,
  },
  // Mood prompt styles
  moodPromptContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: "#E0E0FF",
  },
  moodPromptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A7C",
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    width: 70,
  },
  selectedMoodOption: {
    backgroundColor: "#E0E0FF",
  },
  moodEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  moodText: {
    fontSize: 14,
    color: "#666",
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  selectedMoodText: {
    fontWeight: 'bold',
    color: "#4A4A7C",
  },
  // Achievement banner styles
  achievementsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: "#8D6E63", // Brown border for koala theme
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5FF",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#4A4A7C",
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  achievementSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  // Mascot styles
  mascotContainer: {
    display: 'none',
  },
  mascotImage: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  mascotName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  mascotRole: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  mascotBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  mascotBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  tipModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD54F',
  },
  tipModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipModalMascot: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  tipModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  tipModalText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  tipModalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  tipModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  // Dynamic mascot styles 
  dynamicMascotContainer: {
    position: 'absolute',
    zIndex: 999,
    alignItems: 'center',
  },
  dynamicMascotImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#8D6E63', // Brown color for koala theme
    backgroundColor: 'white',
  },
  mascotSpeechBubble: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    maxWidth: 220,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#8D6E63', // Brown color for koala theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  mascotSpeechArrow: {
    position: 'absolute',
    bottom: -10,
    left: '45%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8D6E63', // Brown color for koala theme
  },
  mascotSpeechText: {
    fontSize: 16,
    color: '#5D4037', // Darker brown for text
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    textAlign: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  koalaFactContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#8D6E63",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
  },
  koalaFactImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  koalaFactTextContainer: {
    flex: 1,
  },
  koalaFactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#8D6E63",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  koalaFactText: {
    fontSize: 14,
    color: "#5D4037",
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  // Value of the Day styles
  valueOfDayContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
  },
  valueIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0F0",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#D84315",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  valueDescription: {
    fontSize: 16,
    color: "#5D4037",
    fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
  },
  
  // Affirmation styles
  affirmationContainer: {
    backgroundColor: "rgba(171, 200, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    marginVertical: 15,
    borderWidth: 2,
    borderColor: "#6A5ACD",
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#303F9F",
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    fontStyle: 'italic',
  },
});

export default Dashboard;
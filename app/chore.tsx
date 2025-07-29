import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Plus, 
  X, 
  Filter,
  Award,
  AlertTriangle,
  Target,
  Heart,
  Sun,
  Cloud,
  Zap
} from 'react-native-feather';
import LottieView from 'lottie-react-native';
import plantAnimation from '../assets/animations/plant.json';
import brainAnimation from '../assets/animations/brain.json';

interface Chore {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  status: 'To Do' | 'Done' | 'Skipped';
  completedAt?: string;
  points: number;
}

interface Habit {
  id: string;
  title: string;
  description?: string;
  currentStreak: number;
  maxStreak: number;
  lastCompleted?: string;
  completedToday: boolean;
  points: number;
  dailyTarget: number;
  dailyProgress: number;
}

interface Goal {
  id: string;
  title: string;
  pointsTarget: number;
  currentPoints: number;
  milestones: {
    points: number;
    title: string;
    completed: boolean;
  }[];
}

interface Badge {
  id: string;
  title: string;
  image: string;
  unlocked: boolean;
  description: string;
}

interface Plant {
  id: string;
  createdAt: string;
  type: 'tree' | 'flower' | 'bush';
}

const KidTaskTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chores' | 'habits' | 'goals' | 'rewards' | 'forest'>('chores');
  const [chores, setChores] = useState<Chore[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [points, setPoints] = useState(0);
  const [choreFilter, setChoreFilter] = useState<'Today' | 'Overdue' | 'Completed' | 'All' | string>('Today');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'chore' | 'habit' | 'goal'>('chore');
  const [showAnimation, setShowAnimation] = useState(false);

  // Animation values
  const pointAnimation = new Animated.Value(1);
  const sunRotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Form States
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [newItemPoints, setNewItemPoints] = useState('5');
  const [newHabitTarget, setNewHabitTarget] = useState('1');
  const [newGoalTarget, setNewGoalTarget] = useState('100');
  const [newDescription, setNewDescription] = useState('');

  // Constants for animations
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    loadData();
    loadPresetBadges();
    startSunRotation();
  }, []);

  useEffect(() => {
    saveData();
  }, [chores, habits, goals, badges, points, plants]);

  const startSunRotation = () => {
    Animated.loop(
      Animated.timing(sunRotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  };

  const loadData = async () => {
    try {
      const choreData = await AsyncStorage.getItem('chores');
      const habitData = await AsyncStorage.getItem('habits');
      const goalData = await AsyncStorage.getItem('goals');
      const badgeData = await AsyncStorage.getItem('badges');
      const pointData = await AsyncStorage.getItem('points');
      const plantData = await AsyncStorage.getItem('plants');

      if (choreData) setChores(JSON.parse(choreData));
      if (habitData) setHabits(JSON.parse(habitData));
      if (goalData) setGoals(JSON.parse(goalData));
      if (badgeData) setBadges(JSON.parse(badgeData));
      if (pointData) setPoints(JSON.parse(pointData));
      if (plantData) setPlants(JSON.parse(plantData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('chores', JSON.stringify(chores));
      await AsyncStorage.setItem('habits', JSON.stringify(habits));
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
      await AsyncStorage.setItem('badges', JSON.stringify(badges));
      await AsyncStorage.setItem('points', JSON.stringify(points));
      await AsyncStorage.setItem('plants', JSON.stringify(plants));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadPresetBadges = () => {
    if (badges.length === 0) {
      setBadges([
        {
          id: '1',
          title: 'First Chore Complete',
          image: 'trophy1',
          unlocked: false,
          description: 'Complete your first chore'
        },
        {
          id: '2',
          title: 'Habit Master',
          image: 'medal1',
          unlocked: false,
          description: 'Maintain a 7-day streak on any habit'
        },
        {
          id: '3',
          title: 'Goal Achiever',
          image: 'star1',
          unlocked: false,
          description: 'Complete your first goal'
        },
        {
          id: '4',
          title: 'Super Helper',
          image: 'ribbon1',
          unlocked: false,
          description: 'Complete 10 chores'
        },
        {
          id: '5',
          title: 'Point Collector',
          image: 'badge1',
          unlocked: false,
          description: 'Earn 100 points'
        },
        {
          id: '6',
          title: 'Plant Grower',
          image: 'plant1',
          unlocked: false,
          description: 'Grow 5 plants in your forest'
        },
        {
          id: '7',
          title: 'Brain Builder',
          image: 'brain1',
          unlocked: false,
          description: 'Complete 20 habits to boost your brain'
        },
      ]);
    }
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) {
      Alert.alert('Please enter a title');
      return;
    }

    if (modalType === 'chore') {
      if (!newItemDueDate) {
        Alert.alert('Please select a due date');
        return;
      }

      const newChore: Chore = {
        id: Date.now().toString(),
        title: newItemTitle,
        category: newItemCategory || 'General',
        dueDate: newItemDueDate,
        status: 'To Do',
        points: parseInt(newItemPoints) || 5
      };
      setChores([...chores, newChore]);
    } else if (modalType === 'habit') {
      const newHabit: Habit = {
        id: Date.now().toString(),
        title: newItemTitle,
        description: newDescription,
        currentStreak: 0,
        maxStreak: 0,
        completedToday: false,
        points: parseInt(newItemPoints) || 2,
        dailyTarget: parseInt(newHabitTarget) || 1,
        dailyProgress: 0
      };
      setHabits([...habits, newHabit]);
    } else if (modalType === 'goal') {
      const targetPoints = parseInt(newGoalTarget) || 100;
      const milestones = [
        { points: Math.floor(targetPoints * 0.25), title: '25% Complete', completed: false },
        { points: Math.floor(targetPoints * 0.5), title: 'Halfway There!', completed: false },
        { points: Math.floor(targetPoints * 0.75), title: '75% Complete', completed: false },
        { points: targetPoints, title: 'Goal Complete!', completed: false }
      ];
      
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: newItemTitle,
        pointsTarget: targetPoints,
        currentPoints: 0,
        milestones: milestones
      };
      setGoals([...goals, newGoal]);
    }

    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setNewItemTitle('');
    setNewItemCategory('');
    setNewItemDueDate('');
    setNewItemPoints('5');
    setNewHabitTarget('1');
    setNewGoalTarget('100');
    setNewDescription('');
  };

  const handleCompleteChore = (id: string) => {
    const updatedChores = chores.map(chore => {
      if (chore.id === id && chore.status === 'To Do') {
        addPoints(chore.points);
        checkBadges('chore');
        return {
          ...chore,
          status: 'Done',
          completedAt: new Date().toISOString()
        };
      }
      return chore;
    });
    setChores(updatedChores);
    
    // Play a fun sound or visual effect for kids
    playCompletionEffect();
  };

  const handleSkipChore = (id: string) => {
    const updatedChores = chores.map(chore => {
      if (chore.id === id && chore.status === 'To Do') {
        return {
          ...chore,
          status: 'Skipped'
        };
      }
      return chore;
    });
    setChores(updatedChores);
  };

  const playCompletionEffect = () => {
    // Here you would play a sound if using react-native-sound
    // For now, we'll just do a visual effect
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleTrackHabit = (id: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const today = new Date().toISOString().split('T')[0];
        const lastCompletedDay = habit.lastCompleted ? habit.lastCompleted.split('T')[0] : null;
        
        // If already completed maximum times today
        if (habit.completedToday && habit.dailyProgress >= habit.dailyTarget) {
          return habit;
        }
        
        const newProgress = habit.dailyProgress + 1;
        const targetReached = newProgress >= habit.dailyTarget;
        
        // Update streak
        let newCurrentStreak = habit.currentStreak;
        if (targetReached && !habit.completedToday) {
          // If it's a new day from the last completion
          if (lastCompletedDay !== today) {
            // Check if yesterday or streak breaks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastCompletedDay === yesterdayStr) {
              // Continuing streak
              newCurrentStreak += 1;
            } else {
              // Streak broken, start new streak
              newCurrentStreak = 1;
            }
          }
        }
        
        // Add points if target reached for the first time today
        if (targetReached && !habit.completedToday) {
          addPoints(habit.points);
          checkBadges('habit');
          
          // Create a new plant for the forest
          addPlantToForest();
          
          // Show the plant-to-brain animation
          setShowAnimation(true);
          startPlantToBrainAnimation();
        }
        
        return {
          ...habit,
          dailyProgress: newProgress,
          completedToday: targetReached,
          lastCompleted: targetReached ? new Date().toISOString() : habit.lastCompleted,
          currentStreak: newCurrentStreak,
          maxStreak: Math.max(newCurrentStreak, habit.maxStreak)
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
  };

  const addPlantToForest = () => {
    const plantTypes = ['tree', 'flower', 'bush'];
    const randomType = plantTypes[Math.floor(Math.random() * plantTypes.length)] as 'tree' | 'flower' | 'bush';
    
    const newPlant: Plant = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      type: randomType
    };
    
    setPlants(prev => [...prev, newPlant]);
    
    // Check if user unlocked the planter badge
    if (plants.length + 1 >= 5 && badges.find(b => b.id === '6' && !b.unlocked)) {
      const updatedBadges = badges.map(badge => 
        badge.id === '6' ? { ...badge, unlocked: true } : badge
      );
      setBadges(updatedBadges);
      setTimeout(() => {
        Alert.alert('New Badge!', 'You earned the Plant Grower badge!');
      }, 2000); // Show after animation finishes
    }
  };

  const startPlantToBrainAnimation = () => {
    // Simplified function - just show the animation and let the component handle timing
    setShowAnimation(true);
    // The animation timing is now handled in the PlantToBrainAnimation component
  };

  const updateGoalProgress = () => {
    const updatedGoals = goals.map(goal => {
      // Update milestone completion status
      const updatedMilestones = goal.milestones.map(milestone => ({
        ...milestone,
        completed: goal.currentPoints >= milestone.points
      }));
      
      // Check if goal just completed
      const justCompleted = 
        goal.currentPoints < goal.pointsTarget && 
        goal.currentPoints + parseInt(newItemPoints) >= goal.pointsTarget;
      
      if (justCompleted) {
        checkBadges('goal');
      }
      
      return {
        ...goal,
        milestones: updatedMilestones
      };
    });
    
    setGoals(updatedGoals);
  };

  const addPoints = (amount: number) => {
    setPoints(prevPoints => {
      const newPoints = prevPoints + amount;
      // Animate points
      Animated.sequence([
        Animated.timing(pointAnimation, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(pointAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Update goal progress
      const updatedGoals = goals.map(goal => {
        return {
          ...goal,
          currentPoints: Math.min(goal.currentPoints + amount, goal.pointsTarget)
        };
      });
      
      setGoals(updatedGoals);
      setTimeout(updateGoalProgress, 100);
      
      // Check for point-based badges
      if (newPoints >= 100 && badges.find(b => b.id === '5' && !b.unlocked)) {
        const updatedBadges = badges.map(badge => 
          badge.id === '5' ? { ...badge, unlocked: true } : badge
        );
        setBadges(updatedBadges);
        Alert.alert('New Badge!', 'You earned the Point Collector badge!');
      }
      
      return newPoints;
    });
  };

  const checkBadges = (type: 'chore' | 'habit' | 'goal') => {
    let updatedBadges = [...badges];
    
    if (type === 'chore') {
      // Check for first chore completion
      if (!badges.find(b => b.id === '1')?.unlocked) {
        updatedBadges = updatedBadges.map(badge => 
          badge.id === '1' ? { ...badge, unlocked: true } : badge
        );
        Alert.alert('New Badge!', 'You earned your first chore badge!');
      }
      
      // Check for super helper badge
      const completedChores = chores.filter(c => c.status === 'Done').length + 1; // +1 for current completion
      if (completedChores >= 10 && !badges.find(b => b.id === '4')?.unlocked) {
        updatedBadges = updatedBadges.map(badge => 
          badge.id === '4' ? { ...badge, unlocked: true } : badge
        );
        Alert.alert('New Badge!', 'You earned the Super Helper badge!');
      }
    }
    
    if (type === 'habit') {
      // Check for 7-day streak
      const hasLongStreak = habits.some(h => h.currentStreak >= 7);
      if (hasLongStreak && !badges.find(b => b.id === '2')?.unlocked) {
        updatedBadges = updatedBadges.map(badge => 
          badge.id === '2' ? { ...badge, unlocked: true } : badge
        );
        Alert.alert('New Badge!', 'You earned the Habit Master badge!');
      }
      
      // Check for Brain Builder badge
      const totalCompletedHabits = habits.reduce((total, habit) => {
        // Counting habits with at least one completion
        return total + (habit.maxStreak > 0 ? 1 : 0);
      }, 0) + 1; // +1 for current completion
      
      if (totalCompletedHabits >= 20 && !badges.find(b => b.id === '7')?.unlocked) {
        updatedBadges = updatedBadges.map(badge => 
          badge.id === '7' ? { ...badge, unlocked: true } : badge
        );
        Alert.alert('New Badge!', 'You earned the Brain Builder badge!');
      }
    }
    
    if (type === 'goal') {
      // Check for completed goal
      if (totalCompletedHabits >= 20 && !badges.find(b => b.id === '7')?.unlocked) {
        updatedBadges = updatedBadges.map(badge => 
          badge.id === '3' ? { ...badge, unlocked: true } : badge
        );
        Alert.alert('New Badge!', 'You earned the Goal Achiever badge!');
      }
    }
    
    if (updatedBadges !== badges) {
      setBadges(updatedBadges);
    }
  };

  const filteredChores = chores.filter(chore => {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter by status
    if (choreFilter === 'Today') {
      return chore.dueDate === today && chore.status === 'To Do';
    } else if (choreFilter === 'Overdue') {
      return chore.dueDate < today && chore.status === 'To Do';
    } else if (choreFilter === 'Completed') {
      return chore.status === 'Done';
    }
    
    // Filter by category
    if (categoryFilter !== 'All') {
      return chore.category === categoryFilter;
    }
    
    return true;
  });

  const getCategories = () => {
    const categories = new Set<string>();
    chores.forEach(chore => {
      if (chore.category) categories.add(chore.category);
    });
    return ['All', ...Array.from(categories)];
  };

  const getGoalProgressMessage = (goal: Goal) => {
    const percentage = Math.floor((goal.currentPoints / goal.pointsTarget) * 100);
    
    if (percentage >= 100) return "Amazing! Goal completed! 🎉";
    if (percentage >= 75) return "Almost there! Keep going! 🚀";
    if (percentage >= 50) return "Halfway there! You can do it! 💪";
    if (percentage >= 25) return "Great start! Keep it up! 🌟";
    return "You've started your journey! 🌱";
  };

  const renderChoreItem = (chore: Chore) => {
    return (
      <View style={styles.itemCard} key={chore.id}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{chore.title}</Text>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(chore.category) }]}>
            <Text style={styles.categoryText}>{chore.category}</Text>
          </View>
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Calendar width={16} height={16} stroke="#666" />
            <Text style={styles.detailText}>Due: {formatDate(chore.dueDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Star width={16} height={16} fill="#FFD700" stroke="#FFD700" />
            <Text style={styles.detailText}>{chore.points} points</Text>
          </View>
        </View>
        
        <View style={styles.itemActions}>
          {chore.status === 'To Do' ? (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]} 
                onPress={() => handleCompleteChore(chore.id)}
              >
                <CheckCircle width={18} height={18} stroke="#fff" />
                <Text style={styles.actionText}>Done</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.skipButton]} 
                onPress={() => handleSkipChore(chore.id)}
              >
                <X width={18} height={18} stroke="#fff" />
                <Text style={styles.actionText}>Skip</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.statusTag, 
              chore.status === 'Done' ? styles.doneTag : styles.skippedTag
            ]}>
              <Text style={styles.statusText}>
                {chore.status}
                {chore.completedAt && chore.status === 'Done' ? ` at ${formatTime(chore.completedAt)}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHabitItem = (habit: Habit) => {
    const progressPercentage = (habit.dailyProgress / habit.dailyTarget) * 100;
    return (
      <View style={styles.itemCard} key={habit.id}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{habit.title}</Text>
          <View style={styles.streakContainer}>
            <Zap width={16} height={16} fill="#FF6B00" stroke="#FF6B00" />
            <Text style={styles.streakText}>{habit.currentStreak} days</Text>
          </View>
        </View>
        
        {habit.description && (
          <Text style={styles.habitDescription}>{habit.description}</Text>
        )}
        
        <View style={styles.progressContainer}>
          <View style={styles.progressOuter}>
            <View 
              style={[
                styles.progressInner, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {habit.dailyProgress}/{habit.dailyTarget} today
          </Text>
        </View>
        
        <View style={styles.habitDetails}>
          <View style={styles.detailRow}>
            <Star width={16} height={16} fill="#FFD700" stroke="#FFD700" />
            <Text style={styles.detailText}>{habit.points} points when completed</Text>
          </View>
          {habit.lastCompleted && (
            <View style={styles.detailRow}>
              <Clock width={16} height={16} stroke="#666" />
              <Text style={styles.detailText}>Last: {formatDate(habit.lastCompleted)}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.trackButton, 
            habit.completedToday && habit.dailyProgress >= habit.dailyTarget ? 
              styles.trackButtonCompleted : styles.trackButtonActive
          ]}
          onPress={() => handleTrackHabit(habit.id)}
          disabled={habit.completedToday && habit.dailyProgress >= habit.dailyTarget}
        >
          <Text style={[
            styles.trackButtonText,
            habit.completedToday && habit.dailyProgress >= habit.dailyTarget ? 
              styles.completedText : null
          ]}>
            {habit.completedToday && habit.dailyProgress >= habit.dailyTarget ? 
              'Completed Today 🎉' : 'Track Progress ⚡'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGoalItem = (goal: Goal) => {
    const progressPercentage = Math.min((goal.currentPoints / goal.pointsTarget) * 100, 100);
    return (
      <View style={styles.itemCard} key={goal.id}>
        <Text style={styles.itemTitle}>{goal.title}</Text>
        
        <View style={styles.goalProgressContainer}>
          <View style={styles.progressOuter}>
            <View 
              style={[
                styles.progressInner, 
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {goal.currentPoints}/{goal.pointsTarget} points
          </Text>
        </View>
        
        <Text style={styles.encouragementText}>
          {getGoalProgressMessage(goal)}
        </Text>
        
        <Text style={styles.milestoneHeader}>Milestones:</Text>
        <View style={styles.milestonesContainer}>
          {goal.milestones.map((milestone, index) => (
            <View style={styles.milestoneItem} key={index}>
              <View style={[
                styles.milestoneCircle,
                milestone.completed ? styles.milestoneCompleted : styles.milestoneIncomplete
              ]}>
                {milestone.completed && <CheckCircle width={16} height={16} stroke="#fff" />}
              </View>
              <Text style={[
                styles.milestoneText,
                milestone.completed ? styles.milestoneTextCompleted : {}
              ]}>
                {milestone.title} ({milestone.points} pts)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBadgeItem = (badge: Badge) => {
    return (
      <View style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]} key={badge.id}>
        <View style={styles.badgeIconContainer}>
          <Award width={40} height={40} stroke={badge.unlocked ? "#FFD700" : "#999"} />
        </View>
        <Text style={[styles.badgeTitle, !badge.unlocked && styles.badgeTitleLocked]}>
          {badge.title}
        </Text>
        <Text style={styles.badgeDescription}>
          {badge.unlocked ? badge.description : "???"}
        </Text>
      </View>
    );
  };

  const renderPlantInForest = (plant: Plant, index: number) => {
    // Create a visually distinct pattern for different plant types
    const renderPlantImage = () => {
      switch(plant.type) {
        case 'tree':
          return (
            <View style={styles.treeContainer}>
              <View style={styles.treeTop} />
              <View style={styles.treeTrunk} />
            </View>
          );
        case 'flower':
          return (
            <View style={styles.flowerContainer}>
              <View style={styles.flowerStem} />
              <View style={styles.flowerPetal1} />
              <View style={styles.flowerPetal2} />
              <View style={styles.flowerPetal3} />
              <View style={styles.flowerCenter} />
            </View>
          );
        // case 'bush':
        //   return (
        //     <View style={styles.bushContainer}>
        //       <View style={styles.bushTop} />
        //     </View>
        //   );
        default:
          return null;
      }
    };

    return (
      <View 
        style={[
          styles.plantItem, 
          {
            left: (index % 5) * 70 + 10,
            bottom: Math.floor(index / 5) * 80 + 20
          }
        ]} 
        key={plant.id}
      >
        {renderPlantImage()}
      </View>
    );
  };

  // Animation component for plant to brain transformation using Lottie
  // Animation component for plant to brain transformation using Lottie
// Animation component for plant to brain transformation using Lottie
const PlantToBrainAnimation = () => {
  const plantRef = useRef<LottieView>(null);
  const brainRef = useRef<LottieView>(null);
  const [showPlant, setShowPlant] = useState(true);
  const [showBrain, setShowBrain] = useState(false);
  
  useEffect(() => {
    // Force a reset of animations on mount
    if (plantRef.current) {
      setTimeout(() => {
        plantRef.current?.play(0, 120); // Explicitly tell it to play from frame 0 to 120
      }, 100);
    }
    
    // Set a timeout to switch to brain animation after 2.5 seconds
    const plantTimer = setTimeout(() => {
      // Fade transition
      setShowBrain(true);
      
      setTimeout(() => {
        if (brainRef.current) {
          brainRef.current?.play(0, 120); // Explicitly tell it to play from frame 0 to 120
        }
      }, 300);
      
      // Overlap animations slightly for smoother transition
      const fadeTimer = setTimeout(() => {
        setShowPlant(false);
      }, 500);
      
      return () => clearTimeout(fadeTimer);
    }, 2500);
    
    // Set a timeout to hide the animation after exactly 5 seconds
    const animationTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 5000);
    
    return () => {
      clearTimeout(plantTimer);
      clearTimeout(animationTimer);
    };
  }, []);
  
  // Rest of the component remains the same...
  
  // Rest of the component remains the same...
    
    // Animated values for transition effects
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      // Run fade animation when brain animation starts
      if (showBrain) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    }, [showBrain]);
    
    return (
      <View style={styles.animationContainer}>
        {/* Background elements */}
        <View style={styles.animationBackground}>
          <Animated.View style={[
            styles.sunContainer,
            {
              transform: [{ 
                rotate: sunRotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                }) 
              }]
            }
          ]}>
            <Sun width={60} height={60} stroke="#FFD700" fill="#FFEC99" />
          </Animated.View>
          
          <View style={[styles.cloudContainer, { left: 20, top: 50 }]}>
            <Cloud width={40} height={30} stroke="#AACCFF" fill="#E6F0FF" />
          </View>
          <View style={[styles.cloudContainer, { right: 40, top: 30 }]}>
            <Cloud width={50} height={35} stroke="#AACCFF" fill="#E6F0FF" />
          </View>
        </View>
        
        {/* Explanation text at top */}
        <Text style={styles.animationTitle}>
          Growing habits grow your brain! 🌱
        </Text>
        
        {/* Plant Animation */}
        {showPlant && (
          <Animated.View 
            style={[
              styles.lottieContainer,
              { opacity: showBrain ? fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }) : 1 }
            ]}
          >
            <LottieView
              ref={plantRef}
              source={plantAnimation}
              style={styles.lottieAnimation}
              speed={1.0}
              loop={false}
              resizeMode="cover"
              autoPlay = {false}
              cacheStrategy="strong"
      renderMode="HARDWARE"
            />
          </Animated.View>
        )}
        
        {/* Brain Animation */}
        {showBrain && (
          <Animated.View 
            style={[
              styles.lottieContainer, 
              styles.brainContainer,
              { opacity: fadeAnim }
            ]}
          >
            <LottieView
              ref={brainRef}
              source={brainAnimation}
              style={styles.lottieAnimation}
              speed={1.0}
              loop={false}
              resizeMode="cover"
              autoPlay = {false}
              cacheStrategy="strong"
      renderMode="HARDWARE"
            />
          </Animated.View>
        )}
        
        {/* Explanatory text at bottom */}
        <Animated.Text style={[
          styles.animationText,
          { opacity: fadeAnim }
        ]}>
          Your neurons are growing stronger! 🧠
        </Animated.Text>
      </View>
    );
  };

  // Enhanced forest view
  const renderForestView = () => {
    return (
      <View style={styles.forestContainer}>
        <View style={styles.forestHeader}>
          <Text style={styles.forestTitle}>Your Brain Forest 🌳</Text>
          <Text style={styles.forestSubtitle}>
            {plants.length} {plants.length === 1 ? 'plant' : 'plants'} growing!
          </Text>
        </View>

        <View style={styles.forestBackground}>
          <View style={styles.forestGround} />
          <View style={styles.forestSky} />
          
          {/* Sun in the forest */}
          <Animated.View style={[
            styles.forestSun,
            {
              transform: [{ 
                rotate: sunRotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                }) 
              }]
            }
          ]}>
            <Sun width={50} height={50} stroke="#FF9500" fill="#FFCC00" />
          </Animated.View>
          
          {/* Clouds in the forest */}
          <View style={[styles.forestCloud, { left: 20, top: 30 }]}>
            <Cloud width={60} height={40} stroke="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View style={[styles.forestCloud, { right: 50, top: 50 }]}>
            <Cloud width={70} height={45} stroke="#FFFFFF" fill="#FFFFFF" />
          </View>
          
          {/* Plants */}
          <View style={styles.forestPlantsContainer}>
            {plants.map((plant, index) => renderPlantInForest(plant, index))}
          </View>
          
          {/* Forest floor */}
          <View style={styles.forestFloor} />
          
          {/* Call to action if no plants */}
          {plants.length === 0 && (
            <View style={styles.emptyForestMessage}>
              <Text style={styles.emptyForestText}>
                Complete habits to grow your forest and brain! 🌱🧠
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.forestStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trees:</Text>
            <Text style={styles.statValue}>
              {plants.filter(p => p.type === 'tree').length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Flowers:</Text>
            <Text style={styles.statValue}>
              {plants.filter(p => p.type === 'flower').length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Bushes:</Text>
            <Text style={styles.statValue}>
              {plants.filter(p => p.type === 'bush').length}
            </Text>
          </View>
        </View>
        
        <View style={styles.forestBrainConnection}>
          <Text style={styles.forestBrainText}>
            Every plant helps your brain grow stronger!
          </Text>
          <View style={styles.brainIconContainer}>
            <View style={styles.brainIconLeft} />
            <View style={styles.brainIconRight} />
          </View>
        </View>
      </View>
    );
  };

  // Main render method
  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti Animation for task completion */}
      <Animated.View style={[
        styles.confetti,
        {
          opacity: confettiAnim
        }
      ]}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View 
            key={i}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: [
                  { rotate: `${Math.random() * 360}deg` },
                  { translateX: Math.random() * 10 - 5 },
                  { translateY: Math.random() * 10 - 5 }
                ]
              }
            ]}
          />
        ))}
      </Animated.View>
      
      {/* Plant to Brain Animation */}
      {showAnimation && <PlantToBrainAnimation />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Kid Task Tracker 🚀</Text>
        <Animated.View style={[
          styles.pointsContainer,
          {
            transform: [{ scale: pointAnimation }]
          }
        ]}>
          <Star width={24} height={24} fill="#FFD700" stroke="#FFD700" />
          <Text style={styles.pointsText}>{points} points</Text>
        </Animated.View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['chores', 'habits', 'goals', 'rewards', 'forest'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab ? styles.activeTabText : null
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'forest' && ` (${plants.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters for Chores */}
      {activeTab === 'chores' && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['Today', 'Overdue', 'Completed', 'All'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  choreFilter === filter ? styles.activeFilter : null
                ]}
                onPress={() => setChoreFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  choreFilter === filter ? styles.activeFilterText : null
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.categoryFilterButton} onPress={() => {
            Alert.alert("Categories", "Select a category", 
              getCategories().map(category => ({
                text: category,
                onPress: () => setCategoryFilter(category)
              }))
            );
          }}>
            <Filter width={18} height={18} stroke="#666" />
            <Text style={styles.categoryFilterText}>{categoryFilter}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'chores' && (
          <>
            {filteredChores.length > 0 ? (
              filteredChores.map(renderChoreItem)
            ) : (
              <View style={styles.emptyState}>
                <AlertTriangle width={60} height={60} stroke="#FFD700" />
                <Text style={styles.emptyStateText}>
                  No chores found for this filter.
                </Text>
              </View>
            )}
          </>
        )}
        
        {activeTab === 'habits' && (
          <>
            {habits.length > 0 ? (
              habits.map(renderHabitItem)
            ) : (
              <View style={styles.emptyState}>
                <Heart width={60} height={60} stroke="#FF6B6B" />
                <Text style={styles.emptyStateText}>
                  No habits added yet. Add your first habit!
                </Text>
              </View>
            )}
          </>
        )}
        
        {activeTab === 'goals' && (
          <>
            {goals.length > 0 ? (
              goals.map(renderGoalItem)
            ) : (
              <View style={styles.emptyState}>
                <Target width={60} height={60} stroke="#4CAF50" />
                <Text style={styles.emptyStateText}>
                  No goals added yet. Set your first goal!
                </Text>
              </View>
            )}
          </>
        )}
        
        {activeTab === 'rewards' && (
          <View style={styles.badgesContainer}>
            {badges.map(renderBadgeItem)}
          </View>
        )}
        
        {activeTab === 'forest' && renderForestView()}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setModalType(activeTab === 'chores' ? 'chore' : 
                       activeTab === 'habits' ? 'habit' : 
                       activeTab === 'goals' ? 'goal' : 'chore');
          if (['chores', 'habits', 'goals'].includes(activeTab)) {
            setShowAddModal(true);
          }
        }}
      >
        <Plus width={24} height={24} stroke="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X width={24} height={24} stroke="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={newItemTitle}
                onChangeText={setNewItemTitle}
                placeholder="Enter title..."
              />
              
              {modalType === 'chore' && (
                <>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={newItemCategory}
                    onChangeText={setNewItemCategory}
                    placeholder="E.g., Homework, Cleaning..."
                  />
                  
                  <Text style={styles.inputLabel}>Due Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => {
                      // In a real app, you'd use a DatePicker here
                      // For now, let's simulate by setting it to today
                      setNewItemDueDate(new Date().toISOString().split('T')[0]);
                    }}
                  >
                    <Text style={styles.dateButtonText}>
                      {newItemDueDate ? formatDate(newItemDueDate) : 'Select a date'}
                    </Text>
                    <Calendar width={20} height={20} stroke="#666" />
                  </TouchableOpacity>
                </>
              )}
              
              {modalType === 'habit' && (
                <>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newDescription}
                    onChangeText={setNewDescription}
                    placeholder="Why is this habit important?"
                    multiline
                  />
                  
                  <Text style={styles.inputLabel}>Daily Target</Text>
                  <TextInput
                    style={styles.input}
                    value={newHabitTarget}
                    onChangeText={setNewHabitTarget}
                    placeholder="How many times per day?"
                    keyboardType="numeric"
                  />
                </>
              )}
              
              {modalType === 'goal' && (
                <>
                  <Text style={styles.inputLabel}>Point Target</Text>
                  <TextInput
                    style={styles.input}
                    value={newGoalTarget}
                    onChangeText={setNewGoalTarget}
                    placeholder="How many points to reach goal?"
                    keyboardType="numeric"
                  />
                </>
              )}
              
              <Text style={styles.inputLabel}>Points {modalType === 'habit' ? 'per completion' : ''}</Text>
              <TextInput
                style={styles.input}
                value={newItemPoints}
                onChangeText={setNewItemPoints}
                placeholder="Points value"
                keyboardType="numeric"
              />
            </ScrollView>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
              <Text style={styles.submitButtonText}>Add {modalType}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Homework': '#4CAF50',
    'Cleaning': '#2196F3',
    'Reading': '#FF9800',
    'Exercise': '#E91E63',
    'Music': '#9C27B0',
    'General': '#607D8B'
  };
  
  return (colors as any)[category] || colors.General;
};

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF', // Light blue background that feels friendly
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#5B86E5', // Bright, engaging blue
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    marginLeft: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B86E5',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 25,
    backgroundColor: '#E6EEFF',
    padding: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#5B86E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B86E5',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  filterScroll: {
    flexGrow: 0,
    maxWidth: '75%',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E6EEFF',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#5B86E5',
  },
  filterText: {
    fontSize: 14,
    color: '#5B86E5',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E6EEFF',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  itemDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 10,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  skipButton: {
    backgroundColor: '#FF5252',
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  doneTag: {
    backgroundColor: '#4CAF50',
  },
  skippedTag: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  streakText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressOuter: {
    height: 12,
    backgroundColor: '#E6EEFF',
    borderRadius: 6,
    marginBottom: 5,
  },
  progressInner: {
    height: '100%',
    backgroundColor: '#5B86E5',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  habitDetails: {
    marginBottom: 15,
  },
  trackButton: {
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  trackButtonActive: {
    backgroundColor: '#5B86E5',
  },
  trackButtonCompleted: {
    backgroundColor: '#E6EEFF',
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  completedText: {
    color: '#5B86E5',
  },
  goalProgressContainer: {
    marginVertical: 15,
  },
  encouragementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  milestoneHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  milestonesContainer: {
    marginTop: 5,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  milestoneCompleted: {
    backgroundColor: '#4CAF50',
  },
  milestoneIncomplete: {
    backgroundColor: '#E0E0E0',
  },
  milestoneText: {
    fontSize: 14,
    color: '#666',
  },
  milestoneTextCompleted: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeLocked: {
    backgroundColor: '#F5F5F5',
  },
  badgeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E6EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  badgeTitleLocked: {
    color: '#999',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5B86E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFC',
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#F9FAFC',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#5B86E5',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Plant-to-Brain Animation Styles
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  animationBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  lottieContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  brainContainer: {
    transform: [{ scale: 1.2 }], // Make brain animation slightly larger
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  animationTitle: {
    position: 'absolute',
    top: 100,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  animationText: {
    position: 'absolute',
    bottom: 100,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B86E5',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  
  // ...existing code...
  forestContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  forestHeader: {
    marginBottom: 15,
  },
  forestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  forestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  forestBackground: {
    position: 'relative',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  forestSky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: '#87CEFA',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  forestGround: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#8BC34A',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  forestSun: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  forestCloud: {
    position: 'absolute',
    zIndex: 5,
  },
  forestPlantsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 10,
  },
  forestFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#795548',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  emptyForestMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  emptyForestText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  forestStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  forestBrainConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6EEFF',
    padding: 10,
    borderRadius: 10,
  },
  forestBrainText: {
    fontSize: 14,
    color: '#5B86E5',
    marginRight: 10,
    fontWeight: '600',
  },
  brainIconContainer: {
    width: 30,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  brainIconLeft: {
    position: 'absolute',
    left: 2,
    width: 14,
    height: 20,
    backgroundColor: '#FF9E80',
    borderRadius: 7,
  },
  brainIconRight: {
    position: 'absolute',
    right: 2,
    width: 14,
    height: 20,
    backgroundColor: '#FF9E80',
    borderRadius: 7,
  },
  // Plant items in the forest
  plantItem: {
    position: 'absolute',
    zIndex: 15,
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end', // Align items at the bottom
  },
  treeTrunk: {
    width: 10,
    height: 50,
    backgroundColor: '#795548',
    borderRadius: 5,
    marginBottom: -10, // Small adjustment to connect with the top
  },
  treeTop: {
    width: 50,
    height: 60,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    marginTop: -15, // Connect to the trunk
  },
  flowerContainer: {
    alignItems: 'center',
  },
  flowerStem: {
    width: 5,
    height: 40,
    backgroundColor: '#4CAF50',
  },
  flowerPetal1: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 20,
    backgroundColor: '#FF9800',
    borderRadius: 10,
  },
  flowerPetal2: {
    position: 'absolute',
    top: -5,
    left: -10,
    width: 20,
    height: 20,
    backgroundColor: '#FF9800',
    borderRadius: 10,
  },
  flowerPetal3: {
    position: 'absolute',
    top: -5,
    right: -10,
    width: 20,
    height: 20,
    backgroundColor: '#FF9800',
    borderRadius: 10,
  },
  flowerCenter: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    backgroundColor: '#FFC107',
    borderRadius: 5,
  },
  bushContainer: {
    alignItems: 'center',
  },
  bushTop: {
    width: 40,
    height: 30,
    backgroundColor: '#388E3C',
    borderRadius: 15,
  },
  // Confetti Animation
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    zIndex: 1001,
  },
});

export default KidTaskTracker;

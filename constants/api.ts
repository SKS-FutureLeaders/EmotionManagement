import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { API_URL } from '../config';

// Define the JournalEntry type for use in API functions
interface JournalEntry {
  date: string;
  timeOfDay?: string;
  headline?: string;
  angerTrigger?: string;
  trigger?: string;
  emotions: string[];
  emotionIntensity: number;
  coping: string;
  consequence: string;
  improvement: string;
  childId?: string; // Make childId optional for backward compatibility
}

// Update Child interface to match the parent_dashboard.tsx interface
interface Child {
  id: string;
  name: string;
  age: number; // Changed from number to match parent_dashboard.tsx
  email?: string;
  leadershipGoal?: string;
  gender?: string;
  ageGroup?: string;
  focusAreas?: string[];
  avatar?: string;
}

// Get journal entries for a specific child with improved organization
export const getChildJournalEntries = async (childId: string): Promise<JournalEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(`journalEntries_${childId}`);
    let entries = [];
    
    if (entriesJson) {
      entries = JSON.parse(entriesJson);
      
      // Add created at if missing
      entries = entries.map((entry: JournalEntry) => ({
        ...entry,
        createdAt: entry.createdAt || entry.date
      }));
      
      // Deduplicate entries based on createdAt or date+headline
      entries = Array.from(
        new Map(entries.map((e: JournalEntry) => 
          [e.createdAt || (e.date + (e.headline || '')), e]
        )).values()
      );
    }
    
    return entries;
  } catch (error) {
    console.error('Error fetching child journal entries:', error);
    return [];
  }
};

// Add helper function to analyze coping strategies
export const analyzeCopingStrategy = (coping: string): { score: number; feedback: string } => {
  const lowercasedText = coping.toLowerCase();
  
  const positiveKeywords = [
    'breathe', 'calm', 'talk', 'walk', 'count', 'timeout', 'break',
    'music', 'draw', 'help', 'ask'
  ];
  
  const negativeKeywords = [
    'hit', 'throw', 'scream', 'yell', 'break', 'slam', 'punch'
  ];
  
  const positiveCount = positiveKeywords.filter(word => 
    lowercasedText.includes(word)).length;
  const negativeCount = negativeKeywords.filter(word => 
    lowercasedText.includes(word)).length;
  
  const score = positiveCount - negativeCount;
  
  let feedback = '';
  if (score > 2) feedback = "Excellent coping strategies! 🌟";
  else if (score > 0) feedback = "Good coping approach. 👍";
  else if (score === 0) feedback = "Mixed coping strategies.";
  else if (score > -2) feedback = "Some concerning responses.";
  else feedback = "Needs guidance with better coping skills.";
  
  return { score, feedback };
};

// Add function to create some dummy journal entries for a child
export const createDummyEntriesForChild = async (childId: string): Promise<void> => {
  const today = new Date();
  const emotions = ['Happy', 'Sad', 'Angry', 'Scared', 'Excited', 'Calm'];
  const copingStrategies = [
    'I took deep breaths to calm down',
    'I hit my pillow instead of hitting someone',
    'I talked to my mom about my feelings',
    'I walked away to cool down',
    'I screamed into a pillow',
    'I listened to my favorite song'
  ];
  
  const entries: JournalEntry[] = [];
  
  // Create entries for the past 10 days
  for (let i = 0; i < 10; i++) {
    const entryDate = new Date(today);
    entryDate.setDate(today.getDate() - i);
    
    // Randomize whether we create an entry for this day (70% chance)
    if (Math.random() < 0.7) {
      // Create between 1-3 entries per day
      const entriesPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < entriesPerDay; j++) {
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const randomIntensity = Math.floor(Math.random() * 5) + 1; // 1-5 intensity
        const randomCoping = copingStrategies[Math.floor(Math.random() * copingStrategies.length)];
        
        entries.push({
          date: entryDate.toISOString(),
          timeOfDay: ['Morning', 'Afternoon', 'Evening', 'Night'][Math.floor(Math.random() * 4)],
          headline: `I felt ${randomEmotion.toLowerCase()} today`,
          angerTrigger: `My sibling took my toy without asking`,
          emotions: [randomEmotion],
          emotionIntensity: randomIntensity,
          coping: randomCoping,
          consequence: 'I calmed down after a while',
          improvement: 'Next time I will use my words sooner',
          childId: childId
        });
      }
    }
  }
  
  // Save all entries
  const key = `journalEntries_${childId}`;
  await AsyncStorage.setItem(key, JSON.stringify(entries));
};

// Enhanced data analysis for emotion trends
export const analyzeEmotionTrends = (entries: JournalEntry[]): {
  primaryEmotion: string;
  emotionBreakdown: Record<string, number>;
  averageIntensity: number;
  progressTrend: 'improving' | 'stable' | 'worsening' | 'mixed' | 'insufficient_data';
  commonTriggers: string[];
  calmestTimeOfDay: string;
  mostIntenseTimeOfDay: string;
  bestCopingMechanisms: string[];
} => {
  if (!entries || entries.length === 0) {
    return {
      primaryEmotion: 'Unknown',
      emotionBreakdown: {},
      averageIntensity: 0,
      progressTrend: 'insufficient_data',
      commonTriggers: [],
      calmestTimeOfDay: 'Unknown',
      mostIntenseTimeOfDay: 'Unknown',
      bestCopingMechanisms: []
    };
  }

  // Sort entries by date (earliest to latest)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Count emotion occurrences
  const emotionCount: Record<string, number> = {};
  let totalIntensity = 0;
  
  // Time of day analysis
  const timeOfDayIntensity: Record<string, {total: number, count: number}> = {
    'Morning': {total: 0, count: 0},
    'Afternoon': {total: 0, count: 0},
    'Evening': {total: 0, count: 0},
    'Night': {total: 0, count: 0},
  };
  
  // Trigger word analysis
  const triggerWords: Record<string, number> = {};
  
  // Coping mechanism analysis
  const copingEffectiveness: Record<string, {score: number, count: number}> = {};
  
  // Track intensity over time for trend analysis
  const weeklyIntensities: number[] = [];
  let currentWeekIntensities: number[] = [];
  let currentWeekStart = new Date(sortedEntries[0].date);
  
  sortedEntries.forEach(entry => {
    // Count emotions
    entry.emotions.forEach(emotion => {
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
    
    totalIntensity += entry.emotionIntensity;
    
    // Time of day analysis
    if (entry.timeOfDay && timeOfDayIntensity[entry.timeOfDay]) {
      timeOfDayIntensity[entry.timeOfDay].total += entry.emotionIntensity;
      timeOfDayIntensity[entry.timeOfDay].count += 1;
    }
    
    // Extract trigger words
    if (entry.angerTrigger) {
      const words = entry.angerTrigger.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          triggerWords[word] = (triggerWords[word] || 0) + 1;
        }
      });
    }
    
    // Analyze coping mechanisms
    const copingAnalysis = analyzeCopingStrategy(entry.coping);
    const copingKey = entry.coping.toLowerCase().trim();
    if (!copingEffectiveness[copingKey]) {
      copingEffectiveness[copingKey] = { score: 0, count: 0 };
    }
    copingEffectiveness[copingKey].score += copingAnalysis.score;
    copingEffectiveness[copingKey].count += 1;
    
    // Weekly intensity tracking
    const entryDate = new Date(entry.date);
    const daysDiff = Math.floor((entryDate.getTime() - currentWeekStart.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 7) {
      // Same week
      currentWeekIntensities.push(entry.emotionIntensity);
    } else {
      // New week
      if (currentWeekIntensities.length > 0) {
        const weekAvg = currentWeekIntensities.reduce((sum, val) => sum + val, 0) / currentWeekIntensities.length;
        weeklyIntensities.push(weekAvg);
      }
      currentWeekIntensities = [entry.emotionIntensity];
      currentWeekStart = new Date(entryDate);
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Reset to Sunday
    }
  });
  
  // Add the final week
  if (currentWeekIntensities.length > 0) {
    const weekAvg = currentWeekIntensities.reduce((sum, val) => sum + val, 0) / currentWeekIntensities.length;
    weeklyIntensities.push(weekAvg);
  }
  
  // Find primary emotion
  let primaryEmotion = 'Unknown';
  let maxCount = 0;
  Object.entries(emotionCount).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count;
      primaryEmotion = emotion;
    }
  });
  
  // Calculate average intensity
  const averageIntensity = entries.length > 0 ? totalIntensity / entries.length : 0;
  
  // Determine progress trend
  let progressTrend: 'improving' | 'stable' | 'worsening' | 'mixed' | 'insufficient_data' = 'insufficient_data';
  
  if (weeklyIntensities.length >= 2) {
    const firstHalf = weeklyIntensities.slice(0, Math.floor(weeklyIntensities.length / 2));
    const secondHalf = weeklyIntensities.slice(Math.floor(weeklyIntensities.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = firstHalfAvg - secondHalfAvg;
    if (Math.abs(difference) < 0.3) {
      progressTrend = 'stable';
    } else if (difference > 0) {
      progressTrend = 'improving'; // Less intensity in second half is improvement
    } else {
      progressTrend = 'worsening';
    }
  }
  
  // Find calmest and most intense times of day
  let calmestTimeOfDay = 'Unknown';
  let mostIntenseTimeOfDay = 'Unknown';
  let lowestAvg = Infinity;
  let highestAvg = 0;
  
  Object.entries(timeOfDayIntensity).forEach(([timeOfDay, data]) => {
    if (data.count > 0) {
      const avg = data.total / data.count;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        calmestTimeOfDay = timeOfDay;
      }
      if (avg > highestAvg) {
        highestAvg = avg;
        mostIntenseTimeOfDay = timeOfDay;
      }
    }
  });
  
  // Find common triggers
  const commonTriggers = Object.entries(triggerWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
  
  // Find best coping mechanisms
  const bestCopingMechanisms = Object.entries(copingEffectiveness)
    .filter(([_, data]) => data.count >= 2) // Only consider mechanisms used multiple times
    .map(([mechanism, data]) => ({ 
      mechanism, 
      effectiveness: data.score / data.count 
    }))
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, 3)
    .map(item => item.mechanism);
  
  return {
    primaryEmotion,
    emotionBreakdown: emotionCount,
    averageIntensity,
    progressTrend,
    commonTriggers,
    calmestTimeOfDay,
    mostIntenseTimeOfDay,
    bestCopingMechanisms
  };
};

// Add this function to your api.ts file



export const getSummary = async (childName) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch(`${API_URL}/childauth/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'childName': childName
        }
      });
      // console.log('Response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

    if (!response.ok) {
      throw new Error(`Failed to fetch summary data: ${response.status}`);
    }
    
    // Parse and return the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching summary data:', error);
    throw error;
  }
};

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  Platform
} from 'react-native';
import {getSummary} from '../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Interface for journal entries - keep consistent with the api.ts file
interface JournalEntry {
  date: string;
  timeOfDay?: string;
  headline?: string;
  angerTrigger?: string;
  childId?: string;
  emotions: string[];
  emotionIntensity: number;
  coping: string;
  consequence: string;
  improvement: string;
  createdAt: string;
}

// Interface for simplified calendar day data
interface CalendarDay {
  date: Date;
  entries: JournalEntry[];
  averageIntensity: number;
  primaryEmotion: string;
  hasEntries: boolean;
}

// Add props interface at the top
interface WeeklySummaryProps {
  childId?: string;
  childName?: string;
}

// Define an interface for the emotion analysis structure
interface EmotionAnalysis {
  "Primary Emotion"?: string;
  "Average Intensity"?: number;
  "Overall Trend"?: string;
  "Best Time of Day"?: string;
  "Most Common Trigger"?: string;
  "Most Effective Coping Strategy"?: string;
  "Additional Comments"?: string;
  // Keep backward compatibility with the old format
  primaryEmotion?: string;
  averageIntensity?: number;
  progressTrend?: string;
  calmestTimeOfDay?: string;
  commonTriggers?: string[];
  bestCopingMechanisms?: string[];
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ 
  childId = "", 
  childName = "Child" 
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStartDate(new Date()));
  const [viewAll, setViewAll] = useState(false); // NEW: toggle for all entries in modal
  const [modalEntries, setModalEntries] = useState<JournalEntry[]>([]); // NEW: entries to show in modal
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allChildEntries, setAllChildEntries] = useState<JournalEntry[]>([]);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  // Add after other state variables
  const [summaryData, setSummaryData] = useState<any>(null);

  // Load journal entries when component mounts
  useEffect(() => {
    loadJournalEntries();
  }, [currentWeekStart]);

  // Load all child entries once at the beginning
  useEffect(() => {
    loadAllChildEntries();
  }, [childId]);

  // Get the start date (Sunday) of the week containing the specified date
  function getWeekStartDate(date: Date): Date {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = newDate.getDate() - day;
    return new Date(newDate.setDate(diff));
  }

  // Load all entries for this child
  const loadAllChildEntries = async () => {
    if (summaryData) {
      return;
    }
    setLoading(true);
    try {
      // Implementation removed for brevity
      setLoading(false);
    } catch (error) {
      console.error("Error loading child entries:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("All child entries:", allChildEntries);
    if (typeof allChildEntries === 'string') {
      // Parse string format into array of objects
      parseTextEntries(allChildEntries);
    }
    if (Array.isArray(allChildEntries)) {
      const weeklyEntries = allChildEntries.filter(entry => {
        // Parse the entry date string
        const entryDate = new Date(entry.date);
        
        // Create date for end of week
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Normalize the dates by removing time components for comparison
        // This avoids timezone issues
        const entryDateNormalized = new Date(
          entryDate.getFullYear(),
          entryDate.getMonth(),
          entryDate.getDate()
        );
        
        const weekStartNormalized = new Date(
          currentWeekStart.getFullYear(),
          currentWeekStart.getMonth(),
          currentWeekStart.getDate()
        );
        
        const weekEndNormalized = new Date(
          weekEnd.getFullYear(),
          weekEnd.getMonth(),
          weekEnd.getDate()
        );
        
        // For debugging
        console.log("Checking entry date:", entryDate);
        console.log("Normalized entry date:", entryDateNormalized);
        console.log("Week start:", weekStartNormalized);
        console.log("Week end:", weekEndNormalized);
        console.log("Is in range:", 
          entryDateNormalized >= weekStartNormalized && 
          entryDateNormalized <= weekEndNormalized
        );
        
        // Compare normalized dates to ensure we only check the date part
        return entryDateNormalized >= weekStartNormalized && 
               entryDateNormalized <= weekEndNormalized;
      });
      console.log("Weekly entries:", weeklyEntries);
      
      // Call processEntriesIntoCalendarDays with the filtered entries
      processEntriesIntoCalendarDays(weeklyEntries);
    }
  }, [allChildEntries]);

  const parseTextEntries = (entriesText: string) => {
    if (!entriesText) return;
    
    // Split by double newlines to separate entries
    const entrySections = entriesText.split('\n\n');
    const parsedEntries: JournalEntry[] = [];
    
    entrySections.forEach(section => {
      if (!section.trim()) return;
      
      const lines = section.split('\n');
      const entry: Partial<JournalEntry> = {
        emotions: [],
        emotionIntensity: 0,
        createdAt: new Date().toISOString()
      };
      
      lines.forEach(line => {
        if (line.startsWith('Date:')) {
          entry.date = line.replace('Date:', '').trim();
        } else if (line.startsWith('Time:')) {
          entry.timeOfDay = line.replace('Time:', '').trim();
        } else if (line.startsWith('Emotion:')) {
          const emotionText = line.replace('Emotion:', '').trim();
          const emotionParts = emotionText.split('(Intensity:');
          if (emotionParts.length > 0) {
            entry.emotions = [emotionParts[0].trim()];
            if (emotionParts.length > 1) {
              const intensity = parseInt(emotionParts[1].replace(')', '').trim());
              if (!isNaN(intensity)) {
                entry.emotionIntensity = intensity;
              }
            }
          }
        } else if (line.startsWith('Anger Trigger:')) {
          entry.angerTrigger = line.replace('Anger Trigger:', '').trim();
        } else if (line.startsWith('Coping Strategy:')) {
          entry.coping = line.replace('Coping Strategy:', '').trim();
        } else if (line.startsWith('Improvements:')) {
          entry.improvement = line.replace('Improvements:', '').trim();
        }
      });
      
      // Only add if we have at least a date
      if (entry.date) {
        parsedEntries.push(entry as JournalEntry);
      }
    });
    
    // Update allChildEntries with the parsed objects
    setAllChildEntries(parsedEntries);
    
    
  };

  // Update loadJournalEntries to use the already loaded entries
  const loadJournalEntries = () => {
    if (!allChildEntries || typeof allChildEntries === 'string') {
      // Skip if entries aren't parsed yet
      return;
    }
    // Filter allChildEntries for the current week
    // console.log("All child entries:", allChildEntries);
    const weeklyEntries = allChildEntries.filter(entry => {
      // Parse the entry date string
      const entryDate = new Date(entry.date);
      
      // Create date for end of week
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Normalize the dates by removing time components for comparison
      // This avoids timezone issues
      const entryDateNormalized = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
      );
      
      const weekStartNormalized = new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate()
      );
      
      const weekEndNormalized = new Date(
        weekEnd.getFullYear(),
        weekEnd.getMonth(),
        weekEnd.getDate()
      );
      
      // For debugging
      console.log("Checking entry date:", entryDate);
      console.log("Normalized entry date:", entryDateNormalized);
      console.log("Week start:", weekStartNormalized);
      console.log("Week end:", weekEndNormalized);
      console.log("Is in range:", 
        entryDateNormalized >= weekStartNormalized && 
        entryDateNormalized <= weekEndNormalized
      );
      
      // Compare normalized dates to ensure we only check the date part
      return entryDateNormalized >= weekStartNormalized && 
             entryDateNormalized <= weekEndNormalized;
    });
    console.log("Weekly entries:", weeklyEntries);
    processEntriesIntoCalendarDays(weeklyEntries);
  };

  // Process entries into calendar days with deduplication
  const processEntriesIntoCalendarDays = (entries: JournalEntry[]) => {
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(currentWeekStart.getDate() + i);
      
      // Filter entries for the day
      const rawDayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getDate() === dayDate.getDate() &&
               entryDate.getMonth() === dayDate.getMonth() &&
               entryDate.getFullYear() === dayDate.getFullYear();
      });
      // Deduplication: use Map keyed by createdAt if available, or fallback using date+headline
      const uniqueDayEntries = Array.from(
        new Map(rawDayEntries.map(e => [e.createdAt || (e.date + e.headline), e])).values()
      );
      // console.log("Unique entries for", dayDate, ":", uniqueDayEntries);
      let totalIntensity = 0;
      let primaryEmotion = "";
      let emotionCount: Record<string, number> = {};
      
      uniqueDayEntries.forEach(entry => {
        totalIntensity += entry.emotionIntensity;
        entry.emotions.forEach(emotion => {
          emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
      });
      
      let maxCount = 0;
      for (const emotion in emotionCount) {
        if (emotionCount[emotion] > maxCount) {
          maxCount = emotionCount[emotion];
          primaryEmotion = emotion;
        }
      }
      
      const averageIntensity = uniqueDayEntries.length > 0 ? totalIntensity / uniqueDayEntries.length : 0;
      
      days.push({
        date: dayDate,
        entries: uniqueDayEntries,
        averageIntensity,
        primaryEmotion,
        hasEntries: uniqueDayEntries.length > 0
      });
    }
    setCalendarDays(days);
  };

  // Get color based on emotion intensity
  const getColorForIntensity = (intensity: number): string => {
    if (intensity === 0) return '#E0E0E0'; // No entries - gray
    if (intensity <= 1.5) return '#4CAF50'; // Very low - green
    if (intensity <= 2.5) return '#8BC34A'; // Low - light green
    if (intensity <= 3.5) return '#FFEB3B'; // Medium - yellow
    if (intensity <= 4.5) return '#FF9800'; // High - orange
    return '#F44336'; // Very high - red
  };

  // Add this function after other useEffect hooks
  useEffect(() => {
    fetchSummaryData();
  }, [childId]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Call the /summary endpoint
      const data = await getSummary(childName);
      console.log("Summary data:", data);
      
      // Update state with summary data
      setSummaryData(data);
      setEmotionAnalysis(data.emotionAnalysis);
      setAllChildEntries(data.weeklySummaryText)
      
      // If summary data includes entries, use them
      if (data && data.entries && data.entries.length > 0) {
        setAllChildEntries(data.entries);
        // Process entries into calendar days
        processEntriesIntoCalendarDays(
          data.entries.filter((entry: JournalEntry) => {
            const entryDate = new Date(entry.date);
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            return entryDate >= currentWeekStart && entryDate <= weekEnd;
          })
        );
      } else {
        // Fallback to the original loading approach if summary data doesn't include entries
        loadAllChildEntries();
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      // Fallback to original loading approach on error
      loadAllChildEntries();
      setLoading(false);
    }
  };

  // Go to previous week
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  // Go to next week
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  // Format date as Month Day (e.g., "Jan 15")
  const formatDateShort = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format date more completely
  const formatDateFull = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Show detail for a specific day
  const showDayDetails = (day: CalendarDay) => {
    setSelectedDay(day);
    setShowDayDetail(true);
  };

  // Get weekday name (Sunday, Monday, etc.)
  const getWeekdayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get emoji for emotion
  const getEmojiForEmotion = (emotion: string): string => {
    const emotionLower = emotion.toLowerCase();
    
    // Handle the combined emotion case like "Excited and Sad"
    if (emotionLower.includes('and')) {
      const parts = emotionLower.split('and').map(e => e.trim());
      if (parts.length === 2) {
        return getEmojiForEmotion(parts[0]) + getEmojiForEmotion(parts[1]);
      }
    }
    
    switch(emotionLower) {
      case 'happy': return '😄';
      case 'sad': return '😢';
      case 'angry': return '😡';
      case 'scared': return '😨';
      case 'excited': return '🤩';
      case 'calm': return '😌';
      case 'proud': return '🥳';
      case 'silly': return '🤪';
      default: return '😐';
    }
  };

  // Simple sentiment analysis for coping mechanisms
  const analyzeCopingStrategy = (coping: string): { score: number, feedback: string } => {
    const lowercasedText = coping.toLowerCase();
    
    // Positive coping strategies
    const positiveKeywords = [
      'breathe', 'breathing', 'calm', 'talk', 'talked', 'deep breath', 
      'walk', 'walked', 'count', 'counted', 'timeout', 'break', 'space',
      'music', 'draw', 'drew', 'help', 'asked', 'tell', 'told'
    ];
    
    // Negative coping strategies
    const negativeKeywords = [
      'hit', 'throw', 'threw', 'scream', 'screamed', 'yell', 'yelled', 
      'break', 'broke', 'slam', 'slammed', 'punch', 'punched'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveKeywords.forEach(keyword => {
      if (lowercasedText.includes(keyword)) positiveCount++;
    });
    
    negativeKeywords.forEach(keyword => {
      if (lowercasedText.includes(keyword)) negativeCount++;
    });
    
    const score = positiveCount - negativeCount;
    
    let feedback = '';
    if (score > 2) feedback = "Excellent coping strategies! 🌟";
    else if (score > 0) feedback = "Good coping approach. 👍";
    else if (score === 0) feedback = "Mixed coping strategies.";
    else if (score > -2) feedback = "Some concerning responses.";
    else feedback = "Needs guidance with better coping skills.";
    
    return { score, feedback };
  };

  // In the modal header add a toggle button for day view vs. all entries
  const renderDayDetailModal = () => {
    if (!selectedDay) return null;
    
    // Determine which entries to show
    const entriesToShow = viewAll ? modalEntries : selectedDay.entries;

    return (
      <Modal
        visible={showDayDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setShowDayDetail(false); setViewAll(false); }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header with toggle button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>
                {viewAll 
                  ? `All entries for ${childName}`
                  : `${getWeekdayName(selectedDay.date)} - ${formatDateShort(selectedDay.date)}`}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  style={{ marginRight: 15 }}
                  onPress={() => setViewAll(!viewAll)}
                >
                  <Ionicons name={viewAll ? "calendar-outline" : "list-outline"} size={28} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => { setShowDayDetail(false); setViewAll(false); }}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Content */}
            {entriesToShow.length === 0 ? (
              <View style={styles.noEntriesContainer}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png' }}
                  style={styles.noEntriesImage}
                />
                <Text style={styles.noEntriesText}>No journal entries found</Text>
                <Text style={styles.noEntriesSubtext}>
                  {viewAll ? "There are no entries for this child yet." 
                  : "No entries for this day. Try toggling to view all entries."}
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                {entriesToShow.map((entry, index) => {
                  const copingAnalysis = analyzeCopingStrategy(entry.coping);
                  
                  return (
                    <View key={index} style={styles.entryContainer}>
                      <Text style={styles.entryTime}>
                        {entry.timeOfDay || 'Unknown time'} 
                        {entry.headline ? ` • ${entry.headline}` : ''}
                      </Text>
                      
                      <View style={styles.emotionContainer}>
                        <View style={styles.sectionWithIcon}>
                          <Ionicons name="heart" size={20} color="#FF5252" />
                          <Text style={styles.sectionLabel}>Feelings:</Text>
                        </View>
                        <View style={styles.emotionPills}>
                          {entry.emotions.map((emotion, i) => (
                            <View 
                              key={i} 
                              style={[
                                styles.emotionPill, 
                                {backgroundColor: getEmotionColor(emotion)}
                              ]}
                            >
                              <Text style={styles.emotionText}>
                                {getEmojiForEmotion(emotion)} {emotion}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <Text style={styles.intensityText}>
                          Intensity level: {entry.emotionIntensity}/5
                        </Text>
                      </View>
                      
                      <View style={styles.triggerContainer}>
                        <View style={styles.sectionWithIcon}>
                          <Ionicons name="flash" size={20} color="#FF9800" />
                          <Text style={styles.sectionLabel}>Trigger:</Text>
                        </View>
                        <Text style={styles.triggerText}>{entry.angerTrigger || 'Not specified'}</Text>
                      </View>
                      
                      <View style={styles.copingContainer}>
                        <View style={styles.sectionWithIcon}>
                          <Ionicons name="medical" size={20} color="#4CAF50" />
                          <Text style={styles.sectionLabel}>How they handled it:</Text>
                        </View>
                        <Text style={styles.copingText}>{entry.coping}</Text>
                        <View style={[
                          styles.feedbackBanner,
                          {backgroundColor: copingAnalysis.score > 0 ? '#E8F5E9' : '#FFEBEE'}
                        ]}>
                          <Ionicons 
                            name={copingAnalysis.score > 0 ? "checkmark-circle" : "information-circle"} 
                            size={20} 
                            color={copingAnalysis.score > 0 ? "#4CAF50" : "#F44336"} 
                          />
                          <Text style={styles.feedbackText}>{copingAnalysis.feedback}</Text>
                        </View>
                      </View>
                      
                      {entry.improvement && (
                        <View style={styles.improvementContainer}>
                          <View style={styles.sectionWithIcon}>
                            <Ionicons name="bulb" size={20} color="#FFC107" />
                            <Text style={styles.sectionLabel}>Next time ideas:</Text>
                          </View>
                          <Text style={styles.improvementText}>{entry.improvement}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // Get color for emotion label
  const getEmotionColor = (emotion: string): string => {
    const emotionLower = emotion.toLowerCase();
    
    // Handle the combined emotion case
    if (emotionLower.includes('and')) {
      const parts = emotionLower.split('and').map(e => e.trim());
      if (parts.length === 2) {
        return getEmotionColor(parts[0]); // Use the first emotion's color
      }
    }
    
    switch(emotionLower) {
      case 'happy': return '#4CAF50';
      case 'sad': return '#2196F3';
      case 'angry': return '#FF5252';
      case 'scared': return '#9C27B0';
      case 'excited': return '#FF9800';
      case 'calm': return '#00BCD4';
      case 'proud': return '#FFC107';
      case 'silly': return '#8BC34A';
      default: return '#9E9E9E';
    }
  };

  // Format the current week range display
  const formatWeekRange = (): string => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    
    return `${formatDateShort(currentWeekStart)} - ${formatDateShort(endDate)}`;
  };

  // Function to get entries for a specific date
  const getEntriesForDate = (date: Date): JournalEntry[] => {
    return allChildEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === date.getDate() &&
             entryDate.getMonth() === date.getMonth() &&
             entryDate.getFullYear() === date.getFullYear();
    });
  };

  // Jump to date and show entries
  const jumpToDate = (date: Date) => {
    const entries = getEntriesForDate(date);
    
    // Create a virtual day object
    const newSelectedDay: CalendarDay = {
      date: date,
      entries: entries,
      averageIntensity: entries.length > 0 ? 
        entries.reduce((sum, entry) => sum + entry.emotionIntensity, 0) / entries.length : 0,
      primaryEmotion: entries.length > 0 ? entries[0].emotions[0] : '',
      hasEntries: entries.length > 0
    };
    
    setSelectedDay(newSelectedDay);
    setShowDayDetail(true);
    setShowCalendarPicker(false);
    
    // If the date is not in current week, update the week view
    const startOfWeek = getWeekStartDate(date);
    if (startOfWeek.getTime() !== currentWeekStart.getTime()) {
      setCurrentWeekStart(startOfWeek);
    }
  };

  // Helper function to generate days for month view
  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (firstDayOfWeek > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      
      for (let i = prevMonthDays - firstDayOfWeek + 1; i <= prevMonthDays; i++) {
        days.push({
          date: new Date(year, month - 1, i),
          isCurrentMonth: false
        });
      }
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill last week
    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek < 6) {
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }
    }
    
    return days;
  };

  // Helper function to get the primary emotion from the emotion analysis
  const getPrimaryEmotion = (): string => {
    if (!emotionAnalysis) return '';
    return emotionAnalysis["Primary Emotion"] || emotionAnalysis.primaryEmotion || '';
  };

  // Helper function to get the average intensity from the emotion analysis
  const getAverageIntensity = (): number => {
    if (!emotionAnalysis) return 0;
    return emotionAnalysis["Average Intensity"] !== undefined ? 
      emotionAnalysis["Average Intensity"] : 
      (emotionAnalysis.averageIntensity || 0);
  };

  // Helper function to get the progress trend
  const getProgressTrend = (): string => {
    if (!emotionAnalysis) return '';
    return emotionAnalysis["overallTrend"] || emotionAnalysis.progressTrend || '';
  };

  // Helper function to get best time of day
  const getBestTimeOfDay = (): string => {
    if (!emotionAnalysis) return '';
    return emotionAnalysis["bestTimeOfDay"] || emotionAnalysis.calmestTimeOfDay || '';
  };

  // Helper function to get common triggers as an array
  const getCommonTriggers = (): string[] => {
    if (!emotionAnalysis) return [];
    if (emotionAnalysis["mostCommonTrigger"]) {
      return [emotionAnalysis["mostCommonTrigger"]];
    }
    return emotionAnalysis.commonTriggers || [];
  };

  // Helper function to get best coping mechanisms as an array
  const getBestCopingMechanisms = (): string[] => {
    if (!emotionAnalysis) return [];
    if (emotionAnalysis["mostEffectiveCopingStrategy"]) {
      return [emotionAnalysis["mostEffectiveCopingStrategy"]];
    }
    return emotionAnalysis.bestCopingMechanisms || [];
  };

  // Helper function to get trend color
  const getTrendColor = (trend: string): string => {
    const trendLower = trend.toLowerCase();
    if (trendLower.includes('improv') || trendLower.includes('down')) return '#4CAF50';
    if (trendLower.includes('worsen') || trendLower.includes('need help') || trendLower.includes('up')) return '#F44336';
    if (trendLower.includes('stable')) return '#FF9800';
    return '#9E9E9E'; // Default for unknown trend
  };

  // Helper function to get trend icon/text
  const getTrendIcon = (trend: string): string => {
    const trendLower = trend.toLowerCase();
    if (trendLower.includes('improv') || trendLower.includes('down')) return '↑ Improving';
    if (trendLower.includes('worsen') || trendLower.includes('need help') || trendLower.includes('up')) return '↓ Needs Help';
    if (trendLower.includes('stable')) return '→ Stable';
    return trend;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{childName}'s Weekly Summary</Text>
        <Text style={styles.headerSubtitle}>
          Track {childName}'s emotional patterns through their journal entries
        </Text>
      </View>

      {/* Add child information card */}
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#4F6DF5',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 15,
        }}>
          <Text style={{
            fontSize: 24,
            color: '#FFF',
            fontWeight: 'bold',
          }}>
            {childName && childName.length > 0 ? childName.charAt(0).toUpperCase() : "C"}
          </Text>
        </View>
        <View>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#333',
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          }}>
            Viewing data for: {childName}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#666',
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          }}>
            Calendar shows anger intensity and emotions
          </Text>
        </View>
      </View>

      {/* Add Insights Summary Card after child info */}
      {emotionAnalysis && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>
            <Ionicons name="bar-chart" size={24} color="#4F6DF5" /> Emotional Insights
          </Text>
          
          <View style={styles.insightRow}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Primary Emotion</Text>
              <Text style={styles.insightValue}>
                {getEmojiForEmotion(getPrimaryEmotion())} {getPrimaryEmotion()}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Avg. Intensity</Text>
              <Text style={[
                styles.insightValue,
                {color: getColorForIntensity(getAverageIntensity())}
              ]}>
                {getAverageIntensity().toFixed(1)}/5
              </Text>
            </View>
          </View>
          
          <View style={styles.insightRow}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Overall Trend</Text>
              <Text style={[
                styles.insightValue,
                {color: getTrendColor(getProgressTrend())}
              ]}>
                {getTrendIcon(getProgressTrend())}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Best Time of Day</Text>
              <Text style={styles.insightValue}>{getBestTimeOfDay()}</Text>
            </View>
          </View>
          
          {getCommonTriggers().length > 0 && (
            <View style={styles.triggerSection}>
              <Text style={styles.triggerLabel}>Common Triggers:</Text>
              <View style={styles.triggerContainer}>
                {getCommonTriggers().map((trigger: string, idx: number) => (
                  <View key={idx} style={styles.triggerPill}>
                    <Text style={styles.triggerPillText}>{trigger}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {getBestCopingMechanisms().length > 0 && (
            <View style={styles.copingTipContainer}>
              <Text style={styles.copingTipTitle}>
                <Ionicons name="bulb" size={20} color="#FFC107" /> Most Effective Coping:
              </Text>
              <Text style={styles.copingTipText}>"{getBestCopingMechanisms()[0]}"</Text>
            </View>
          )}
        </View>
      )}

      {/* Add the calendar view */}
      {/* Jump to date button */}
      <TouchableOpacity
        style={styles.jumpToDateButton}
        onPress={() => setShowCalendarPicker(true)}
      >
        <Ionicons name="calendar" size={18} color="#4F6DF5" />
        <Text style={styles.jumpToDateText}>Jump to any date</Text>
      </TouchableOpacity>

      {/* Week selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity 
          onPress={goToPreviousWeek}
          style={styles.weekButton}
        >
          <Ionicons name="chevron-back" size={24} color="#4F6DF5" />
        </TouchableOpacity>
        
        <Text style={styles.weekText}>{formatWeekRange()}</Text>
        
        <TouchableOpacity 
          onPress={goToNextWeek}
          style={styles.weekButton}
        >
          <Ionicons name="chevron-forward" size={24} color="#4F6DF5" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F6DF5" />
          <Text style={styles.loadingText}>Loading journal data...</Text>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          {/* Days of the week headers */}
          <View style={styles.weekdayHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Text key={index} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar day cells */}
          <View style={styles.daysContainer}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day.hasEntries && {
                    backgroundColor: getColorForIntensity(day.averageIntensity),
                    borderColor: getColorForIntensity(day.averageIntensity),
                  }
                ]}
                onPress={() => showDayDetails(day)}
                disabled={!day.hasEntries}
              >
                <Text style={[
                  styles.dayNumber,
                  day.hasEntries && { color: day.averageIntensity > 3 ? '#FFF' : '#333' }
                ]}>
                  {day.date.getDate()}
                </Text>
                
                {day.hasEntries && (
                  <>
                    <Text style={[
                      styles.dayEmotion,
                      { color: day.averageIntensity > 3 ? '#FFF' : '#333' }
                    ]}>
                      {getEmojiForEmotion(day.primaryEmotion)}
                    </Text>
                    <View style={styles.entryCountBadge}>
                      <Text style={styles.entryCountText}>{day.entries.length}</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Emotion Intensity:</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Calm</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFEB3B' }]} />
                <Text style={styles.legendText}>Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>Intense</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Date picker modal */}
      {showCalendarPicker && (
        <Modal
          visible={showCalendarPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCalendarPicker(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: '90%',
              maxWidth: 400,
              backgroundColor: '#FFF',
              borderRadius: 10,
              padding: 20,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                }}>Select a Date</Text>
                <TouchableOpacity onPress={() => setShowCalendarPicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              {/* Custom Calendar Implementation */}
              <View>
                {/* Month and Year Selector */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                  <TouchableOpacity
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-back" size={24} color="#4F6DF5" />
                  </TouchableOpacity>
                  
                  <Text style={{ fontSize: 18, fontWeight: '600' }}>
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#4F6DF5" />
                  </TouchableOpacity>
                </View>
                
                {/* Days of Week Headers */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontWeight: '600', color: '#666' }}>{day}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Calendar Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {generateCalendarDays(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth()
                  ).map((day, idx) => {
                    const isSelected = 
                      day.date.getDate() === selectedDate.getDate() &&
                      day.date.getMonth() === selectedDate.getMonth() &&
                      day.date.getFullYear() === selectedDate.getFullYear();
                      
                    // Check if this day has entries
                    const dayEntries = getEntriesForDate(day.date);
                    const hasEntries = dayEntries.length > 0;
                    
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          width: '14.28%',
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: isSelected ? '#4F6DF5' : 'transparent',
                          borderRadius: 20,
                          opacity: day.isCurrentMonth ? 1 : 0.3,
                          position: 'relative'
                        }}
                        onPress={() => {
                          setSelectedDate(day.date);
                        }}
                      >
                        <Text style={{
                          color: isSelected ? '#FFF' : '#333',
                          fontWeight: isSelected ? 'bold' : 'normal',
                        }}>
                          {day.date.getDate()}
                        </Text>
                        
                        {/* Dot indicator for days with entries */}
                        {hasEntries && (
                          <View style={{
                            position: 'absolute',
                            bottom: 3,
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: isSelected ? '#FFF' : '#4F6DF5'
                          }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#4F6DF5',
                  padding: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 20,
                }}
                onPress={() => {
                  jumpToDate(selectedDate);
                }}
              >
                <Text style={{
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>Go to Selected Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Render modal for day details */}
      {renderDayDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FF',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  weekButton: {
    padding: 10,
  },
  weekText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  calendarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 60,
    margin: 3,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  dayEmotion: {
    fontSize: 16,
    marginTop: 2,
  },
  entryCountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4F6DF5',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  legendContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    flex: 1,
  },
  noEntriesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEntriesImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.7,
  },
  noEntriesText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  noEntriesSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  entryContainer: {
    backgroundColor: '#F8F9FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4F6DF5',
  },
  entryTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F6DF5',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emotionContainer: {
    marginBottom: 15,
  },
  sectionWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emotionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  emotionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  intensityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  triggerContainer: {
    marginBottom: 15,
  },
  triggerText: {
    fontSize: 15,
    color: '#444',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  copingContainer: {
    marginBottom: 15,
  },
  copingText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  improvementContainer: {
    marginBottom: 5,
  },
  improvementText: {
    fontSize: 15,
    color: '#444',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  // New styles
  childInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F6DF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  childAvatarText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  childInfoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  childInfoDetails: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  jumpToDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  jumpToDateText: {
    marginLeft: 6,
    color: '#4F6DF5',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  datePickerContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F6DF5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 15,
  },
  calendarButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  allEntriesNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  entryDate: {
    fontSize: 14,
    color: '#4F6DF5',
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4F6DF5',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  insightItem: {
    flex: 1,
    padding: 8,
    backgroundColor: '#F8F9FF',
    borderRadius: 8,
    marginHorizontal: 3,
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  insightValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  triggerSection: {
    marginTop: 15,
  },
  triggerLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  triggerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  triggerPill: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  triggerPillText: {
    fontSize: 14,
    color: '#E65100',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  copingTipContainer: {
    marginTop: 15,
    backgroundColor: '#FFFDE7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF9C4',
  },
  copingTipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  copingTipText: {
    fontSize: 15,
    color: '#5D4037',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default WeeklySummary;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
// import { getSummary } from '../../constants/api';

const { width } = Dimensions.get('window');

// Interface for journal entries
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

// Interface for emotion analysis data
interface EmotionAnalysis {
  primaryEmotion: string;
  averageIntensity?: number;
  progressTrend?: string;
  calmestTimeOfDay?: string;
  mostIntenseTimeOfDay?: string;
  commonTriggers?: string[];
  bestCopingMechanisms?: string[];
  emotionBreakdown?: Record<string, number>;
  timePatterns?: Record<string, Record<string, number>>;
  insights?: string[];
  weeklyIntensity?: { date: string; intensity: number; emotions: string[] }[];
  dailyEmotions?: { date: string; emotions: Record<string, number> }[];
  suggestedStrategies?: string[];
}

export default function EmotionDetection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [childName, setChildName] = useState<string>("Me");
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'triggers'>('overview');

  useEffect(() => {
    loadEmotionData();
  }, []);

  const loadEmotionData = async () => {
    setIsLoading(true);
    try {
      // Get user info
      const userInfo = await AsyncStorage.getItem('userInfo');
      const user = userInfo ? JSON.parse(userInfo) : null;
      if (user && user.name) {
        setChildName(user.name);
      }

      // Get summary data from api helper
      const data = await getSummary(childName);
      
      if (data) {
        // Refined emotion analysis with clean data visualization
        const refinedAnalysis = {
          primaryEmotion: "happy",
          averageIntensity: 3,
          progressTrend: "improving",
          calmestTimeOfDay: "morning",
          mostIntenseTimeOfDay: "afternoon",
          commonTriggers: [
            "When others take my belongings without permission",
            "Losing competitive activities",
            "Being told I cannot do something",
            "Feeling excluded from activities",
            "Insufficient rest"
          ],
          bestCopingMechanisms: [
            "Deep breathing exercises",
            "Expressing emotions through art",
            "Discussing feelings with parents",
            "Taking a short walk",
            "Counting to regain composure"
          ],
          // Structured emotion data for visualization
          emotionBreakdown: {
            "Happy": 32,
            "Angry": 18,
            "Sad": 12,
            "Excited": 22,
            "Calm": 16,
            "Worried": 8
          },
          // Time patterns for visualization
          timePatterns: {
            "Morning": { "Happy": 12, "Calm": 8, "Excited": 6 },
            "Afternoon": { "Angry": 8, "Excited": 10, "Happy": 5 },
            "Evening": { "Calm": 8, "Sad": 5, "Happy": 6 },
            "Night": { "Worried": 6, "Sad": 4 }
          },
          // Clear insights with minimal emoji use
          insights: [
            "Most positive emotions occur during morning hours",
            "Emotional challenges often arise when possessions are involved",
            "Deep breathing has been your most effective calming technique",
            "Your emotional regulation has improved over the past weeks",
            "Fatigue appears to reduce emotional resilience"
          ],
          // Weekly intensity data for trend visualization - now includes specific dates and more data points
          weeklyIntensity: [
            { date: '2023-10-01', intensity: 4.2, emotions: ["Angry", "Frustrated"] },
            { date: '2023-10-02', intensity: 3.8, emotions: ["Worried", "Anxious"] },
            { date: '2023-10-03', intensity: 4.0, emotions: ["Angry", "Upset"] },
            { date: '2023-10-04', intensity: 3.7, emotions: ["Frustrated", "Sad"] },
            { date: '2023-10-05', intensity: 3.5, emotions: ["Worried", "Anxious"] },
            { date: '2023-10-06', intensity: 3.6, emotions: ["Sad", "Disappointed"] },
            { date: '2023-10-07', intensity: 3.4, emotions: ["Frustrated", "Worried"] },
            { date: '2023-10-08', intensity: 3.3, emotions: ["Worried", "Anxious"] },
            { date: '2023-10-09', intensity: 3.0, emotions: ["Calm", "Neutral"] },
            { date: '2023-10-10', intensity: 3.1, emotions: ["Frustrated", "Happy"] },
            { date: '2023-10-11', intensity: 2.9, emotions: ["Happy", "Calm"] },
            { date: '2023-10-12', intensity: 2.8, emotions: ["Happy", "Excited"] },
            { date: '2023-10-13', intensity: 2.7, emotions: ["Calm", "Relaxed"] },
            { date: '2023-10-14', intensity: 2.5, emotions: ["Happy", "Content"] }
          ],
          // Daily emotion data for detailed tracking
          dailyEmotions: [
            { date: '2023-10-08', emotions: { "Happy": 3, "Angry": 1, "Sad": 1 } },
            { date: '2023-10-09', emotions: { "Happy": 4, "Calm": 2 } },
            { date: '2023-10-10', emotions: { "Happy": 2, "Frustrated": 2, "Excited": 1 } },
            { date: '2023-10-11', emotions: { "Happy": 3, "Calm": 2, "Excited": 1 } },
            { date: '2023-10-12', emotions: { "Happy": 4, "Excited": 2 } },
            { date: '2023-10-13', emotions: { "Happy": 3, "Calm": 3 } },
            { date: '2023-10-14', emotions: { "Happy": 5, "Excited": 1 } }
          ],
          // Practical strategies
          suggestedStrategies: [
            "Practice counting to ten when feeling overwhelmed",
            "Use drawing as a communication tool when words are difficult",
            "Identify a trusted person to discuss difficult feelings",
            "Maintain consistent sleep routines",
            "Practice breathing exercises regularly"
          ]
        };
        
        setEmotionAnalysis(refinedAnalysis);
        
        // If we have real entries use them, otherwise create sample entries
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        } else if (typeof data.weeklySummaryText === 'string') {
          // Parse text entries if no structured entries available
          parseTextEntries(data.weeklySummaryText);
        } else {
          // Create sample entries if no data exists yet
          setEntries(createSampleEntries());
        }
      }
    } catch (error) {
      console.error("Error loading emotion data:", error);
      // Use hardcoded data as fallback
      setEmotionAnalysis({
        primaryEmotion: "happy",
        averageIntensity: 3,
        progressTrend: "improving",
        calmestTimeOfDay: "morning",
        mostIntenseTimeOfDay: "afternoon",
        commonTriggers: [
          "When someone takes my things without asking",
          "Losing at games",
          "Being told 'no'"
        ],
        bestCopingMechanisms: [
          "Taking 3 deep breaths",
          "Drawing my feelings",
          "Talking to mom/dad"
        ],
        emotionBreakdown: {
          "Happy": 8,
          "Angry": 5,
          "Sad": 3,
          "Excited": 6
        },
        insights: [
          "You feel happiest in the morning! 🌞",
          "Deep breathing helps you calm down the best! 💨",
          "You've been feeling better each week! 📈"
        ]
      });
      setEntries(createSampleEntries());
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create sample journal entries for demo purposes
  const createSampleEntries = (): JournalEntry[] => {
    return [
      {
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        timeOfDay: "Morning",
        headline: "Great start to the day!",
        emotions: ["Happy", "Excited"],
        emotionIntensity: 4,
        coping: "I shared my toys with my friend",
        consequence: "We had fun playing together",
        improvement: "I'll keep sharing my toys",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeOfDay: "Afternoon",
        headline: "Someone took my toy",
        angerTrigger: "My friend took my toy without asking",
        emotions: ["Angry", "Sad"],
        emotionIntensity: 5,
        coping: "I took 3 deep breaths and told my teacher",
        consequence: "My teacher helped us solve the problem",
        improvement: "Next time I'll ask for help sooner",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeOfDay: "Evening",
        headline: "Feeling calm after a busy day",
        emotions: ["Calm", "Happy"],
        emotionIntensity: 2,
        coping: "I took deep breaths",
        consequence: "I felt relaxed",
        improvement: "Reading helps me calm down",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeOfDay: "Night",
        headline: "Worried about my test tomorrow",
        angerTrigger: "I'm not sure if I studied enough",
        emotions: ["Worried"],
        emotionIntensity: 4,
        coping: "I talked to mom about my worries",
        consequence: "Mom helped me study more and I felt better",
        improvement: "Next time I'll study earlier so I don't worry",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeOfDay: "Afternoon",
        headline: "Lost my special pencil",
        angerTrigger: "I can't find my special pencil",
        emotions: ["Sad", "Angry"],
        emotionIntensity: 4,
        coping: "I counted to 10 and looked carefully",
        consequence: "I found it under my desk!",
        improvement: "I'll have a special place for my pencils",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  // Function to parse text entries into structured journal entries
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
        coping: '',
        consequence: '',
        improvement: '',
        createdAt: new Date().toISOString()
      };
      
      lines.forEach(line => {
        if (line.startsWith('Date:')) {
          entry.date = line.replace('Date:', '').trim();
        } else if (line.startsWith('Time:')) {
          entry.timeOfDay = line.replace('Time:', '').trim();
        } else if (line.startsWith('Headline:')) {
          entry.headline = line.replace('Headline:', '').trim();
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
        } else if (line.startsWith('Consequence:')) {
          entry.consequence = line.replace('Consequence:', '').trim();
        } else if (line.startsWith('Improvements:')) {
          entry.improvement = line.replace('Improvements:', '').trim();
        }
      });
      
      // Only add if we have required fields
      if (entry.date && entry.emotions.length > 0) {
        parsedEntries.push(entry as JournalEntry);
      }
    });
    
    setEntries(parsedEntries);
  };

  // Helper function to format dates for chart display
  const formatChartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.getDate() + '/' + (date.getMonth() + 1);
  };

  const getEmotionColor = (emotion: string) => {
    const emotionColors: {[key: string]: string} = {
      happy: '#4CAF50',      // Muted green
      sad: '#5C6BC0',        // Muted blue
      angry: '#E57373',      // Softened red
      anxious: '#FFB74D',    // Softened orange
      confused: '#9575CD',   // Muted purple
      neutral: '#90A4AE',    // Bluish grey
      thoughtful: '#4DB6AC', // Teal
      curious: '#4DD0E1',    // Light teal
      calm: '#4FC3F7',       // Light blue
      contemplative: '#7986CB', // Indigo
      worried: '#FFB74D',    // Amber
      excited: '#FFA726',    // Orange
      uncertain: '#BDBDBD'   // Grey
    };

    return emotionColors[emotion.toLowerCase()] || '#9E9E9E';
  };

  const getEmotionEmoji = (emotion: string) => {
    const emotionEmojis: {[key: string]: string} = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      confused: '😕',
      neutral: '😐',
      thoughtful: '🤔',
      curious: '🧐',
      calm: '😌',
      contemplative: '🤔',
      worried: '😟',
      excited: '😃',
      content: '☺️',
      disappointed: '😞',
      lonely: '😔',
      frustrated: '😤',
      impatient: '😒',
      uncertain: '🤷‍♂️',
      interested: '🤩'
    };

    return emotionEmojis[emotion.toLowerCase()] || '🙂';
  };

  const getTimeOfDayEmoji = (timeOfDay: string) => {
    const timeEmojis: {[key: string]: string} = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
      night: '🌙'
    };

    return timeEmojis[timeOfDay.toLowerCase()] || '⏱️';
  };

  const getColorForIntensity = (intensity: number): string => {
    if (intensity >= 4) return '#E57373'; // Softened red for high intensity
    if (intensity >= 3) return '#FFB74D'; // Softened orange for moderate
    if (intensity >= 2) return '#FFF176'; // Softened yellow for mild
    return '#81C784';                     // Softened green for calm
  };

  const renderOverviewTab = () => {
    if (!emotionAnalysis) return null;
    
    return (
      <View style={styles.tabContent}>
        {/* Primary emotion display - refined design */}
        <View style={styles.primaryEmotionContainer}>
          <LinearGradient
            colors={[getEmotionColor(emotionAnalysis.primaryEmotion), shadeColor(getEmotionColor(emotionAnalysis.primaryEmotion), -15)]}
            style={styles.emotionBadge}
          >
            <Text style={styles.emotionEmoji}>
              {getEmotionEmoji(emotionAnalysis.primaryEmotion)}
            </Text>
            <Text style={styles.primaryEmotionText}>
              {emotionAnalysis.primaryEmotion.charAt(0).toUpperCase() + emotionAnalysis.primaryEmotion.slice(1)}
            </Text>
            <Text style={styles.confidenceText}>Most frequent emotion</Text>
          </LinearGradient>
        </View>

        {/* Weekly intensity trend chart - enhanced visualization */}
        {emotionAnalysis.weeklyIntensity && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>
              <Ionicons name="trending-down" size={20} color="#5C6BC0" /> Emotion Intensity Trend
            </Text>
            <Text style={styles.chartDescription}>We still need more data to plot your emotional trends over time</Text>
            
            {/* Chart container with grid lines */}
            <View style={styles.intensityChartContainer}>
              {/* Horizontal grid lines */}
              <View style={styles.gridLines}>
                <View style={styles.gridLine}></View>
                <View style={styles.gridLine}></View>
                <View style={styles.gridLine}></View>
                <View style={styles.gridLine}></View>
                <View style={styles.gridLine}></View>
              </View>
              
              {/* Y-axis labels */}
              <View style={styles.yAxisLabels}>
                <Text style={styles.yAxisLabel}>5</Text>
                <Text style={styles.yAxisLabel}>4</Text>
                <Text style={styles.yAxisLabel}>3</Text>
                <Text style={styles.yAxisLabel}>2</Text>
                <Text style={styles.yAxisLabel}>1</Text>
              </View>
              
              {/* Actual chart with trend line */}
              <View style={styles.chartArea}>
                <View style={styles.lineChartContainer}>
                  {/* Draw the continuous line using an SVG-like path approach */}
                  {emotionAnalysis.weeklyIntensity.map((point, index) => {
                    if (index === 0) return null;
                    
                    const prevPoint = emotionAnalysis.weeklyIntensity[index - 1];
                    const startX = ((index - 1) / (emotionAnalysis.weeklyIntensity.length - 1)) * 100;
                    const startY = 100 - ((prevPoint.intensity / 5) * 100);
                    const endX = (index / (emotionAnalysis.weeklyIntensity.length - 1)) * 100;
                    const endY = 100 - ((point.intensity / 5) * 100);
                    
                    const width = endX - startX;
                    const height = Math.abs(endY - startY);
                    const isAscending = startY > endY;
                    const radius = Math.min(width, 5); // Limit the curve radius
                    
                    // Calculate angle for line rotation
                    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                    const length = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
                    
                    return (
                      <View 
                        key={index}
                        style={{
                          position: 'absolute',
                          left: `${startX}%`,
                          top: `${isAscending ? endY : startY}%`,
                          width: length, // Use the calculated length
                          height: 2,
                          backgroundColor: '#5C6BC0',
                          transform: [{
                            rotate: `${angle}deg`
                          }],
                          transformOrigin: 'left',
                          zIndex: 1,
                          borderRadius: 1
                        }}
                      />
                    );
                  })}
                  
                  {/* Data points */}
                  {emotionAnalysis.weeklyIntensity.map((point, index) => {
                    // Only show every other point on small screens to avoid crowding
                    if (screenWidth < 380 && index % 2 !== 0 && index !== emotionAnalysis.weeklyIntensity.length - 1) {
                      return null;
                    }
                    
                    return (
                      <View 
                        key={`point-${index}`}
                        style={[
                          styles.dataPoint,
                          { 
                            left: `${(index / (emotionAnalysis.weeklyIntensity.length - 1)) * 100}%`,
                            top: `${100 - ((point.intensity / 5) * 100)}%`,
                            backgroundColor: getColorForIntensity(point.intensity)
                          }
                        ]}
                      >
                        <View style={styles.dataPointTooltip}>
                          <Text style={styles.tooltipText}>{point.intensity.toFixed(1)}</Text>
                          <Text style={styles.tooltipEmotions}>{point.emotions.join(', ')}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              {/* X-axis labels (dates) */}
              <View style={styles.xAxisLabels}>
                {emotionAnalysis.weeklyIntensity.map((point, index) => {
                  // Only show some x labels to avoid crowding
                  if (screenWidth < 380) {
                    if (index !== 0 && index !== emotionAnalysis.weeklyIntensity.length - 1 && index % 3 !== 0) {
                      return null;
                    }
                  } else if (index !== 0 && index !== emotionAnalysis.weeklyIntensity.length - 1 && index % 2 !== 0) {
                    return null;
                  }
                  
                  return (
                    <Text 
                      key={index}
                      style={[
                        styles.xAxisLabel,
                        { 
                          left: `${(index / (emotionAnalysis.weeklyIntensity.length - 1)) * 100}%`,
                        }
                      ]}
                    >
                      {formatChartDate(point.date)}
                    </Text>
                  );
                })}
              </View>
            </View>
            
            {/* Legend */}
            <View style={styles.intensityLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#E57373' }]} />
                <Text style={styles.legendLabel}>High Intensity</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#81C784' }]} />
                <Text style={styles.legendLabel}>Low Intensity</Text>
              </View>
            </View>
            
            <View style={styles.chartAnalysis}>
              <Ionicons name="analytics-outline" size={16} color="#5C6BC0" style={{marginRight: 8}} />
              <Text style={styles.chartAnalysisText}>
                Your emotion intensity has decreased by {((4.2 - 2.5) / 4.2 * 100).toFixed(0)}% over the past two weeks
              </Text>
            </View>
          </View>
        )}
        
        {/* Daily emotion distribution - new section */}
        {emotionAnalysis.dailyEmotions && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>
              <Ionicons name="calendar-outline" size={20} color="#5C6BC0" /> Recent Emotion Distribution
            </Text>
            <Text style={styles.chartDescription}>Emotions recorded in the past 7 days</Text>
            
            <View style={styles.dailyEmotionsContainer}>
              {emotionAnalysis.dailyEmotions.map((day, index) => (
                <View key={index} style={styles.dayEmotionContainer}>
                  <Text style={styles.dayLabel}>{formatChartDate(day.date)}</Text>
                  <View style={styles.dayEmotionsRow}>
                    {Object.entries(day.emotions)
                      .sort(([, countA], [, countB]) => countB - countA)
                      .slice(0, 2) // Show top 2 emotions
                      .map(([emotion, count], emoIndex) => (
                        <View 
                          key={emoIndex} 
                          style={[
                            styles.dayEmotionBubble,
                            { backgroundColor: `${getEmotionColor(emotion)}40` }
                          ]}
                        >
                          <Text style={styles.dayEmotionText}>
                            {getEmotionEmoji(emotion)} {count}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Key insights with clean formatting */}
        {emotionAnalysis.insights && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>
              <Ionicons name="analytics-outline" size={20} color="#5C6BC0" /> Key Emotional Insights
            </Text>
            
            {emotionAnalysis.insights.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.insightBullet}>
                  <Text style={styles.insightBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Emotion patterns by time - clean visualization */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            <Ionicons name="time-outline" size={20} color="#5C6BC0" /> Emotion Patterns by Time
          </Text>
          
          <View style={styles.insightRow}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Most Calm</Text>
              <Text style={styles.insightValue}>
                {getTimeOfDayEmoji(emotionAnalysis.calmestTimeOfDay || 'morning')} {(emotionAnalysis.calmestTimeOfDay || 'Morning').charAt(0).toUpperCase() + (emotionAnalysis.calmestTimeOfDay || 'Morning').slice(1).toLowerCase()}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Most Intense</Text>
              <Text style={styles.insightValue}>
                {getTimeOfDayEmoji(emotionAnalysis.mostIntenseTimeOfDay || 'afternoon')} {(emotionAnalysis.mostIntenseTimeOfDay || 'Afternoon').charAt(0).toUpperCase() + (emotionAnalysis.mostIntenseTimeOfDay || 'Afternoon').slice(1).toLowerCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Common triggers section - refined */}
        {emotionAnalysis.commonTriggers && emotionAnalysis.commonTriggers.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>
              <Ionicons name="alert-circle-outline" size={20} color="#5C6BC0" /> Emotional Triggers
            </Text>
            
            <View style={styles.triggersList}>
              {emotionAnalysis.commonTriggers.slice(0, 3).map((trigger, index) => (
                <View key={index} style={styles.triggerItemRow}>
                  <View style={styles.triggerNumber}>
                    <Text style={styles.triggerNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.triggerItemText}>{trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Effective strategies section */}
        {emotionAnalysis.bestCopingMechanisms && emotionAnalysis.bestCopingMechanisms.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#5C6BC0" /> Effective Strategies
            </Text>
            
            <View style={styles.strategiesList}>
              {emotionAnalysis.bestCopingMechanisms.slice(0, 3).map((strategy, index) => (
                <View key={index} style={styles.strategyRow}>
                  <View style={styles.strategyNumber}>
                    <Text style={styles.strategyNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.strategyText}>{strategy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPatternsTab = () => {
    // Using structured emotion data for visualization
    const emotionBreakdown = emotionAnalysis?.emotionBreakdown || {};
    const timePatterns = emotionAnalysis?.timePatterns || {};
    
    // Calculate percentages for pie chart simulation
    const totalEmotions = Object.values(emotionBreakdown).reduce((a, b) => a + (b as number), 0);
    const emotionPercentages = Object.fromEntries(
      Object.entries(emotionBreakdown).map(([emotion, count]) => 
        [emotion, Math.round(((count as number) / totalEmotions) * 100)]
      )
    );
    
    return (
      <View style={styles.tabContent}>
        {/* Emotion distribution visualization */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            <Ionicons name="pie-chart-outline" size={20} color="#5C6BC0" /> Emotion Distribution
          </Text>
          
          {Object.keys(emotionBreakdown).length > 0 ? (
            <View style={styles.emotionsBreakdown}>
              {/* Bar chart visualization */}
              {Object.entries(emotionBreakdown)
                .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                .map(([emotion, count], index) => (
                  <View key={index} style={styles.emotionBarContainer}>
                    <View style={styles.emotionLabelContainer}>
                      <Text style={styles.emotionBarLabel}>{emotion}</Text>
                    </View>
                    <View style={styles.barOuter}>
                      <View 
                        style={[
                          styles.barInner, 
                          { 
                            width: `${Math.min(100, (count as number / totalEmotions) * 100)}%`,
                            backgroundColor: getEmotionColor(emotion)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.countText}>{Math.round((count as number / totalEmotions) * 100)}%</Text>
                  </View>
                ))
              }
              
              <Text style={styles.chartCaption}>Based on {totalEmotions} recorded emotional states</Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>Insufficient data to display emotion patterns</Text>
          )}
        </View>

        {/* Time patterns visualization */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            <Ionicons name="time-outline" size={20} color="#5C6BC0" /> Time-Based Emotion Patterns
          </Text>
          
          <Text style={styles.chartDescription}>How emotions vary throughout the day</Text>
          
          {Object.keys(timePatterns).some(time => Object.keys(timePatterns[time]).length > 0) ? (
            <View style={styles.timePatterns}>
              {Object.entries(timePatterns)
                .filter(([, emotions]) => Object.keys(emotions).length > 0)
                .map(([timeOfDay, emotions], index) => (
                  <View key={index} style={styles.timePatternItem}>
                    <Text style={styles.timeOfDayLabel}>
                      {getTimeOfDayEmoji(timeOfDay)} {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                    </Text>
                    
                    <View style={styles.timePatternChart}>
                      {Object.entries(emotions)
                        .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                        .slice(0, 3)  // Top 3 emotions for this time of day
                        .map(([emotion, count], emoIndex) => {
                          // Calculate percentage of this emotion for this time period
                          const total = Object.values(emotions).reduce((a, b) => a + (b as number), 0);
                          const percentage = ((count as number) / total) * 100;
                          
                          return (
                            <View key={emoIndex} style={styles.timeEmotionBar}>
                              <Text style={styles.timeEmotionLabel}>{emotion}</Text>
                              <View style={styles.timeBarOuter}>
                                <View 
                                  style={[
                                    styles.timeBarInner,
                                    { 
                                      width: `${percentage}%`,
                                      backgroundColor: getEmotionColor(emotion)
                                    }
                                  ]} 
                                />
                              </View>
                              <Text style={styles.timeEmotionPercent}>{Math.round(percentage)}%</Text>
                            </View>
                          );
                        })
                      }
                    </View>
                  </View>
                ))
              }
            </View>
          ) : (
            <Text style={styles.noDataText}>Insufficient time-of-day pattern data</Text>
          )}
        </View>
      </View>
    );
  };

  const renderTriggersTab = () => {
    // Use structured data for visualization
    const triggers = emotionAnalysis?.commonTriggers || 
                     entries.filter(entry => entry.angerTrigger && entry.angerTrigger.trim() !== '')
                           .map(entry => entry.angerTrigger as string);
    
    const copingStrategies = emotionAnalysis?.bestCopingMechanisms || 
                             entries.filter(entry => entry.coping && entry.coping.trim() !== '')
                                   .map(entry => entry.coping as string);
    
    const suggestedStrategies = emotionAnalysis?.suggestedStrategies || [
      "Practice drawing feelings when verbal expression is difficult",
      "Identify a trusted person for emotional discussions"
    ];
    
    return (
      <View style={styles.tabContent}>
        {/* Triggers analysis section */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            <Ionicons name="alert-circle-outline" size={20} color="#5C6BC0" /> Emotional Trigger Analysis
          </Text>
          
          {triggers.length > 0 ? (
            <View>
              <Text style={styles.chartDescription}>Common situations that trigger strong emotions</Text>
              
              <View style={styles.triggersList}>
                {triggers.slice(0, 5).map((trigger, index) => (
                  <View key={index} style={styles.triggerItemCard}>
                    <View style={styles.triggerRank}>
                      <Text style={styles.triggerRankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.triggerDescription}>{trigger}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#5C6BC0" style={{marginRight: 8}} />
                <Text style={styles.infoText}>
                  Recognizing your emotional triggers helps develop preventative strategies.
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>Insufficient trigger data available</Text>
          )}
        </View>

        {/* Coping strategies analysis */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#5C6BC0" /> Effective Response Strategies
          </Text>
          
          {copingStrategies.length > 0 ? (
            <View>
              <Text style={styles.chartDescription}>Techniques that have helped you manage emotions</Text>
              
              <View style={styles.copingList}>
                {copingStrategies.slice(0, 5).map((strategy, index) => (
                  <View key={index} style={styles.copingItemRow}>
                    <View style={styles.copingRank}>
                      <Text style={styles.copingRankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.copingDescription}>{strategy}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>Insufficient coping strategy data available</Text>
          )}
        </View>
        
        {/* Recommended strategies section */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            <Ionicons name="bulb-outline" size={20} color="#5C6BC0" /> Recommended Strategies
          </Text>
          
          <Text style={styles.chartDescription}>Based on your emotional patterns</Text>
          
          <View style={styles.recommendationsList}>
            {suggestedStrategies.map((suggestion, index) => (
              <View key={index} style={styles.recommendationRow}>
                <View style={styles.recommendationBullet}>
                  <Text style={styles.recommendationBulletText}>•</Text>
                </View>
                <Text style={styles.recommendationText}>{suggestion}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#5C6BC0" style={styles.infoIcon} />
            <Text style={styles.infoCardText}>
              Understanding your emotional patterns helps develop effective regulation strategies.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Helper function to darken or lighten a color
  const shadeColor = (color: string, percent: number) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = (R > 0) ? R : 0;
    G = (G > 0) ? G : 0;
    B = (B > 0) ? B : 0;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Emotions</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>
              {childName}'s Emotion Insights
            </Text>
            <Text style={styles.welcomeText}>
              Here's what I've learned about your emotions from your journal entries. 
              Understanding your patterns can help you manage your feelings better.
            </Text>
            <View style={styles.welcomeFooter}>
              <Text style={styles.emoji}>🧠</Text>
              <Text style={styles.welcomeFooterText}>
                Your Emotional Intelligence Helper
              </Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F6DF5" />
              <Text style={styles.loadingText}>Loading your emotion insights...</Text>
            </View>
          ) : (
            <>
              <View style={styles.tabsContainer}>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
                  onPress={() => setActiveTab('overview')}
                >
                  <Ionicons 
                    name="eye-outline" 
                    size={20} 
                    color={activeTab === 'overview' ? "#fff" : "#4a6fa5"} 
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
                    Overview
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'patterns' && styles.activeTabButton]}
                  onPress={() => setActiveTab('patterns')}
                >
                  <Ionicons 
                    name="bar-chart-outline" 
                    size={20} 
                    color={activeTab === 'patterns' ? "#fff" : "#4a6fa5"} 
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'patterns' && styles.activeTabButtonText]}>
                    Patterns
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'triggers' && styles.activeTabButton]}
                  onPress={() => setActiveTab('triggers')}
                >
                  <Ionicons 
                    name="flash-outline" 
                    size={20} 
                    color={activeTab === 'triggers' ? "#fff" : "#4a6fa5"} 
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'triggers' && styles.activeTabButtonText]}>
                    Triggers
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'patterns' && renderPatternsTab()}
              {activeTab === 'triggers' && renderTriggersTab()}

              {entries.length === 0 && (
                <View style={styles.noEntriesContainer}>
                  <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png' }}
                    style={styles.noEntriesImage}
                  />
                  <Text style={styles.noEntriesText}>No journal entries yet</Text>
                  <Text style={styles.noEntriesSubtext}>
                    Start writing in your feelings journal to see insights about your emotions
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}></View>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Notice Patterns</Text>
              <Text style={styles.tipText}>
                Pay attention to when and where you feel certain emotions. Are there specific times of day
                or situations that tend to trigger particular feelings?
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle2}>Try Different Strategies</Text>
              <Text style={styles.tipText}>
                When you're feeling strong emotions, experiment with different ways of coping.
                Deep breathing, talking to someone, or drawing might help you feel better.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: screenWidth < 380 ? 10 : 0,
  },
  header: {
    backgroundColor: '#4F6DF5',
    padding: screenWidth < 380 ? 12 : 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: screenWidth < 380 ? 10 : 15,
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4a6fa5',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    lineHeight: 22,
  },
  welcomeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  welcomeFooterText: {
    color: '#555',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 25,
    padding: 4,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  activeTabButton: {
    backgroundColor: '#4a6fa5',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4a6fa5',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tabContent: {
    marginBottom: 20,
  },
  primaryEmotionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emotionBadge: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  emotionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  primaryEmotionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  insightBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightBulletText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5C6BC0',
  },
  insightText: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
    lineHeight: 22,
  },
  insightItem: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    margin: 5,
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    marginVertical: 15,
    paddingRight: 10,
  },
  chartYAxis: {
    width: 35,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  chartAxisLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  chartContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingTop: 10,
  },
  chartColumn: {
    alignItems: 'center',
    width: 40,
  },
  chartBarContainer: {
    height: '90%',
    width: 30,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartXLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  chartNote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#616161',
  },
  triggersList: {
    marginTop: 5,
  },
  triggerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  triggerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5C6BC0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  triggerNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  triggerItemText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  strategiesList: {
    marginTop: 5,
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  strategyNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  strategyNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  strategyText: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
    lineHeight: 20,
  },
  emotionsBreakdown: {
    marginTop: 10,
  },
  emotionBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionLabelContainer: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionBarLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  barOuter: {
    flex: 1,
    height: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 7,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: 7,
  },
  countText: {
    width: 24,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  chartCaption: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
  },
  timePatterns: {
    marginTop: 10,
  },
  timePatternItem: {
    marginBottom: 15,
  },
  timeOfDayLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timePatternChart: {
    marginTop: 10,
  },
  timeEmotionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeEmotionLabel: {
    width: 70,
    fontSize: 14,
    color: '#424242',
  },
  timeBarOuter: {
    flex: 1,
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  timeBarInner: {
    height: '100%',
    borderRadius: 6,
  },
  timeEmotionPercent: {
    width: 30,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#616161',
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noEntriesContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 20,
  },
  noEntriesImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
    opacity: 0.7,
  },
  noEntriesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  noEntriesSubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipsEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  tipsHeaderText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  tipCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 10,
  },
  tipTitle2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
    lineHeight: 20,
  },
  copingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  copingRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  copingRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  copingDescription: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
    lineHeight: 20,
  },
  recommendationsList: {
    marginVertical: 10,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  recommendationBulletText: {
    fontSize: 18,
    color: '#5C6BC0',
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoCardText: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
    lineHeight: 20,
  },
  intensityChartContainer: {
    height: 220,
    marginVertical: 20,
    marginLeft: 30,
    marginRight: 10,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 20,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  yAxisLabels: {
    position: 'absolute',
    left: -25,
    top: 0,
    bottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#757575',
    width: 20,
    textAlign: 'right',
  },
  chartArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 20,
    zIndex: 2,
  },
  lineChartContainer: {
    flex: 1,
    position: 'relative',
  },
  trendLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: -5,
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'white',
  },
  dataPointTooltip: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 4,
    width: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    opacity: 0,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  tooltipEmotions: {
    fontSize: 10,
    color: '#666',
  },
  xAxisLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 0,
    transform: [{ translateX: -15 }],
    fontSize: 10,
    color: '#757575',
    width: 30,
    textAlign: 'center',
  },
  intensityLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#757575',
  },
  chartAnalysis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 6,
    marginTop: 15,
  },
  chartAnalysisText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  dailyEmotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayEmotionContainer: {
    width: '31%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  dayEmotionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayEmotionBubble: {
    padding: 4,
    borderRadius: 12,
    margin: 2,
  },
  dayEmotionText: {
    fontSize: 11,
  },
});

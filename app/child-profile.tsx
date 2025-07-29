import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated, Pressable } from 'react-native';
import { ArrowLeft } from 'react-native-feather';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'react-native';

interface ChildStats {
  name: string;
  streaks: number;
  maxStreak: number;
  leadershipScore: number;
  badges: number[];
  league: string;
}

const getBadgeColor = (badgeId: number) => {
  const colors = [
    '#5DADE2', '#F4D03F', '#2ECC71', '#E74C3C', '#9B59B6', 
    '#F39C12', '#1ABC9C', '#3498DB', '#E67E22', '#27AE60'
  ];
  return colors[badgeId % colors.length];
};

const getBadgeName = (badgeId: number) => {
  const names = {
    1: 'Welcome Explorer',
    2: 'Rising Star',
    3: 'Leadership Pro',
    4: 'Master Leader',
    5: 'Weekly Warrior',
    6: 'Monthly Master',
    7: 'Year Champion',
    8: 'Goal Achiever',
    9: 'Journal Master',
    10: 'Avatar Creator',
    11: 'Emotion Tracker',
    12: 'Anger Greeter',
    13: 'Anger Expert'
  };
  return names[badgeId as keyof typeof names] || 'Mystery Badge';
};

const getBadgeDescription = (badgeId: number) => {
  const descriptions = {
    1: 'First time logging in!',
    2: 'Reached 1,000 leadership points',
    3: 'Achieved 5,000 leadership points',
    4: 'Master level: 15,000 points',
    5: 'Maintained a 7-day streak',
    6: 'Kept a 30-day streak going',
    7: 'Amazing 365-day streak',
    8: 'Completed your first goal',
    9: 'Completed first weekly journal',
    10: 'Created your first avatar',
    11: 'Used anger thermometer',
    12: 'Completed Hi to Your Anger',
    13: 'Mastered Know Your Anger'
  };
  return descriptions[badgeId as keyof typeof descriptions] || 'Keep playing to learn more!';
};

const badgeImages = {
  1: require("../assets/badges/1.png"),
  2: require("../assets/badges/2.png"),
  3: require("../assets/badges/3.png"),
  4: require("../assets/badges/4.png"),
  5: require("../assets/badges/5.png"),
  6: require("../assets/badges/6.png"),
  7: require("../assets/badges/7.png"),
  8: require("../assets/badges/8.png"),
  9: require("../assets/badges/9.png"),
  10: require("../assets/badges/10.jpg"),
  11: require("../assets/badges/11.png"),
  12: require("../assets/badges/12.png"),
  13: require("../assets/badges/13.png")
};

export default function ChildProfile() {
  const router = useRouter();
  const { email, from, parentEmail } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childStats, setChildStats] = useState<ChildStats | null>(null);
  
  // Add animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Add new animation values for each card
  const cardAnims = [0, 1, 2, 3].map(() => useRef(new Animated.Value(1)).current);
  const badgeAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    fetchChildStats();
  }, [email]);

  useEffect(() => {
    // Initialize badge animations when badges data changes
    if (childStats?.badges) {
      badgeAnims.length = childStats.badges.length;
      for (let i = 0; i < childStats.badges.length; i++) {
        if (!badgeAnims[i]) {
          badgeAnims[i] = new Animated.Value(1);
        }
      }
    }
  }, [childStats?.badges]);

  const fetchChildStats = async () => {
    try {
      if (!email) {
        setError('No email provided');
        setLoading(false);
        return;
      }

      const decodedEmail = decodeURIComponent(email as string);
      const response = await fetch(`http://localhost:5000/child/stats/${decodedEmail}`);
      const data = await response.json();
      
      if (data.success) {
        setChildStats(data.stats);
      } else {
        setError(data.message || 'Failed to fetch child stats');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const animateCard = (index: number, active: boolean) => {
    Animated.spring(cardAnims[index], {
      toValue: active ? 1.1 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20
    }).start();
  };

  const animateBadge = (index: number, active: boolean) => {
    Animated.spring(badgeAnims[index], {
      toValue: active ? 1.1 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20
    }).start();
  };

  // Add hover state handlers for cards and badges
  const onHoverIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1.05,
      useNativeDriver: true,
      tension: 100,
      friction: 10
    }).start();
  };

  const onHoverOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10
    }).start();
  };

  const handleBack = () => {
    if (from === 'parent' && parentEmail) {
      // If we came from parent profile, go back there
      router.push(`/parent-profile?email=${parentEmail}`);
    } else {
      // Default fallback
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4C6EF5" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft stroke="#333" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Child Progress</Text>
      </View>

      <ScrollView style={styles.content}>
        {childStats && (
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY }
                ]
              }
            ]}
          >
            {/* Stats Overview Cards */}
            <View style={styles.statsGrid}>
              {/* Cards with individual animations */}
              {[
                {
                  title: 'Current Streak',
                  value: childStats.streaks,
                  emoji: '🔥',
                  label: 'days in a row',
                  color: '#4A90E2'
                },
                {
                  title: 'Best Streak',
                  value: childStats.maxStreak,
                  emoji: '⭐',
                  label: 'best in a row',
                  color: '#9C27B0'
                },
                {
                  title: 'Leadership Score',
                  value: childStats.leadershipScore,
                  emoji: '👑',
                  label: 'points',
                  color: '#FFC107'
                },
                {
                  title: 'Current League',
                  value: childStats.league,
                  emoji: '🏆',
                  label: 'rank',
                  color: '#E91E63'
                }
              ].map((stat, index) => (
                <Pressable
                  key={stat.title}
                  onHoverIn={() => onHoverIn(cardAnims[index])}
                  onHoverOut={() => onHoverOut(cardAnims[index])}
                  style={{ flex: 1 }}
                >
                  <Animated.View
                    style={[
                      styles.statCard,
                      {
                        transform: [{ scale: cardAnims[index] }]
                      }
                    ]}
                  >
                    <View style={[styles.statCardTopBar, { backgroundColor: stat.color }]} />
                    <View style={styles.statCardContent}>
                      <Text style={styles.statTitle}>{stat.title}</Text>
                      <Text style={styles.statEmoji}>{stat.emoji}</Text>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  </Animated.View>
                </Pressable>
              ))}
            </View>

            {/* Badges Section */}
            <Animated.View 
              style={[
                styles.badgesSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY }]
                }
              ]}
            >
              <Text style={styles.sectionTitle}>
                <Text style={styles.sectionEmoji}>🏅</Text>
                Earned Badges
              </Text>

              <View style={styles.badgesGrid}>
                {childStats.badges && childStats.badges.length > 0 ? (
                  childStats.badges.map((badgeId, index) => (
                    <Pressable
                      key={badgeId}
                      onHoverIn={() => onHoverIn(badgeAnims[index])}
                      onHoverOut={() => onHoverOut(badgeAnims[index])}
                    >
                      <Animated.View
                        style={[
                          styles.badgeCard,
                          {
                            transform: [{ scale: badgeAnims[index] }]
                          }
                        ]}
                      >
                        <View style={[styles.badgeTopBar, { backgroundColor: getBadgeColor(badgeId) }]} />
                        <View style={styles.badgeImageContainer}>
                          <Image
                            source={badgeImages[badgeId as keyof typeof badgeImages]}
                            style={styles.badgeImage}
                          />
                        </View>
                        <Text style={styles.badgeName}>{getBadgeName(badgeId)}</Text>
                        <Text style={styles.badgeDescription}>{getBadgeDescription(badgeId)}</Text>
                      </Animated.View>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.noBadgesText}>No badges earned yet</Text>
                )}
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 350,
    width: '32%',
    minWidth: 320, // Remove 'px'
    flex: 1,
    margin: 0,
    transform: [{ scale: 1 }],
    backfaceVisibility: 'hidden',
  },
  statCardTopBar: {
    height: 8,
    backgroundColor: '#4A90E2',
  },
  statCardContent: {
    marginTop: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    padding: 20,
  },
  statTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4C6EF5',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  badgesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    padding: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  badgeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 240,
    height: 280,
    margin: 0,
    padding: 25,
    transform: [{ scale: 1 }],
    backfaceVisibility: 'hidden',
  },
  badgeTopBar: {
    height: 6,
    width: '100%',
  },
  badgeImageContainer: {
    width: 120,
    height: 120,
    marginVertical: 15,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: 90,
    height: 90,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  noBadgesText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    padding: 24,
  },
  contentContainer: {
    backgroundColor: '#f5f7fa',
    minHeight: '100%',
    width: '100%',
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 20,
    marginBottom: 40,
    justifyContent: 'space-between',
  },
});
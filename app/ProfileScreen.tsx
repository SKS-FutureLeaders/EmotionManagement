import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { API_URL } from '../config'; // Adjust the import based on your project structure

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);


  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You need to log in first');
        return;
      }

      const response = await fetch(`${API_URL}/childauth/getprofile`
        , {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToAvatarCreator = () => {
    navigation.navigate('AvatarCreator');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      {/* <Text style={styles.subtitle}>User information and preferences</Text> */}
      
      {/* Avatar section */}
      <View style={styles.avatarSection}>
        {userData?.avatar ? (
          <Image 
            source={{ uri: userData.avatar }} 
            style={styles.avatar} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.editAvatarButton}
          onPress={navigateToAvatarCreator}
        >
          <Text style={styles.editAvatarButtonText}>
            {userData?.avatar ? 'Edit Avatar' : 'Create Avatar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.sectionContent}>Name: {userData?.name || 'N/A'}</Text>
        <Text style={styles.sectionContent}>Email: {userData?.email || 'N/A'}</Text>
        <Text style={styles.sectionContent}>Age: {userData?.age || 'N/A'}</Text>
        <Text style={styles.sectionContent}>Gender: {userData?.gender || 'N/A'}</Text>
      </View>

      {/* Leadership Goals */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leadership Goals</Text>
        <Text style={styles.sectionContent}>{userData?.leadershipGoal || 'No leadership goal set'}</Text>
      </View> */}

      {/* Focus Areas */}
      {/* {userData?.focusAreas && userData.focusAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Areas</Text>
          {userData.focusAreas.map((area, index) => (
            <Text key={index} style={styles.sectionContent}>• {area}</Text>
          ))}
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e1e1e1',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholderText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#999',
  },
  editAvatarButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  editAvatarButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    marginBottom: 8,
  },
});
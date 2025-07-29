import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2 } from 'react-native-feather';
import Animated, { 
  FadeIn, 
  FadeOut, 
  BounceIn, 
  BounceOut,
  withSpring 
} from 'react-native-reanimated';

interface Child {
  name: string;
  email: string;
  age: number;
  gender: string;
  streaks: number;
  maxStreak: number;
  avatar: string | null;
}

interface ParentProfile {
  name: string;
  email: string;
  type: string;
  contact: string;
  age: number;
  children: Child[];
}

interface DeleteConfirmation {
  show: boolean;
  type: 'parent' | 'child';
  id: string;
}

export default function ParentProfile() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    show: false,
    type: 'parent',
    id: ''
  });

  useEffect(() => {
    if (email) {
      fetchParentProfile();
    }
  }, [email]);

  const fetchParentProfile = async () => {
    try {
      const decodedEmail = decodeURIComponent(email as string);
      const response = await fetch(`http://localhost:5000/admin/parent/${decodedEmail}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data);
      } else {
        setError(data.error || 'Failed to fetch parent profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const closeConfirmation = () => {
    setDeleteConfirmation(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async (type: 'parent' | 'child', id: string) => {
    setDeleteConfirmation({ show: true, type, id });
  };

  const confirmDelete = async () => {
    try {
      const endpoint = deleteConfirmation.type === 'parent' 
        ? `http://localhost:5000/admin/parent/${profile?.email}`
        : `http://localhost:5000/admin/child/${deleteConfirmation.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        // First close the modal with animation
        closeConfirmation();
        
        // Wait for animation to complete before navigation/refresh
        setTimeout(() => {
          if (deleteConfirmation.type === 'parent') {
            router.back();
          } else {
            fetchParentProfile();
          }
        }, 300);
      }
    } catch (err) {
      setError('Failed to delete user');
      closeConfirmation();
    }
  };

  const handleBack = () => {
    router.push('/admin');  // This will go back to admin page
  };

  // When navigating to child profile, pass parent email as parameter
  const handleChildClick = (childEmail: string) => {
    router.push(`/child-profile?email=${encodeURIComponent(childEmail)}&from=parent&parentEmail=${encodeURIComponent(email)}`);
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
        <Text style={styles.headerText}>Parent Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {profile && (
          <>
            <View style={styles.profileSection}>
              <View style={styles.headerWithDelete}>
                <View>
                  <Text style={styles.title}>{profile.name}</Text>
                  <Text style={styles.subtitle}>{profile.email}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDelete('parent', profile.email)}
                  style={styles.deleteButton}
                >
                  <Trash2 stroke="#fff" width={18} height={18} />
                </TouchableOpacity>
              </View>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>{profile.age}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>{profile.contact || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Children</Text>
                  <Text style={styles.detailValue}>{profile.children.length}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Children</Text>
            {profile.children.map((child) => (
              <TouchableOpacity 
                key={child.email} 
                style={styles.childCard}
                onPress={() => handleChildClick(child.email)}
              >
                <View style={styles.childHeader}>
                  {child.avatar ? (
                    <Image source={{ uri: child.avatar }} style={styles.childAvatar} />
                  ) : (
                    <View style={[styles.childAvatar, styles.placeholderAvatar]}>
                      <Text style={styles.avatarText}>{child.name[0].toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childEmail}>{child.email}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete('child', child.email)}
                    style={styles.deleteButton}
                  >
                    <Trash2 stroke="#fff" width={18} height={18} />
                  </TouchableOpacity>
                </View>
                <View style={styles.childDetails}>
                  <View style={styles.childDetailItem}>
                    <Text style={styles.detailLabel}>Age</Text>
                    <Text style={styles.detailValue}>{child.age}</Text>
                  </View>
                  <View style={styles.childDetailItem}>
                    <Text style={styles.detailLabel}>Gender</Text>
                    <Text style={styles.detailValue}>{child.gender || 'N/A'}</Text>
                  </View>
                  <View style={styles.childDetailItem}>
                    <Text style={styles.detailLabel}>Current Streak</Text>
                    <Text style={styles.detailValue}>{child.streaks}</Text>
                  </View>
                  <View style={styles.childDetailItem}>
                    <Text style={styles.detailLabel}>Max Streak</Text>
                    <Text style={styles.detailValue}>{child.maxStreak}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {deleteConfirmation.show && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.confirmationModal}
        >
          <Animated.View 
            entering={BounceIn.duration(300)}
            style={styles.modalContent}
          >
            <View style={styles.modalIconContainer}>
              <Trash2 stroke="#dc2626" width={40} height={40} />
            </View>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this {deleteConfirmation.type}?
              This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={closeConfirmation}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmDelete}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
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
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerWithDelete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    width: '33.33%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  childHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  placeholderAvatar: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
  },
  childInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  childEmail: {
    fontSize: 14,
    color: '#666',
  },
  childDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  childDetailItem: {
    width: '50%',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    width: 36, // Add fixed width
    height: 36, // Add fixed height
    borderRadius: 8,
    justifyContent: 'center', // Center the icon
    alignItems: 'center', // Center the icon
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#fee2e2',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  modalText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  confirmButton: {
    backgroundColor: '#dc2626',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    color: '#4b5563',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parentStatusContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  childStatusContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  inactiveDot: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: '#10b981',
  },
  inactiveText: {
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

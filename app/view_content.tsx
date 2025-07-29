import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, File, Video, FileText, Image as ImageIcon, Trash2 } from 'react-native-feather';
import Animated, { FadeIn, FadeOut, BounceIn } from 'react-native-reanimated';
// import ThemeToggle from '../components/ThemeToggle';

interface ContentFile {
  fileUrl: string;
  mimeType: string;
  originalName: string;
  size: number;
}

interface Content {
  _id: string;
  type: 'image' | 'video' | 'text' | 'pdf';
  heading: string;
  description: string;
  ageRange: {
    lower: number;
    upper: number;
  };
  files: ContentFile[];
  createdAt: string;
}

interface CategorySection {
  title: string;
  type: 'image' | 'video' | 'text' | 'pdf';
  icon: React.ReactNode;
}

interface DeleteConfirmation {
  show: boolean;
  contentId: string;
}

const CATEGORIES: CategorySection[] = [
  { title: 'Images', type: 'image', icon: <ImageIcon stroke="#4C6EF5" width={24} height={24} /> },
  { title: 'Videos', type: 'video', icon: <Video stroke="#4C6EF5" width={24} height={24} /> },
  { title: 'Text Documents', type: 'text', icon: <FileText stroke="#4C6EF5" width={24} height={24} /> },
  { title: 'PDF Files', type: 'pdf', icon: <File stroke="#4C6EF5" width={24} height={24} /> },
];

const ViewContent: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/admin');  // Change this line
  };

  const colorScheme = useColorScheme();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    show: false,
    contentId: ''
  });
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  useEffect(() => {
    fetchContent();
  }, []);

  const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.206.225:5000";

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/content`);
      const data = await response.json();
      if (response.ok) {
        setContents(data.content);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch content');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getContentsByType = (type: string) => {
    return contents.filter(content => content.type === type);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDelete = (contentId: string) => {
    setDeleteConfirmation({ show: true, contentId });
  };

  const closeConfirmation = () => {
    setDeleteConfirmation(prev => ({ ...prev, show: false }));
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/admin/content/${deleteConfirmation.contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // First close the modal with animation
        closeConfirmation();
        
        // Update the state and show success message
        setContents(prevContents => 
          prevContents.filter(content => content._id !== deleteConfirmation.contentId)
        );
        
        Alert.alert('Success', 'Content deleted successfully');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to delete content');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred while deleting content');
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (content: Content) => {
    router.push({
      pathname: '/content-details',
      params: { id: content._id }
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft stroke={isDarkMode ? '#fff' : '#000'} width={24} height={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>
            Content Library
          </Text>
        </View>
        {/* <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} /> */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4C6EF5" style={styles.loader} />
      ) : (
        <ScrollView style={styles.contentList}>
          {CATEGORIES.map((category) => {
            const categoryContents = getContentsByType(category.type);
            if (categoryContents.length === 0) return null;

            return (
              <View key={category.type} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  {category.icon}
                  <Text style={[styles.categoryTitle, isDarkMode && styles.textDark]}>
                    {category.title} ({categoryContents.length})
                  </Text>
                </View>

                {categoryContents.map((content) => (
                  <TouchableOpacity
                    key={content._id}
                    style={[styles.contentCard, isDarkMode && styles.contentCardDark]}
                    onPress={() => handleContentClick(content)}
                  >
                    <View style={styles.contentHeader}>
                      <View style={styles.contentInfo}>
                        <Text style={[styles.contentTitle, isDarkMode && styles.textDark]}>
                          {content.heading}
                        </Text>
                        <Text style={[styles.ageRange, isDarkMode && styles.textDark]}>
                          Age: {content.ageRange.lower} - {content.ageRange.upper} years
                        </Text>
                        <Text style={[styles.description, isDarkMode && styles.textDark]}>
                          {content.description}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleDelete(content._id)}
                        style={[styles.deleteButton, isDarkMode && styles.deleteButtonDark]}
                      >
                        <Trash2 stroke="#fff" width={18} height={18} style={styles.deleteIcon} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.filesList}>
                      {content.files.map((file, index) => (
                        <View key={index} style={styles.fileItem}>
                          {category.type === 'image' && (
                            <Image
                              source={{ uri: `http://localhost:5000${file.fileUrl}` }}
                              style={styles.thumbnail}
                            />
                          )}
                          <View style={styles.fileInfo}>
                            <Text style={[styles.fileName, isDarkMode && styles.textDark]}>
                              {file.originalName}
                            </Text>
                            <Text style={[styles.fileSize, isDarkMode && styles.textDark]}>
                              {formatFileSize(file.size)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

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
              Are you sure you want to delete this content?
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  textDark: {
    color: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  contentList: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentCardDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  ageRange: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  filesList: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#dc2626', // Updated to match parent profile
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButtonDark: {
    backgroundColor: '#991b1b', // Updated to match parent profile
  },
  deleteIcon: {
    marginRight: 6,
  },
  deleteButtonText: {
    color: '#fff',
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
});

export default ViewContent;

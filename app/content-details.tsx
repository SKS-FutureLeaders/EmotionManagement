import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, File, Video, FileText, Download } from 'react-native-feather';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
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

const ContentDetails: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const handleBack = () => {
    router.push('/view_content');  // Change this line
  };

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  useEffect(() => {
    fetchContentDetails();
  }, [id]);

  const fetchContentDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/content/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error fetching content details:', error);
      setError('Failed to load content details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const url = `http://localhost:5000${fileUrl}`;
    // For web platform
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mobile platforms - implement with expo-file-system
      Alert.alert('Download', 'Download feature coming soon for mobile');
    }
  };

  const handleFileView = async (fileUrl: string, mimeType: string) => {
    const fullUrl = `http://localhost:5000${fileUrl}`;
    
    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(fullUrl);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderFilePreview = (file: ContentFile) => {
    const fileUrl = `http://localhost:5000${file.fileUrl}`;

    return (
      <View style={[styles.previewContainer, isDarkMode && styles.previewContainerDark]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, isDarkMode && styles.textDark]}>
            {file.originalName}
          </Text>
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleFileView(file.fileUrl, file.mimeType)}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(file.fileUrl, file.originalName)}
            >
              <Download stroke="#fff" width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.previewContent}>
          {file.mimeType.startsWith('image/') ? (
            <Image
              source={{ uri: fileUrl }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fileTypePreview}>
              {getFileIcon(file.mimeType)}
              <Text style={[styles.fileTypeText, isDarkMode && styles.textDark]}>
                {file.mimeType.split('/')[1].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return null; // Will show image preview instead
    } else if (mimeType.startsWith('video/')) {
      return <Video stroke={isDarkMode ? '#fff' : '#000'} width={24} height={24} />;
    } else if (mimeType === 'application/pdf') {
      return <File stroke={isDarkMode ? '#fff' : '#000'} width={24} height={24} />;
    } else {
      return <FileText stroke={isDarkMode ? '#fff' : '#000'} width={24} height={24} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4C6EF5" />
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, isDarkMode && styles.textDark]}>
          {error || 'Content not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft stroke={isDarkMode ? '#fff' : '#000'} width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>
            {content.heading}
          </Text>
        </View>
        {/* <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} /> */}
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>Type</Text>
          <Text style={[styles.value, isDarkMode && styles.textDark]}>
            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
          </Text>

          <Text style={[styles.label, isDarkMode && styles.textDark]}>Age Range</Text>
          <Text style={[styles.value, isDarkMode && styles.textDark]}>
            {content.ageRange.lower} - {content.ageRange.upper} years
          </Text>

          <Text style={[styles.label, isDarkMode && styles.textDark]}>Description</Text>
          <Text style={[styles.description, isDarkMode && styles.textDark]}>
            {content.description}
          </Text>

          <Text style={[styles.label, isDarkMode && styles.textDark]}>Files</Text>
          {content.files.map((file, index) => (
            <View key={index} style={[styles.fileItem, isDarkMode && styles.fileItemDark]}>
              {file.mimeType.startsWith('image/') ? (
                <Image
                  source={{ uri: `http://localhost:5000${file.fileUrl}` }}
                  style={styles.filePreview}
                />
              ) : (
                <View style={styles.fileIconContainer}>
                  {getFileIcon(file.mimeType)}
                </View>
              )}
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, isDarkMode && styles.textDark]}>
                  {file.originalName}
                </Text>
                <Text style={[styles.fileType, isDarkMode && styles.textDark]}>
                  {file.mimeType}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.filesContainer}>
          {content?.files.map((file, index) => (
            <View key={index}>
              {renderFilePreview(file)}
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  fileItemDark: {
    backgroundColor: '#262626',
  },
  filePreview: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  fileType: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewContainerDark: {
    backgroundColor: '#1e1e1e',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#4C6EF5',
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  previewContent: {
    minHeight: 300,
  },
  imagePreview: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
  },
  videoPreview: {
    width: '100%',
    height: 400,
  },
  pdfPreview: {
    width: '100%',
    height: 500,
  },
  noPreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noPreviewText: {
    fontSize: 16,
    color: '#666',
  },
  filesContainer: {
    padding: 16,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#4C6EF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fileTypePreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  fileTypeText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
    flex: 1,
  },
});

export default ContentDetails;

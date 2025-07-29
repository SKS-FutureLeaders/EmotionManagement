import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X } from 'react-native-feather';
import * as DocumentPicker from 'expo-document-picker';
// import RNPickerSelect from 'react-native-picker-select';
// import ThemeToggle from '../components/ThemeToggle';

interface FileAsset {
  uri: string;
  name: string;
  type: string;
  size?: number;
  mimeType?: string;
}

const UploadContent: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [contentType, setContentType] = useState('image');
  const [heading, setHeading] = useState('');
  const [lowerAge, setLowerAge] = useState('');
  const [upperAge, setUpperAge] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickDocument = async () => {
    console.log('Starting document picker...');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true
      });
      
      console.log('Document picker result:', result);
      
      // Handle web platform
      if ('output' in result && result.output) {
        const fileList = result.output as FileList;
        const files: FileAsset[] = Array.from(fileList).map(file => ({
          uri: URL.createObjectURL(file),
          name: file.name,
          type: 'success',
          size: file.size,
          mimeType: file.type
        }));
        console.log('Processed web files:', files);
        setSelectedFiles(prev => [...prev, ...files]);
      }
      // Handle mobile platform
      else if ('assets' in result && result.assets) {
        const files: FileAsset[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || 'unknown',
          type: 'success',
          size: asset.size,
          mimeType: asset.mimeType
        }));
        console.log('Processed mobile files:', files);
        setSelectedFiles(prev => [...prev, ...files]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const removeFile = (uri: string) => {
    setSelectedFiles(prev => prev.filter(file => file.uri !== uri));
  };

   const API_URL = Platform.OS === "web" 
    ? "http://localhost:5000" 
    : "http://192.168.206.225:5000";

  const handleSubmit = async () => {
    if (!selectedFiles.length) {
      Alert.alert('Error', 'Please select at least one file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      
      // Add form data
      formData.append('type', contentType);
      formData.append('heading', heading);
      formData.append('ageRange', JSON.stringify({
        lower: parseInt(lowerAge),
        upper: parseInt(upperAge)
      }));
      formData.append('description', description);

      // Add files to formData
      for (const file of selectedFiles) {
        if (file.uri.startsWith('blob:')) {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          formData.append('files', blob, file.name);
        } else {
          formData.append('files', {
            uri: file.uri,
            type: file.mimeType,
            name: file.name
          });
        }
      }

      console.log('Sending request to server...');
      
      const response = await fetch(`${API_URL}/admin/upload-content`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(75); // Keep progress tracking

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100); // Keep progress tracking

      // Show success alert with animation timing
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Content uploaded successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                router.back();
              }
            }
          ],
          { cancelable: false }
        );
      }, 500); // Small delay to show 100% progress

    } catch (error) {
      console.error('Error during upload:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload content',
        [{ text: 'OK' }]
      );
    } finally {
      // Don't immediately reset progress - let it show completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setHeading('');
    setDescription('');
    setLowerAge('');
    setUpperAge('');
  };

  const selectInputStyle = {
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      color: isDarkMode ? '#fff' : '#333',
      paddingRight: 30,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: isDarkMode ? '#fff' : '#333',
      paddingRight: 30,
    },
    inputWeb: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      color: isDarkMode ? '#fff' : '#333',
      width: '100%',
      border: 'none',
      borderRadius: 8,
      backgroundColor: 'transparent',
      outline: 'none',
    }
  };

  const handleBack = () => {
    router.push('/admin');  // Change this line
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft stroke={isDarkMode ? '#fff' : '#000'} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>
          Upload Content
        </Text>
        {/* <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} /> */}
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={[styles.inputGroup, isDarkMode && styles.inputGroupDark]}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>Content Type</Text>
          <View style={[styles.pickerWrapper, isDarkMode && styles.pickerWrapperDark]}>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{
                width: '100%',
                height: 50,
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                border: 'none',
                fontSize: 16,
                padding: '0 12px',
                borderRadius: 8,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            >
              {['image', 'video', 'text', 'pdf'].map(option => (
                <option 
                  key={option} 
                  value={option}
                  style={{
                    backgroundColor: isDarkMode ? '#333' : '#fff',
                    color: isDarkMode ? '#fff' : '#333',
                    padding: '8px'
                  }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </View>
        </View>

        <View style={[styles.inputGroup, isDarkMode && styles.inputGroupDark]}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>Heading</Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.inputDark]}
            value={heading}
            onChangeText={setHeading}
            placeholder="Enter content heading"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
          />
        </View>

        <View style={[styles.inputGroup, isDarkMode && styles.inputGroupDark]}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>Age Range</Text>
          <View style={styles.ageContainer}>
            <TextInput
              style={[styles.ageInput, isDarkMode && styles.inputDark]}
              value={lowerAge}
              onChangeText={setLowerAge}
              placeholder="Min"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
            />
            <Text style={[styles.ageSeparator, isDarkMode && styles.textDark]}>to</Text>
            <TextInput
              style={[styles.ageInput, isDarkMode && styles.inputDark]}
              value={upperAge}
              onChangeText={setUpperAge}
              placeholder="Max"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
            />
          </View>
        </View>

        <View style={[styles.inputGroup, isDarkMode && styles.inputGroupDark]}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>Upload File</Text>
          <TouchableOpacity 
            style={[styles.fileButton, isDarkMode && styles.fileButtonDark]}
            onPress={pickDocument}
          >
            <Text style={styles.fileButtonText}>
              {selectedFiles.length > 0 ? 'Add More Files' : 'Select Files'}
            </Text>
          </TouchableOpacity>

          {selectedFiles.length > 0 && (
            <View style={[styles.selectedFilesPanel, isDarkMode && styles.selectedFilesPanelDark]}>
              {selectedFiles.map((file, index) => (
                file.type === 'success' && (
                  <View key={`${file.uri}-${index}`} style={[styles.fileItem, isDarkMode && styles.fileItemDark]}>
                    <View style={styles.fileItemLeft}>
                      {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <Image
                          source={{ uri: file.uri }}
                          style={styles.filePreview}
                        />
                      ) : (
                        <View style={styles.fileTypeIcon}>
                          <Text style={styles.fileTypeText}>
                            {file.name.split('.').pop()?.toUpperCase() || '?'}
                          </Text>
                        </View>
                      )}
                      <Text 
                        style={[styles.fileName, isDarkMode && styles.textDark]} 
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeFile(file.uri)}
                      style={styles.removeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X stroke={isDarkMode ? '#fff' : '#333'} width={16} height={16} />
                    </TouchableOpacity>
                  </View>
                )
              ))}
            </View>
          )}
        </View>

        <View style={[styles.inputGroup, isDarkMode && styles.inputGroupDark]}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>Description</Text>
          <TextInput
            style={[styles.textArea, isDarkMode && styles.inputDark]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter content description"
            multiline
            numberOfLines={4}
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
          />
        </View>

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, (!selectedFiles.length || isUploading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedFiles.length || isUploading}
          >
            <View style={styles.submitButtonContent}>
              {isUploading && (
                <ActivityIndicator 
                  size="small" 
                  color="#fff" 
                  style={styles.spinner}
                />
              )}
              <Text style={styles.submitButtonText}>
                {isUploading ? 'Uploading...' : 'Upload Content'}
              </Text>
            </View>
          </TouchableOpacity>
          {isUploading && (
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${uploadProgress}%` }
                ]} 
              />
            </View>
          )}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    color: '#333', // This ensures text is visible in light mode
    width: '100%',
  },
  pickerDark: {
    color: '#fff', // This ensures text is visible in dark mode
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  ageSeparator: {
    marginHorizontal: 16,
    color: '#333',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textDark: {
    color: '#fff',
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#fff',
  },
  pickerContainerDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  pickerDark: {
    color: '#fff',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  pickerWrapperDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  fileButton: {
    backgroundColor: '#4C6EF5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  fileButtonDark: {
    backgroundColor: '#3456CC',
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileButtonTextDark: {
    color: '#fff',
  },
  selectedFileName: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#a0a0a0',
  },
  selectedFilesPanel: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
  },
  selectedFilesPanelDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f7fa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  fileItemDark: {
    backgroundColor: '#1e1e1e',
  },
  fileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  fileTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4C6EF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fileTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filePreview: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 8,
  },
  submitContainer: {
    marginTop: 16,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4C6EF5',
    borderRadius: 2,
    transition: 'width 0.3s ease-in-out',
  }
});

export default UploadContent;

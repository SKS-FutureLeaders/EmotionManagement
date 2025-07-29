import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Platform, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import WeeklySummary from './weekly-summary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../config'; // Adjust the import based on your project structure

interface Child {
  id: string;
  name: string;
  age: number;
  email?: string;
  leadershipGoal?: string;
  gender?: string;
  ageGroup?: string;
  focusAreas?: string[];
  avatar?: string;
}

  
const ParentDashboard: React.FC = () => {
  // Add this hook to update styles when orientation changes
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window')
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription.remove();
  }, []);

  const { width } = dimensions.window;
  const isSmallScreen = width < 380;
  const isMediumScreen = width >= 380 && width < 768;
  
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Child> & { password: string }>({
    name: "",
    age: 0,
    gender: "",
    email: "",
    password: "",
    leadershipGoal: "",
    focusAreas: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [focusAreaInput, setFocusAreaInput] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  useEffect(() => {
    fetchChildren();

    // Also load children from AsyncStorage for offline support
    const loadLocalChildren = async () => {
      try {
        const localChildren = await getParentChildren();
        if (localChildren.length > 0) {
          // Merge with any existing children from the API
          const combinedChildren = [...children];
          
          localChildren.forEach(localChild => {
            if (!combinedChildren.some(child => child.id === localChild.id)) {
              // Ensure types match the Child interface
              combinedChildren.push({
                ...localChild,
                // Convert age to number if it's a string
                age: typeof localChild.age === 'string' ? parseInt(localChild.age, 10) : localChild.age,
                // Ensure optional fields are properly typed
                email: localChild.email || undefined,
                leadershipGoal: localChild.leadershipGoal || 'Emotion Management',
                gender: localChild.gender || 'Not specified',
                ageGroup: localChild.ageGroup || undefined,
                focusAreas: localChild.focusAreas || ['Anger Management']
              });
            }
          });
          
          if (combinedChildren.length > children.length) {
            setChildren(combinedChildren);
          }
        }
      } catch (error) {
        console.error("Error loading local children:", error);
      }
    };
    
    loadLocalChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      // For React Native, you might use AsyncStorage instead of localStorage
      let token;
      if (Platform.OS === "web") {
        token = global.localStorage ? localStorage.getItem("token") : "";
      } else {
        token = await AsyncStorage.getItem("token");
      }

      const response = await fetch(`${API_URL}/childauth/getchildren`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setChildren(data.children);
      } else {
        console.error("Failed to fetch children:", data.message);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInputChange = (name: string, value: string) => {
    // Convert age to number for numeric fields
    if (name === "age") {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value, 10) : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFocusAreasChange = (value: string) => {
    setFocusAreaInput(value);

    if (value && !formData.focusAreas?.includes(value)) {
      setFormData({
        ...formData,
        focusAreas: [...(formData.focusAreas || []), value],
      });
      setFocusAreaInput("");
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setFormData({
      ...formData,
      focusAreas: formData.focusAreas?.filter((a) => a !== area) || [],
    });
  };

  const handleSubmit = async () => {
    try {
      // For React Native, you might use AsyncStorage instead of localStorage
      let token;
      if (Platform.OS === "web") {
        token = global.localStorage ? localStorage.getItem("token") : "";
      } else {
        token = await AsyncStorage.getItem("token");
      }
      if (!token) {
        alert("User not authenticated. Please log in again.");
        return;
      }
      
      const response = await fetch(`${API_URL}/childauth/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age, // Already a number
          email: formData.email,
          password: formData.password,
          leadershipGoal: formData.leadershipGoal,
          gender: formData.gender,
          focusAreas: formData.focusAreas,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChildren([...children, data.child]); // Add new child to list instantly
        setShowAddChildForm(false);
        setFormData({
          name: "",
          age: 0,
          email: "",
          password: "",
          leadershipGoal: "",
          gender: "",
          focusAreas: [],
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding child:", error);
      alert("Failed to add child");
    }
  };
  
  const viewChildJournals = (child: Child) => {
    setSelectedChild(child);
    setShowWeeklySummary(true);
  };
  
  const goBackToChildList = () => {
    setShowWeeklySummary(false);
    setSelectedChild(null);
  };

  // Add navigation functions
  const navigateToWeeklySummary = (child: Child) => {
    setSelectedChild(child);
    setShowWeeklySummary(true);
    // Save the selected child ID to AsyncStorage for persistence
    // In React Native, you would use AsyncStorage here
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showWeeklySummary ? (
          <View style={styles.headerRow}>
            <TouchableOpacity 
              onPress={goBackToChildList}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedChild?.name}'s Emotional Journey</Text>
          </View>
        ) : (
          <Text style={styles.headerText}>Parent Dashboard</Text>
        )}
        
        {/* New navigation buttons */}
        {!showWeeklySummary && (
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => {
                // Handle navigation in React Native
                // You would use navigation prop here instead of window.location
              }}
            >
              <Text style={styles.navButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
        
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showWeeklySummary && selectedChild ? (
          <View style={styles.weeklySummaryContainer}>
            <WeeklySummary childId={selectedChild.id} childName={selectedChild.name} />
          </View>
        ) : (
          // Rest of the content
          <View>
            {/* Welcome message */}
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>
                Welcome to Your Parent Dashboard
              </Text>
              <Text style={styles.welcomeText}>
                Monitor your children's emotional well-being and track their anger management progress.
              </Text>
              <View style={styles.welcomeFooter}>
                <Text style={styles.emoji}>📊</Text>
                <Text style={styles.welcomeFooterText}>
                  Select a child below to view their emotional summary calendar
                </Text>
              </View>
            </View>

            {/* Display children */}
            <View style={styles.sectionHeader}>
              <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.sectionHeaderText}>My Children</Text>
            </View>
            
            <View style={styles.childrenContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingEmoji}>⏳</Text>
                  <Text style={styles.loadingText}>Loading children profiles...</Text>
                </View>
              ) : children.length > 0 ? (
                <View style={styles.childGrid}>
                  {children.map((child) => (
                    <TouchableOpacity 
                      key={child.id} 
                      style={styles.childCard}
                      onPress={() => navigateToWeeklySummary(child)}
                      activeOpacity={0.7}
                    >
                      {/* Colored top bar */}
                      <View style={styles.cardTopBar}></View>
                      
                      {/* Child's avatar initial */}
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                          {child.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      
                      <Text style={styles.childName}>
                        {child.name}
                      </Text>

                      <View style={styles.childDetails}>
                        <Text style={styles.childDetail}>
                          <Text style={styles.bold}>Age:</Text> {child.age}
                        </Text>
                        {child.gender && 
                          <Text style={styles.childDetail}>
                            <Text style={styles.bold}>Gender:</Text> {child.gender}
                          </Text>
                        }
                      </View>
                      
                      {child.focusAreas && child.focusAreas.length > 0 && (
                        <View style={styles.focusAreasContainer}>
                          <Text style={styles.bold}>Focus Areas:</Text>
                          <View style={styles.tagsContainer}>
                            {child.focusAreas.map((area, index) => (
                              <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{area}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                      
                      {/* View Calendar button */}
                      <TouchableOpacity 
                        style={styles.viewCalendarButton}
                        onPress={() => navigateToWeeklySummary(child)}
                      >
                        <Text style={styles.buttonEmoji}>📊</Text>
                        <Text style={styles.buttonText}>View Emotion Calendar</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noChildrenContainer}>
                  <Text style={styles.noChildrenEmoji}>👶</Text>
                  <Text style={styles.noChildrenText}>No children added yet.</Text>
                  <Text style={styles.noChildrenSubtext}>Click the "Add Child" button below to get started.</Text>
                </View>
              )}
            </View>
            
            {/* Add child button */}
            <View style={styles.addChildButtonContainer}>
              <TouchableOpacity 
                style={[
                  styles.addChildButton, 
                  showAddChildForm ? styles.cancelButton : {}
                ]}
                onPress={() => setShowAddChildForm(!showAddChildForm)}
              >
                <Text style={styles.addChildButtonIcon}>
                  {showAddChildForm ? '✖' : '➕'}
                </Text>
                <Text style={styles.addChildButtonText}>
                  {showAddChildForm ? 'Cancel' : 'Add Child'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add child form */}
            {showAddChildForm && (
              <View style={styles.formCard}>
                <Text style={styles.formHeader}>Add Child Profile</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name || ""}
                    onChangeText={(text) => handleTextInputChange("name", text)}
                    placeholder="Child's name"
                    required
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.age?.toString() || ""}
                    onChangeText={(text) => handleTextInputChange("age", text)}
                    keyboardType="numeric"
                    placeholder="Child's age"
                    required
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.gender || ""}
                      onValueChange={(value) => handleTextInputChange("gender", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select gender" value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                      <Picker.Item label="Prefer not to say" value="Prefer not to say" />
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email || ""}
                    onChangeText={(text) => handleTextInputChange("email", text)}
                    keyboardType="email-address"
                    placeholder="Child's email"
                    required
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password || ""}
                    onChangeText={(text) => handleTextInputChange("password", text)}
                    secureTextEntry
                    placeholder="Password"
                    required
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Leadership Goal</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.leadershipGoal || ""}
                      onValueChange={(value) => handleTextInputChange("leadershipGoal", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select a goal" value="" />
                      <Picker.Item label="Emotion Management especially Anger" value="Emotion Management especially Anger" />
                      <Picker.Item label="Healthy habits" value="Healthy habits" />
                      <Picker.Item label="Chores and responsibilities" value="Chores and responsibilities" />
                      <Picker.Item label="Learning challenges" value="Learning challenges" />
                      <Picker.Item label="Building/Rebuilding Trust" value="Building/Rebuilding Trust" />
                      <Picker.Item label="I haven't decided yet" value="I haven't decided yet" />
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    What area(s) do you want to focus on in your leadership journey?
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={focusAreaInput}
                      onValueChange={(value) => handleFocusAreasChange(value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select an area" value="" />
                      <Picker.Item label="Social Relationships" value="Social Relationships" />
                      <Picker.Item label="Building trust" value="Building trust" />
                      <Picker.Item label="Managing conflicts" value="Managing conflicts" />
                      <Picker.Item label="Flexibility and Time Management" value="Flexibility and Time Management" />
                      <Picker.Item label="Giving and receiving feedback" value="Giving and receiving feedback" />
                      <Picker.Item label="Active Listening" value="Active Listening" />
                      <Picker.Item label="Self Awareness" value="Self Awareness" />
                      <Picker.Item label="Decision making" value="Decision making" />
                      <Picker.Item label="Growth Mindset" value="Growth Mindset" />
                      <Picker.Item label="Anger Management" value="Anger Management" />
                      <Picker.Item label="Continuous learning" value="Continuous learning" />
                    </Picker>
                  </View>
                  
                  {/* Display selected focus areas as tags */}
                  {formData.focusAreas && formData.focusAreas.length > 0 && (
                    <View style={styles.selectedTagsContainer}>
                      {formData.focusAreas.map((area, index) => (
                        <View key={index} style={styles.selectedTag}>
                          <Text style={styles.selectedTagText}>{area}</Text>
                          <TouchableOpacity 
                            onPress={() => handleRemoveFocusArea(area)}
                            style={styles.removeTagButton}
                          >
                            <Text style={styles.removeTagButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Tips section with improved styling */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Text style={styles.tipsEmoji}>💡</Text>
                <Text style={styles.tipsHeaderText}>Tips for Parents</Text>
              </View>
              
              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>Understanding Anger Patterns</Text>
                <Text style={styles.tipText}>
                  Look for common triggers and times when your child feels most angry. 
                  This can help prevent future outbursts by addressing issues before they escalate.
                </Text>
              </View>
              
              <View style={styles.tipCard}>
                <Text style={styles.tipTitle2}>Supporting Healthy Coping</Text>
                <Text style={styles.tipText}>
                  Encourage positive coping strategies like deep breathing, 
                  taking breaks, or talking about feelings. Praise your child when they use these strategies
                  instead of reacting with anger.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: screenWidth < 380 ? 10 : 0,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: screenWidth < 380 ? 5 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4F6DF5',
    padding: screenWidth < 380 ? 10 : 15,
    borderRadius: 8,
    marginBottom: 20,
    flexWrap: screenWidth < 500 ? 'wrap' : 'nowrap',
  },
  headerText: {
    fontSize: screenWidth < 380 ? 22 : 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: screenWidth < 500 ? 10 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 28,
    color: 'white',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  navButtonText: {
    color: '#4F6DF5',
    fontWeight: 'bold',
  },
  weeklySummaryContainer: {
    width: '100%',
    paddingHorizontal: 10,
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
    borderLeftColor: '#4CAF50',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  childrenContainer: {
    marginBottom: 20,
  },
  childGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: screenWidth < 768 ? 'center' : 'space-between',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 40,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  childCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: screenWidth < 380 ? 15 : 25,
    margin: 5,
    marginBottom: 20,
    // Responsive width based on screen size
    width: screenWidth < 550 ? '95%' : screenWidth < 768 ? '80%' : '48%',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#4a90e2',
  },
  avatarCircle: {
    width: screenWidth < 380 ? 50 : 70,
    height: screenWidth < 380 ? 50 : 70,
    borderRadius: screenWidth < 380 ? 25 : 35,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    margin: screenWidth < 380 ? 5 : 10,
  },
  avatarText: {
    fontSize: screenWidth < 380 ? 24 : 32,
    color: 'white',
    fontWeight: 'bold',
  },
  childName: {
    fontSize: screenWidth < 380 ? 18 : 22,
    color: '#333',
    margin: screenWidth < 380 ? 10 : 15,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
    paddingBottom: screenWidth < 380 ? 10 : 15,
    textAlign: 'center',
  },
  childDetails: {
    alignSelf: 'stretch',
    marginBottom: 15,
  },
  childDetail: {
    margin: 8,
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  focusAreasContainer: {
    backgroundColor: "#eef5ff",
    padding: screenWidth < 380 ? 10 : 15,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: "#4a90e2",
    borderRadius: 20,
    padding: 5,
    margin: 2,
    paddingHorizontal: 8,
  },
  tagText: {
    color: "white",
    fontSize: screenWidth < 380 ? 10 : 12,
  },
  viewCalendarButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: screenWidth < 380 ? 12 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 44, // Minimum touch target size
  },
  buttonEmoji: {
    fontSize: 18,
    color: 'white',
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noChildrenContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noChildrenEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  noChildrenText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  noChildrenSubtext: {
    fontSize: 16,
    color: '#888',
  },
  addChildButtonContainer: {
    alignItems: 'center',
    margin: 30,
  },
  addChildButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 30,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#FF5252',
  },
  addChildButtonIcon: {
    fontSize: 20,
    color: 'white',
    marginRight: 8,
  },
  addChildButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    width: screenWidth < 768 ? '95%' : '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
    fontSize: 14,
  },
  input: {
    width: screenWidth < 768 ? '100%' : '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: screenWidth < 380 ? 14 : 16,
    backgroundColor: 'white',
    minHeight: 44, // Minimum touch target size
  },
  pickerContainer: {
    width: screenWidth < 768 ? '100%' : '80%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: 'white',
    marginTop: 5,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
    padding: 5,
    paddingHorizontal: 10,
    margin: 5,
    borderRadius: 4,
  },
  selectedTagText: {
    fontSize: 14,
  },
  removeTagButton: {
    marginLeft: 8,
  },
  removeTagButtonText: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 48,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    marginTop: 30,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
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
  
  // Helper function to get parent children - this was referenced but not implemented in original code
  // You'll need to implement this based on your AsyncStorage or API requirements
});

// This helper function was referenced in the code but not defined
// Adding a placeholder implementation
const getParentChildren = async () => {
  // In a real app, this would likely fetch from AsyncStorage or another local storage
  try {
    // If using AsyncStorage:
    // const childrenData = await AsyncStorage.getItem('parentChildren');
    // return childrenData ? JSON.parse(childrenData) : [];
    
    // For now, return empty array as placeholder
    return [];
  } catch (error) {
    console.error("Error retrieving children from storage:", error);
    return [];
  }
};

export default ParentDashboard;
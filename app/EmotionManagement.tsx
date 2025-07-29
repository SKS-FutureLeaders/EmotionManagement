import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function EmotionManagement() {
  const router = useRouter();
  
  const tools = [
    {
      id: 'detect',
      title: 'Emotion Detection',
      description: 'AI-powered tool to help identify emotions',
      icon: 'brain',
      route: '/emotion-tools/detection'
    },
    {
      id: 'breathe',
      title: 'Breathing Exercises',
      description: 'Guided breathing techniques to calm down',
      icon: 'wind',
      route: '/emotion-tools/breathing'
    },
    {
      id: 'journal',
      title: 'Emotional Journal',
      description: 'Track and reflect on your feelings',
      icon: 'book-open',
      route: '/emotion-tools/journal'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emotion Management</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.intro}>
          These tools will help you understand and manage your emotions better.
          Choose the tool that matches what you need right now.
        </Text>
        
        <View style={styles.toolsContainer}>
          {tools.map((tool) => (
            <TouchableOpacity 
              key={tool.id}
              style={styles.toolCard}
              onPress={() => router.push(tool.route as any)}
            >
              <FontAwesome5 name={tool.icon} size={40} color="#4a6fa5" style={styles.toolIcon} />
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  toolsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  toolCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  toolIcon: {
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});
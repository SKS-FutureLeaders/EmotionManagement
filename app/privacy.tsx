import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import React from 'react';

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <ScrollView style={styles.content}>
        <Text style={styles.text}>
          This Privacy Policy explains how we collect, use, and protect your information. By using our app, you agree to this policy.
        </Text>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect personal information such as email, name, and usage data.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use your information to improve your experience, provide support, and ensure app security.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Protection</Text>
        <Text style={styles.text}>
          We implement strong security measures to protect your data.
        </Text>

        <Text style={styles.sectionTitle}>4. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions, contact us at support@futureleadersapp.com.
        </Text>
      </ScrollView>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

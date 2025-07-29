import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useThemeContext } from "../hooks/ThemeContext"; // Import theme context
import { useTheme } from "@react-navigation/native"; // Get colors from current theme

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { theme, toggleTheme } = useThemeContext(); // Get theme and toggle function
  const { colors } = useTheme(); // Get current theme colors

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your application experience</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch value={theme === "dark"} onValueChange={toggleTheme} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Sound Effects</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  dangerButtonText: {
    color: '#d32f2f',
  },
});
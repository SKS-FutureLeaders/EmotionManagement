// reset-password.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';

const API_URL = Platform.OS === "web" 
      ? "http://localhost:5000" 
      : "http://192.168.136.40:5000";

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get token and email from URL parameters
    if (params.token && params.email) {
      setToken(params.token.toString());
      setEmail(params.email.toString());
    } else {
      // No valid token/email in URL
      setError('Invalid or missing reset parameters');
    }
  }, [params]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email, 
          password 
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        Alert.alert(
          'Success', 
          'Password reset successful. Please login with your new password.',
          [{ text: 'OK', onPress: () => router.push('/auth/login') }]
        );
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.infoText}>Enter a new password for your account.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading || !token || !email}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});
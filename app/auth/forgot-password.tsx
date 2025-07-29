import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config'; // Adjust the import based on your project structure

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.infoText}>Enter your email, and we’ll send a reset link.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      

<TouchableOpacity
  style={styles.button}
  onPress={async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });


      const data = res.data;
      if (data.success) {
        alert(data.message || 'Reset link sent!');
      } else {
        alert(data.error || 'Failed to send reset link.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  }}
>

        <Text style={styles.buttonText}>Send Reset Link</Text>
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
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    marginTop: 8,
  },
});

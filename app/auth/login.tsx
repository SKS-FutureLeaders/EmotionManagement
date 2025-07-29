import { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert 
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Toast from "react-native-toast-message";
import { useAuth } from '../../hooks/AuthContext';
import { useRouter } from "expo-router";
import {API_URL} from '../config'; // Adjust the import based on your project structure

WebBrowser.maybeCompleteAuthSession();



const FACEBOOK_APP_ID = "123456789012345"; // Replace with your Facebook App ID
const GOOGLE_CLIENT_ID = "123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"; // Replace with your Google Client ID

import { makeRedirectUri } from "expo-auth-session"; // Import from the main package

WebBrowser.maybeCompleteAuthSession();

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.162.225:5000";

const FACEBOOK_APP_ID = "1181459850255246";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const redirectUri = makeRedirectUri({
    scheme: "myapp",
  });

  const [fbRequest, fbResponse, promptFbAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: redirectUri,
  });

  // Fixed Google auth request with proper scopes and responseType
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    // expoClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
    responseType: 'id_token',

  // Use the imported makeRedirectUri instead of Facebook.makeRedirectUri
  const redirectUri = makeRedirectUri({
    scheme: "myapp", // Replace with your app scheme if you have one
    useProxy: false, // Set this to true if you cannot use the default URI
  });

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: redirectUri, // Add the redirectUri parameter here
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.data.success) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("userType", response.data.userType);
        

        const userData = {
          token: response.data.token,
          userType: response.data.userType,
          // Add any other user data from response that you need
          id: response.data.userId || response.data.id,
          email: email,
          // Add other fields as needed
        };
        await login(userData);
        Alert.alert("Success", "Login successful!");
        if (response.data.userType === "parent") {
          router.push("/parent_dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        Alert.alert("Error", response.data.message || "Invalid credentials");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      // console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid credentials",
      });
        Alert.alert("Success", "Login successful!");
        router.push("/");
      } else {
        Alert.alert("Error", response.data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      console.log("Redirect URI:", redirectUri);
      const result = await promptFbAsync();
      
      if (result?.type === "success") {
        const { access_token } = result.params;

        const fbResponse = await axios.get(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
        );
        console.log("Facebook Response:", fbResponse.data);
      console.log("Redirect URI:", redirectUri); // Debug output
      const result = await promptAsync();
      
      if (result?.type === "success") {
        const { access_token } = result.params;
        // console.log("Facebook Access Token:", access_token);

        // Fetch user email from Facebook
        const fbResponse = await axios.get(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
        );

        if (!fbResponse.data.email) {
          Alert.alert("Error", "Facebook account has no email associated. Please use another login method.");
          return;
        }

        const { email } = fbResponse.data;
        console.log("Facebook Email:", email);
        const { email, name } = fbResponse.data;
        // console.log("Facebook User:", name, email);
        // Send email and accessToken to backend
        const response = await axios.post(`${API_URL}/auth/login`, { email, accessToken: access_token });

        if (response.data.success) {
          await AsyncStorage.setItem("token", response.data.token);
          Alert.alert("Success", "Logged in with Facebook!");
          router.push("/parent_dashboard");
          router.push("/");
        }
      } else {
        Alert.alert("Login Cancelled");
      }
    } catch (error) {
      console.error("Facebook Login Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("Starting Google login...");
      const result = await promptGoogleAsync();
      console.log("Google auth result type:", result?.type);
      
      if (result?.type === "success") {
        // Extract the ID token - now properly defined with responseType
        const { id_token } = result.params;
        console.log("Google ID Token:", id_token ? "Token received" : "undefined");
        
        if (!id_token) {
          Alert.alert("Error", "Google login failed: No ID Token received.");
          return;
        }
  
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { 
            idToken: id_token, 
            provider: "google" 
          });
          
          if (response.data.success){
            await AsyncStorage.setItem("token", response.data.token);
            Alert.alert("Success", "Logged in with Google!");
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Logged in with Google!",
            });
            // console.log("Redirecting")
            router.push("/parent_dashboard");
          } else {
            Alert.alert("Error", response.data.message || "Login failed");
          }
        } catch (apiError){
          console.error("API Error:", apiError);
          Alert.alert("Error", "Server authentication failed");
        }
      } else if (result?.type === "cancel") {
        Alert.alert("Login Cancelled", "Google login was cancelled");
      } else {
        Alert.alert("Login Failed", "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      Alert.alert("Error", "Google login encountered an error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.appleButton} onPress={() => console.log("Sign in with Apple")}>
          <Text style={styles.appleButtonText}>Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookLogin} disabled={!fbRequest}>
        <TouchableOpacity style={styles.appleButton} onPress={() => console.log("Sign in with Apple")}> 
          <Text style={styles.appleButtonText}>Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookLogin} disabled={!request}>
          <Text style={styles.facebookButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={!googleRequest}>
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/privacy")}>
        <Text style={styles.privacyText}>Privacy Policy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "80%", 
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: "#007bff",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: "50%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginBottom: 12,
  },
  appleButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
  appleButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  facebookButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 8,
  },
  facebookButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  linkText: {
    color: "#007bff",
    marginTop: 8,
  },
  privacyText: {
    color: "gray",
    marginTop: 16,
  },
  googleButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
    marginBottom: 12,
  },
  googleButtonText: {
    color: "white",
    fontWeight: "bold",
  }
});
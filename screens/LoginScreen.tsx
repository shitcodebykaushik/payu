import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Define Navigation Type
type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

// ✅ Replace with Your FastAPI Backend IP (use your actual local IP)
const BASE_URL = "http://192.168.35.164:8000"; // Ensure your backend is running on this IP

// ✅ LoginScreen Component
const LoginScreen = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Handle Login with FastAPI Backend
  const handleLogin = async () => {
    Keyboard.dismiss(); // Hide keyboard when login is clicked

    if (!phoneNumber || !password) {
      Alert.alert('Error', 'Please enter both Phone Number and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { 
        phone_number: phoneNumber, // ✅ Ensure correct key name
        password: password,
      });

      // ✅ If login is successful, save token & navigate
      const accessToken = response.data.access_token;
      await AsyncStorage.setItem('token', accessToken);

      Alert.alert('Login Successful', 'Welcome back!');
      navigation.replace('MainApp'); // ✅ Redirect to MainApp
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid Phone Number or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#141E30', '#243B55']} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled">
          {/* 🏅 Circular Image Section */}
          <View style={styles.logoContainer}>
            <Image source={require('../Asset/Used/money-bag.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to SecurePay</Text>

          {/* 📞 Phone Number Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {/* 🔒 Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {/* 🔘 Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginText}>Login</Text>}
          </TouchableOpacity>

          {/* Signup Redirect */}
          <Text style={styles.signupText}>
            New to SecurePay?{' '}
            <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
              Create an Account
            </Text>
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

// ✅ Ensure ONLY ONE Default Export
export default LoginScreen;

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flexGrow: 1, // ✅ Ensures scrollability when keyboard opens
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50', // Secure Green for Trust and Finance
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50', // Green for Secure Finance
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    opacity: 0.8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 15,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 15,
    fontSize: 16,
    color: 'white',
  },
  signupLink: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

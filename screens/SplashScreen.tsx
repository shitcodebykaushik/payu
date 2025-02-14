import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Define navigation type
type RootStackParamList = {
  Splash: undefined;
  Signup: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

// ✅ Define the function as a constant before export
const SplashScreen = ({ navigation }: Props) => {
  
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Signup'); // Navigate to Signup after 3 seconds
    }, 3000);
  }, []);

  return (
    <LinearGradient colors={['#141E30', '#243B55']} style={styles.container}>
      {/* Circular Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../Asset/Used/money-bag.png')} style={styles.logo} />
      </View>

      {/* Title and Subtitle */}
      <Text style={styles.title}>SecurePay</Text>  
      <Text style={styles.subtitle}>Decentralized. Fast. Secure.</Text>  

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Image source={require('../Asset/Used/money-bag.png')} style={styles.securityLogo} />
        <Text style={styles.securityText}>Powered by Blockchain Security</Text>
        <ActivityIndicator size="large" color="white" style={styles.loader} />
      </View>
    </LinearGradient>
  );
};

// ✅ Ensure only one `export default`
export default SplashScreen;

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60, // Makes it a perfect circle
    backgroundColor: '#4CAF50', // Secure Green for Trust and Finance
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // More space between logo and text
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, // Ensures image fits inside the circular container
    resizeMode: 'contain',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50', // Green for Secure Finance
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
    opacity: 0.8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  securityLogo: {
    width: 100, // Increased for better visibility
    height: 60,
    resizeMode: 'contain',
  },
  securityText: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    opacity: 0.8,
  },
  loader: {
    marginTop: 10,
  },
});

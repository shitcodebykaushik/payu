import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';



// Define navigation types
type RootStackParamList = {
  Onboarding: undefined;
  EmailAuth: undefined;
  VenSync: undefined;
  SignUp: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkNavigationFlow = async () => {
      try {
        const isFirstTime = await AsyncStorage.getItem('isFirstTime');
        const token = await AsyncStorage.getItem('token');

        if (isFirstTime === null) {
          // First-time user
          await AsyncStorage.setItem('isFirstTime', 'false');
          setTimeout(() => {
            navigation.navigate('Signup');
          }, 2000);
        } else if (token) {
          try {
            const profile = await AsyncStorage.getItem('profile');
            const hasProfile = profile === 'true'; // Convert string to boolean

            setTimeout(() => {
              navigation.navigate(hasProfile ? 'VenSync' : 'Signup');
            }, 2000);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          setTimeout(() => {
            navigation.replace('Signup');
          }, 3000);
        }
      } catch (error) {
        console.error('Error in SplashScreen navigation logic:', error);
        navigation.replace('SignUp'); // Fallback route
      }
    };

    checkNavigationFlow();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Lottie Animation - Full Screen */}
      <LottieView
        source={require('../Asset/Asset/Splash Screen Annimation2.json')}
        autoPlay
        loop
        style={styles.animation}
        resizeMode="cover"
      />

      {/* Bottom Overlay View */}
      <View style={styles.bottomOverlay} />
      {/* <Text>PayKr</Text> */}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  animation: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    zIndex: 999,
  },
});
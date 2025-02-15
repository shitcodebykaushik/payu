import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg"; // ✅ Import QR Code Generator
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ Replace with your FastAPI backend URL
const BASE_URL = "http://172.20.10.7:8000";

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Session Expired", "Please log in again.");
          navigation.replace("Login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        Alert.alert("Error", error.response?.data?.detail || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    Alert.alert("Logged Out", "You have been logged out successfully!");
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔙 Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* 👤 User Info */}
        <View style={styles.profileContainer}>
          <Image source={require("../Asset/Used/account.png")} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{userData?.name || "User"}</Text>
            <Text style={styles.profileRole}>User ID: {userData?.user_id || "N/A"}</Text>
          </View>
        </View>

        {/* 📩 User Details */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>📩 Email:</Text>
          <Text style={styles.infoText}>{userData?.email || "Not Available"}</Text>

          <Text style={styles.infoLabel}>📞 Phone Number:</Text>
          <Text style={styles.infoText}>{userData?.phone_number || "Not Available"}</Text>

          <Text style={styles.infoLabel}>💳 Wallet Address:</Text>
          <Text style={styles.infoText}>{userData?.wallet_address || "Not Available"}</Text>
        </View>

        {/* 🔳 QR Code Generator */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Scan QR Code to Send Money</Text>
          {userData?.wallet_address ? (
            <QRCode value={userData.wallet_address} size={200} backgroundColor="white" />
          ) : (
            <Text style={styles.qrError}>Wallet address not available</Text>
          )}
        </View>

        {/* 🔘 Logout */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Ionicons name="log-out" size={22} color="red" />
              <Text style={[styles.menuText, { color: "red" }]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="gray" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  profileContainer: { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "#FFF", padding: 15, borderRadius: 10, elevation: 2 },
  profileImage: { width: 60, height: 60, borderRadius: 50 },
  profileTextContainer: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 20, fontWeight: "bold" },
  profileRole: { fontSize: 16, color: "gray" },
  infoContainer: { marginTop: 20, backgroundColor: "#FFF", padding: 15, borderRadius: 10, elevation: 2 },
  infoLabel: { fontSize: 14, fontWeight: "bold", marginTop: 10, color: "#333" },
  infoText: { fontSize: 16, color: "#555", marginBottom: 10 },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    elevation: 2,
  },
  qrTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" },
  qrError: { fontSize: 14, color: "red" },
  menuContainer: { marginTop: 20, backgroundColor: "#FFF", padding: 15, borderRadius: 10, elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { fontSize: 16, fontWeight: "500", marginLeft: 10 },
});

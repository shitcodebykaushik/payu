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
const BASE_URL = "http://192.168.138.164:8000";
const WS_URL = "ws://192.168.138.164:8000/ws"; // ✅ WebSocket URL

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

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

        // ✅ Establish WebSocket Connection
        const ws = new WebSocket(`${WS_URL}/${response.data.user_id}`);
        setSocket(ws);

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.balance !== undefined) {
            setUserData((prev: any) => ({ ...prev, balance: data.balance }));
          }
        };

        ws.onclose = () => console.log("WebSocket Disconnected");
      } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        Alert.alert("Error", error.response?.data?.detail || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    if (socket) socket.close();
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* 👤 User Info */}
        <View style={styles.profileContainer}>
          <Image source={require("../Asset/Used/customer-service.png")} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{userData?.name || "User"}</Text>
            <Text style={styles.profileRole}>Wallet Balance: ₹{userData?.balance || "0.00"}</Text>
          </View>
        </View>

        {/* 📩 User Details */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>📩 Email</Text>
          <Text style={styles.infoText}>{userData?.email || "Not Available"}</Text>

          <Text style={styles.infoLabel}>📞 Phone Number</Text>
          <Text style={styles.infoText}>{userData?.phone_number || "Not Available"}</Text>

          <Text style={styles.infoLabel}>💳 Wallet Address</Text>
          <Text style={styles.infoText}>{userData?.wallet_address || "Not Available"}</Text>
        </View>

        {/* 🔳 QR Code for Transactions */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Scan QR Code to Send Money</Text>
          {userData?.wallet_address ? (
            <QRCode value={userData.wallet_address} size={180} backgroundColor="white" />
          ) : (
            <Text style={styles.qrError}>Wallet address not available</Text>
          )}
        </View>

        {/* 🔘 Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileTextContainer: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileRole: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  infoContainer: {
    marginTop: 20,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  qrError: {
    fontSize: 14,
    color: "red",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#D32F2F",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

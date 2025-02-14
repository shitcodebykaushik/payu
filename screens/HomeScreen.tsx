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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ Replace with your FastAPI backend URL
const BASE_URL = "http://192.168.35.164:8000";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [balanceVisible, setBalanceVisible] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Session Expired", "Please log in again.");
          navigation.replace("Login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        Alert.alert("Error", "Failed to fetch profile");
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔝 Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>Hello {userData?.name || "User"}</Text>
          <Text style={styles.subText}>Your finances are looking good</Text>
        </View>

        {/* 💰 Balance Card */}
        <View style={styles.balanceCard}>
          <Image source={{ uri: "https://i.pravatar.cc/100" }} style={styles.avatar} />
          <Text style={styles.balanceText}>Your available balance is</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              ₹ {balanceVisible ? userData?.balance || "0.00" : "****"}
            </Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              <Ionicons name={balanceVisible ? "eye-off" : "eye"} size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 📌 Sort Transactions */}
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionText}>Sort your transactions</Text>
          <Text style={styles.actionSubText}>Get points for sorting transactions</Text>
          <Ionicons name="chevron-forward" size={22} color="white" />
        </TouchableOpacity>

        {/* 🏦 Budget Section */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetTitle}>My Budget</Text>
          <Text style={styles.budgetAmount}>₹ {userData?.balance || "0.00"}</Text>
          <Text style={styles.budgetSubText}>Left out of ₹80,888 budgeted</Text>
        </View>

        {/* 💸 Send Money Button */}
        <TouchableOpacity style={styles.sendMoneyButton} onPress={() => navigation.navigate("SendMoney") }>
          <Text style={styles.sendMoneyText}>Send Money</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#120E43",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    fontSize: 14,
    color: "#E3F2FD",
  },
  balanceCard: {
    backgroundColor: "#1E1B48",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  balanceText: {
    color: "white",
    fontSize: 16,
    marginBottom: 5,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginRight: 10,
  },
  actionCard: {
    backgroundColor: "#29247D",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  actionSubText: {
    fontSize: 12,
    color: "#BBB",
  },
  budgetCard: {
    backgroundColor: "#1E1B48",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  budgetAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    marginTop: 5,
  },
  budgetSubText: {
    fontSize: 12,
    color: "#BBB",
  },
  sendMoneyButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  sendMoneyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

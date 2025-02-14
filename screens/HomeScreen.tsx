import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";

// ✅ Replace with your FastAPI backend URL
const BASE_URL = "http://192.168.35.164:8000";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false); // ✅ New state to toggle visibility

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ Fetch User Profile
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

  // ✅ Fetch Transaction History
  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.replace("Login");
        return;
      }

      const response = await axios.get(`${BASE_URL}/transaction/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(response.data);
      setShowTransactions(true); // ✅ Show transactions when data is fetched
    } catch (error: any) {
      console.error("Transaction Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  };

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

        {/* 📌 Toggle Transaction History Button */}
        <TouchableOpacity
          style={styles.fetchButton}
          onPress={showTransactions ? () => setShowTransactions(false) : fetchTransactions} // ✅ Toggle visibility
        >
          {loadingTransactions ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.fetchButtonText}>
              {showTransactions ? "Close Transaction History" : "View Transaction History"}
            </Text>
          )}
        </TouchableOpacity>

        {/* 🕒 Transaction History List */}
        {showTransactions && transactions.length > 0 && (
          <View style={styles.transactionContainer}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <FlatList
              data={transactions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.transactionCard}>
                  <View style={styles.transactionRow}>
                    <Ionicons name="arrow-forward-circle" size={24} color="#4CAF50" />
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionText}>
                        <Text style={styles.senderText}>{item.sender_name}</Text> →{" "}
                        <Text style={styles.receiverText}>{item.receiver_name}</Text>
                      </Text>
                      <Text style={styles.transactionMessage}>{item.message}</Text>
                      <Text style={styles.transactionTimestamp}>
                        {moment(item.timestamp).format("DD MMM YYYY, hh:mm A")}
                      </Text>
                    </View>
                    <Text style={styles.amountText}>₹ {item.amount.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ✅ Styles
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
  fetchButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  fetchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: "#1E1B48",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  senderText: {
    color: "#FFD700",
  },
  receiverText: {
    color: "#4CAF50",
  },
  transactionMessage: {
    fontSize: 14,
    color: "#BBB",
  },
  transactionTimestamp: {
    fontSize: 12,
    color: "#888",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
});

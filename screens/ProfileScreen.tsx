import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ Replace with your FastAPI backend URL
const BASE_URL = "http://192.168.35.164:8000";

const TransactionScreen = ({ navigation }: { navigation: any }) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [receiverData, setReceiverData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);

  // ✅ Validate Receiver (Check if User Exists)
  const validateReceiver = async () => {
    if (!receiver) return;

    setCheckingUser(true);
    setReceiverData(null);

    try {
      const response = await axios.post(`${BASE_URL}/transaction/validate-receiver`, {
        receiver_identifier: receiver,
      });

      setReceiverData(response.data);
    } catch (error: any) {
      setReceiverData(null);
      Alert.alert("User Not Found", "This receiver does not exist or is fraudulent.");
    } finally {
      setCheckingUser(false);
    }
  };

  // ✅ Handle Money Transfer
  const handleTransfer = async () => {
    if (!receiver || !amount) {
      Alert.alert("Error", "Please enter all fields");
      return;
    }

    if (!receiverData) {
      Alert.alert("Error", "Invalid receiver. Please check again.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.replace("Login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/transaction/send`,
        {
          receiver_identifier: receiver,
          amount: parseFloat(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", "Transaction Successful!");
      setReceiver("");
      setAmount("");
      setReceiverData(null);
      navigation.goBack();
    } catch (error: any) {
      console.error("Transaction Error:", error);
      Alert.alert("Error", error.response?.data?.detail || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* 🔙 Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Send Money</Text>

        {/* 📞 Receiver Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter Receiver's Phone or Wallet ID"
          placeholderTextColor="#BBB"
          value={receiver}
          onChangeText={setReceiver}
          onBlur={validateReceiver} // ✅ Auto-validate on blur
        />

        {/* 🔍 Validating Receiver */}
        {checkingUser && <ActivityIndicator size="small" color="white" />}

        {/* ✅ Receiver Found */}
        {receiverData && (
          <View style={styles.receiverInfo}>
            <Text style={styles.receiverText}>Receiver: {receiverData.name}</Text>
            <Text style={styles.receiverText}>Wallet ID: {receiverData.wallet_address}</Text>
            <Text style={styles.receiverText}>Phone: {receiverData.phone_number}</Text>
          </View>
        )}

        {/* 💰 Amount Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter Amount"
          placeholderTextColor="#BBB"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* 🔘 Send Money Button */}
        <TouchableOpacity
          style={styles.transferButton}
          onPress={handleTransfer}
          disabled={loading}
        >
          <Text style={styles.transferText}>{loading ? "Processing..." : "Send Money"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#120E43",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: 20,
    backgroundColor: "#1E1B48",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#29247D",
    color: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  transferButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  transferText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  receiverInfo: {
    backgroundColor: "#344573",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  receiverText: {
    color: "#FFF",
    fontSize: 16,
  },
});

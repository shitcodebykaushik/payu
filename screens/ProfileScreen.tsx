import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ Replace with your FastAPI backend URL
const BASE_URL = "http://192.168.35.164:8000";

const TransactionScreen = ({ navigation }: { navigation: any }) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle Money Transfer
  const handleTransfer = async () => {
    if (!receiver || !amount) {
      Alert.alert("Error", "Please enter all fields");
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Send Money</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter Receiver's Phone or Wallet ID"
          placeholderTextColor="#BBB"
          value={receiver}
          onChangeText={setReceiver}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Enter Amount"
          placeholderTextColor="#BBB"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        
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
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://172.20.10.7:8000";

const TransactionScreen = ({ navigation }: { navigation: any }) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [receiverData, setReceiverData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, []);

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

      await axios.post(
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

  // ✅ Handle QR Code Scanning
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setReceiver(data); // ✅ Auto-fill receiver from QR code
    setIsScannerOpen(false); // ✅ Close Scanner
    validateReceiver(); // ✅ Validate user after scanning
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* 🔙 Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.title}>Send Money</Text>

            {/* 📞 Receiver Input + QR Scanner */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Receiver's Phone or Wallet ID"
                placeholderTextColor="#BBB"
                value={receiver}
                onChangeText={setReceiver}
                onBlur={validateReceiver} // ✅ Auto-validate on blur
              />
              {/* 📷 QR Scanner Button */}
              <TouchableOpacity style={styles.qrButton} onPress={() => setIsScannerOpen(true)}>
                <Ionicons name="qr-code-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>

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
              onChangeText={(text) => setAmount(text)}
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
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* 🔲 QR Scanner Modal */}
      <Modal animationType="slide" transparent={false} visible={isScannerOpen}>
        <View style={styles.modalContainer}>
          {hasCameraPermission === null ? (
            <ActivityIndicator size="large" color="white" />
          ) : hasCameraPermission === false ? (
            <Text style={styles.permissionText}>No access to camera</Text>
          ) : (
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarCodeScanned}
            />
          )}

          {/* ❌ Close Scanner Button */}
          <TouchableOpacity style={styles.closeScannerButton} onPress={() => setIsScannerOpen(false)}>
            <Text style={styles.closeScannerText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#120E43",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#29247D",
    borderRadius: 8,
    marginBottom: 15,
  },
  qrButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
  receiverText: {  // ✅ Added missing style
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  permissionText: {  
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  closeScannerButton: {
    backgroundColor: "#D32F2F",
    padding: 10,
    alignItems: "center",
    marginTop: 20,
  },
  closeScannerText: {
    color: "white",
    fontSize: 18,
  },
});


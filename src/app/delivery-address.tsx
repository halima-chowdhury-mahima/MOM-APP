import BottomNav from "@/components/BottomNav";
import { useAddress } from "@/context/AddressContext";
import { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DeliveryAddressScreen() {
  const {
    savedAddress,
    saveAddress,
    clearAddress,
  } = useAddress();

  const [address, setAddress] = useState("");

  useEffect(() => {
    setAddress(savedAddress);
  }, [savedAddress]);

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      Alert.alert(
        "Address Required",
        "Please enter your delivery address."
      );
      return;
    }

    await saveAddress(address.trim());

    Alert.alert(
      "Saved",
      "Your delivery address has been saved."
    );
  };

  const handleClearAddress = async () => {
    await clearAddress();
    setAddress("");

    Alert.alert(
      "Address Removed",
      "Your saved delivery address has been removed."
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          📍 Delivery Address
        </Text>

        <Text style={styles.subtitle}>
          Save your delivery address for faster checkout.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Your Address
          </Text>

          <TextInput
            style={styles.addressInput}
            placeholder="Enter your full delivery address..."
            placeholderTextColor="#999999"
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSaveAddress}
          >
            <Text style={styles.saveButtonText}>
              Save Address
            </Text>
          </TouchableOpacity>

          {savedAddress ? (
            <TouchableOpacity
              style={styles.removeButton}
              activeOpacity={0.8}
              onPress={handleClearAddress}
            >
              <Text style={styles.removeButtonText}>
                Remove Saved Address
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {savedAddress ? (
          <View style={styles.savedCard}>
            <Text style={styles.savedTitle}>
              Saved Address
            </Text>

            <Text style={styles.savedAddress}>
              {savedAddress}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>
              🏠
            </Text>

            <Text style={styles.emptyTitle}>
              No saved address
            </Text>

            <Text style={styles.emptyText}>
              Add an address above to use it during checkout.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF4F72",
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    marginTop: 8,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    elevation: 2,
  },

  label: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 10,
  },

  addressInput: {
    minHeight: 120,
    backgroundColor: "#FFF8F5",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    fontSize: 15,
    color: "#222222",
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#F0E8E5",
  },

  saveButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 18,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  removeButton: {
    backgroundColor: "#FFF0F4",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  removeButtonText: {
    color: "#FF4F72",
    fontSize: 15,
    fontWeight: "800",
  },

  savedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    elevation: 2,
  },

  savedTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#222222",
    marginBottom: 10,
  },

  savedAddress: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },

  emptyEmoji: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#222222",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 6,
  },
});
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
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

export default function EditProfileScreen() {
  const {
    savedName,
    savedPhone,
    saveUserInfo,
  } = useUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setName(savedName);
    setPhone(savedPhone);
  }, [savedName, savedPhone]);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        "Required",
        "Please enter your name and phone number."
      );

      return;
    }

    await saveUserInfo(
      name.trim(),
      phone.trim()
    );

    Alert.alert(
      "Saved ✅",
      "Your profile information has been updated.",
      [
        {
          text: "OK",
          onPress: () => {
            router.replace("/profile");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconBox}>
          <Text style={styles.icon}>👤</Text>
        </View>

        <Text style={styles.title}>
          Edit Profile
        </Text>

        <Text style={styles.subtitle}>
          Update your name and phone number.
        </Text>

        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999999"
            value={name}
            onChangeText={setName}
          />

          {/* Phone */}
          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor="#999999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Save */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              Save Changes
            </Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  iconBox: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#FFE5EC",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
  },

  icon: {
    fontSize: 38,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF4F72",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    elevation: 2,
  },

  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: "#FFF8F5",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#222222",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F0E8E5",
  },

  saveButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  cancelButton: {
    backgroundColor: "#FFF0F4",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#FF4F72",
    fontSize: 15,
    fontWeight: "800",
  },
});
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields."
      );

      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );

      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const success = await signup(
        name,
        email,
        phone,
        password
      );

      if (!success) {
        Alert.alert(
          "Signup Failed",
          "Account could not be created. This email may already be registered."
        );

        return;
      }

      Alert.alert(
        "Account Created",
        "Your MOM account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () =>
              router.replace("/"),
          },
        ]
      );
    } catch (error) {
      console.log(
        "Signup screen error:",
        error
      );

      Alert.alert(
        "Signup Failed",
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>
              MOM
            </Text>
          </View>

          <Text style={styles.tagline}>
            Create Your MOM Account
          </Text>

          <Text style={styles.subtitle}>
            Everything You Need,
            All in One Place.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Sign Up
          </Text>

          <Text style={styles.description}>
            Create your account and start
            shopping with MOM.
          </Text>

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            Email Address
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#AAAAAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor="#AAAAAA"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Password
          </Text>

          <View
            style={
              styles.passwordContainer
            }
          >
            <TextInput
              style={
                styles.passwordInput
              }
              placeholder="Enter password"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={
                !showPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              activeOpacity={0.7}
              onPress={() =>
                setShowPassword(
                  (previous) =>
                    !previous
                )
              }
            >
              <Text
                style={styles.eyeIcon}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.label,
              styles.confirmLabel,
            ]}
          >
            Confirm Password
          </Text>

          <View
            style={
              styles.passwordContainer
            }
          >
            <TextInput
              style={
                styles.passwordInput
              }
              placeholder="Confirm your password"
              placeholderTextColor="#AAAAAA"
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              secureTextEntry={
                !showConfirmPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              activeOpacity={0.7}
              onPress={() =>
                setShowConfirmPassword(
                  (previous) =>
                    !previous
                )
              }
            >
              <Text
                style={styles.eyeIcon}
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.signupButton,
              isSubmitting &&
                styles.disabledButton,
            ]}
            activeOpacity={0.85}
            onPress={handleSignup}
            disabled={isSubmitting}
          >
            <Text
              style={
                styles.signupButtonText
              }
            >
              {isSubmitting
                ? "Creating Account..."
                : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.loginSection
            }
          >
            <Text
              style={
                styles.loginNormalText
              }
            >
              Already have an account?{" "}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push("/login")
              }
            >
              <Text
                style={styles.loginText}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: "#FF4F72",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 5,

    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 3,
  },

  tagline: {
    fontSize: 17,
    fontWeight: "900",
    color: "#282828",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    elevation: 4,

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#282828",
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 7,
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 7,
  },

  confirmLabel: {
    marginTop: 17,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#282828",
    backgroundColor: "#FAFAFA",
    marginBottom: 17,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 15,
    backgroundColor: "#FAFAFA",
    paddingLeft: 15,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#282828",
  },

  eyeButton: {
    height: "100%",
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  eyeIcon: {
    fontSize: 20,
  },

  signupButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  loginNormalText: {
    fontSize: 14,
    color: "#777777",
  },

  loginText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FF4F72",
  },
});
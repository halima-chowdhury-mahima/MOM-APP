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

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const success = await login(
        email,
        password
      );

      if (!success) {
        Alert.alert(
          "Login Failed",
          "Invalid email or password."
        );

        return;
      }

      router.replace("/");
    } catch (error) {
      console.log("Login screen error:", error);

      Alert.alert(
        "Login Failed",
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
            When You Need Something,
            Think MOM.
          </Text>

          <Text style={styles.subtitle}>
            Everything You Need,
            All in One Place.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Welcome Back
          </Text>

          <Text style={styles.description}>
            Login to continue shopping
            with MOM.
          </Text>

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
            Password
          </Text>

          <View
            style={
              styles.passwordContainer
            }
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
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
              <Text style={styles.eyeIcon}>
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotButton}
            activeOpacity={0.7}
            onPress={() =>
              router.push(
                "/forgot-password"
              )
            }
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isSubmitting &&
                styles.disabledButton,
            ]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text
              style={
                styles.loginButtonText
              }
            >
              {isSubmitting
                ? "Logging in..."
                : "Login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupSection}>
            <Text
              style={
                styles.signupNormalText
              }
            >
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push("/signup")
              }
            >
              <Text style={styles.signupText}>
                Sign Up
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

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 11,
    marginBottom: 22,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF4F72",
  },

  loginButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  signupSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  signupNormalText: {
    fontSize: 14,
    color: "#777777",
  },

  signupText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FF4F72",
  },
});
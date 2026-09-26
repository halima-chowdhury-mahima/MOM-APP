
import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  API_URL,
} from "../config/api";


export default function ForgotPassword() {
  const [
    step,
    setStep,
  ] = useState<
    "email" | "otp" | "password"
  >("email");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ===========================
  // SEND OTP
  // ===========================
  const handleSendOtp =
    async () => {
      if (!email.trim()) {
        Alert.alert(
          "Error",
          "Please enter your email"
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/forgot-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            "Error",
            data.message ||
              "Could not send reset code"
          );

          return;
        }

        Alert.alert(
          "Success",
          "OTP sent to your email"
        );

        setStep("otp");
      } catch (error) {
        console.log(
          "Forgot password error:",
          error
        );

        Alert.alert(
          "Error",
          "Could not connect to server"
        );
      } finally {
        setLoading(false);
      }
    };


  // ===========================
  // VERIFY OTP
  // ===========================
  const handleVerifyOtp =
    async () => {
      if (
        otp.trim().length !== 6
      ) {
        Alert.alert(
          "Error",
          "Enter the 6-digit OTP"
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/verify-reset-otp`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                otp:
                  otp.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            "Error",
            data.message ||
              "OTP verification failed"
          );

          return;
        }

        Alert.alert(
          "Success",
          "OTP verified"
        );

        setStep("password");
      } catch (error) {
        console.log(
          "Verify OTP error:",
          error
        );

        Alert.alert(
          "Error",
          "Could not connect to server"
        );
      } finally {
        setLoading(false);
      }
    };


  // ===========================
  // RESET PASSWORD
  // ===========================
  const handleResetPassword =
    async () => {
      if (
        newPassword.length < 6
      ) {
        Alert.alert(
          "Error",
          "Password must be at least 6 characters"
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        Alert.alert(
          "Error",
          "Passwords do not match"
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/reset-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                otp:
                  otp.trim(),

                newPassword,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            "Error",
            data.message ||
              "Password reset failed"
          );

          return;
        }

        Alert.alert(
          "Success",
          "Password reset successfully",
          [
            {
              text: "Login",
              onPress: () =>
                router.replace(
                  "/login"
                ),
            },
          ]
        );
      } catch (error) {
        console.log(
          "Reset password error:",
          error
        );

        Alert.alert(
          "Error",
          "Could not connect to server"
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        MOM
      </Text>

      <Text style={styles.title}>
        Reset Password
      </Text>

      {step === "email" && (
        <>
          <Text
            style={
              styles.description
            }
          >
            Enter your registered
            email address. We will
            send you a 6-digit code.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={
              setEmail
            }
          />

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleSendOtp
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Send Reset Code
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}


      {step === "otp" && (
        <>
          <Text
            style={
              styles.description
            }
          >
            Enter the 6-digit code
            sent to your email.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="6-digit OTP"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleVerifyOtp
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Verify OTP
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={
              handleSendOtp
            }
            disabled={loading}
          >
            <Text
              style={
                styles.link
              }
            >
              Resend Code
            </Text>
          </TouchableOpacity>
        </>
      )}


      {step ===
        "password" && (
        <>
          <Text
            style={
              styles.description
            }
          >
            Create your new
            password.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={
              newPassword
            }
            onChangeText={
              setNewPassword
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={
              confirmPassword
            }
            onChangeText={
              setConfirmPassword
            }
          />

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleResetPassword
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Reset Password
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}


      <TouchableOpacity
        onPress={() =>
          router.replace(
            "/login"
          )
        }
      >
        <Text style={styles.link}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}


const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent:
        "center",
      backgroundColor:
        "#fff",
    },

    logo: {
      fontSize: 38,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 10,
      color: "#ff5c7a",
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 10,
      color: "#222",
    },

    description: {
      textAlign: "center",
      color: "#666",
      marginBottom: 24,
      lineHeight: 22,
    },

    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 54,
      marginBottom: 14,
      fontSize: 16,
      color: "#222",
    },

    button: {
      height: 54,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#ff5c7a",
      marginTop: 4,
    },

    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },

    link: {
      textAlign: "center",
      color: "#ff5c7a",
      fontWeight: "600",
      marginTop: 20,
    },
  });
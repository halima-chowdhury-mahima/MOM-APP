import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NOTIFICATION_KEY =
  "mom_notifications_enabled";

export default function SettingsScreen() {
  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  useEffect(() => {
    loadNotificationSetting();
  }, []);

  const loadNotificationSetting =
    async () => {
      try {
        const savedNotification =
          await AsyncStorage.getItem(
            NOTIFICATION_KEY
          );

        if (savedNotification !== null) {
          setNotificationsEnabled(
            savedNotification === "true"
          );
        }
      } catch (error) {
        console.log(
          "Error loading notification setting:",
          error
        );
      }
    };

  const handleNotificationChange =
    async (value: boolean) => {
      try {
        setNotificationsEnabled(value);

        await AsyncStorage.setItem(
          NOTIFICATION_KEY,
          value.toString()
        );
      } catch (error) {
        console.log(
          "Error saving notification setting:",
          error
        );
      }
    };

  const handleLanguage = () => {
    Alert.alert(
      "Language",
      "Language option will be added later."
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy & Security",
      "Privacy and security settings will be added later."
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          ⚙️ Settings
        </Text>

        <Text style={styles.subtitle}>
          Manage your MOM app preferences.
        </Text>

        <Text style={styles.sectionTitle}>
          App Preferences
        </Text>

        {/* Notifications */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>
              🔔
            </Text>

            <View style={styles.textArea}>
              <Text
                style={styles.settingTitle}
              >
                Notifications
              </Text>

              <Text
                style={
                  styles.settingSubtitle
                }
              >
                Receive order and app updates
              </Text>
            </View>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={
              handleNotificationChange
            }
            trackColor={{
              false: "#DDDDDD",
              true: "#FFB4C3",
            }}
            thumbColor={
              notificationsEnabled
                ? "#FF4F72"
                : "#FFFFFF"
            }
          />
        </View>

        {/* Language */}
        <TouchableOpacity
          style={styles.settingCard}
          activeOpacity={0.8}
          onPress={handleLanguage}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>
              🌐
            </Text>

            <View style={styles.textArea}>
              <Text
                style={styles.settingTitle}
              >
                Language
              </Text>

              <Text
                style={
                  styles.settingSubtitle
                }
              >
                English
              </Text>
            </View>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        {/* Privacy */}
        <TouchableOpacity
          style={styles.settingCard}
          activeOpacity={0.8}
          onPress={handlePrivacy}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>
              🔒
            </Text>

            <View style={styles.textArea}>
              <Text
                style={styles.settingTitle}
              >
                Privacy & Security
              </Text>

              <Text
                style={
                  styles.settingSubtitle
                }
              >
                Manage your privacy settings
              </Text>
            </View>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>
            MOM
          </Text>

          <Text style={styles.aboutText}>
            Everything You Need, All in One
            Place.
          </Text>

          <Text style={styles.version}>
            Version 1.0.0
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text
            style={styles.backButtonText}
          >
            Back to Profile
          </Text>
        </TouchableOpacity>
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

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF4F72",
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    marginTop: 8,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#222222",
    marginBottom: 12,
    marginTop: 5,
  },

  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },

  settingInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    fontSize: 26,
    marginRight: 14,
  },

  textArea: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222222",
  },

  settingSubtitle: {
    fontSize: 13,
    color: "#888888",
    marginTop: 4,
  },

  arrow: {
    fontSize: 30,
    color: "#FF4F72",
  },

  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },

  aboutTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FF4F72",
  },

  aboutText: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 7,
  },

  version: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 10,
  },

  backButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 25,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
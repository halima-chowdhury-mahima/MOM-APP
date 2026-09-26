import { router } from "expo-router";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HelpSupportScreen() {
  const handleEmailSupport = async () => {
    const email = "support@momapp.com";

    const url =
      `mailto:${email}?subject=MOM App Support`;

    const supported =
      await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        "Email Support",
        `Please contact us at ${email}`
      );
    }
  };

  const handleCallSupport = () => {
    Alert.alert(
      "Customer Support",
      "Customer support phone number will be added later."
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Text style={styles.headerIcon}>
              💬
            </Text>
          </View>

          <Text style={styles.title}>
            Help & Support
          </Text>

          <Text style={styles.subtitle}>
            How can we help you today?
          </Text>
        </View>

        {/* Contact Support */}
        <Text style={styles.sectionTitle}>
          Contact Support
        </Text>

        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={handleEmailSupport}
        >
          <Text style={styles.menuIcon}>
            ✉️
          </Text>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Email Support
            </Text>

            <Text style={styles.menuSubtitle}>
              Send us your questions or problems
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={handleCallSupport}
        >
          <Text style={styles.menuIcon}>
            📞
          </Text>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Call Support
            </Text>

            <Text style={styles.menuSubtitle}>
              Talk with our support team
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqCard}>
          <Text style={styles.question}>
            How can I place an order?
          </Text>

          <Text style={styles.answer}>
            Select your products, add them to
            your cart, proceed to checkout and
            complete your delivery information.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.question}>
            How can I view my previous orders?
          </Text>

          <Text style={styles.answer}>
            Go to Profile and select My Orders
            to view your saved order history.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.question}>
            How can I change my delivery address?
          </Text>

          <Text style={styles.answer}>
            Go to Profile, select Delivery
            Address and update your saved
            address.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.question}>
            Can I edit my profile?
          </Text>

          <Text style={styles.answer}>
            Yes. Go to Profile and tap Edit
            Profile to update your name and
            phone number.
          </Text>
        </View>

        {/* About MOM */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutLogo}>
            MOM
          </Text>

          <Text style={styles.aboutTagline}>
            When You Need Something, Think MOM.
          </Text>

          <Text style={styles.aboutDescription}>
            Grocery, skincare and everyday
            health essentials — all in one
            convenient place.
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
          <Text style={styles.backButtonText}>
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
    paddingTop: 25,
    paddingBottom: 50,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  iconBox: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#FFE5EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  headerIcon: {
    fontSize: 36,
  },

  title: {
    fontSize: 29,
    fontWeight: "900",
    color: "#FF4F72",
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#222222",
    marginBottom: 14,
    marginTop: 5,
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  menuIcon: {
    fontSize: 27,
    marginRight: 15,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222222",
  },

  menuSubtitle: {
    fontSize: 13,
    color: "#888888",
    marginTop: 4,
  },

  arrow: {
    fontSize: 30,
    color: "#FF4F72",
  },

  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
  },

  question: {
    fontSize: 15,
    fontWeight: "900",
    color: "#222222",
    marginBottom: 8,
  },

  answer: {
    fontSize: 13,
    color: "#777777",
    lineHeight: 20,
  },

  aboutCard: {
    backgroundColor: "#FFF0F4",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FFD8E2",
  },

  aboutLogo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FF4F72",
  },

  aboutTagline: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333333",
    textAlign: "center",
    marginTop: 8,
  },

  aboutDescription: {
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  version: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 12,
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
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderSuccessScreen() {
  const params =
    useLocalSearchParams<{
      orderId?: string;
    }>();

  const shortOrderId =
    params.orderId
      ? params.orderId
          .slice(-6)
          .toUpperCase()
      : "";

  return (
    <View style={styles.page}>
      <View
        style={styles.card}
      >
        <Text
          style={
            styles.successEmoji
          }
        >
          🎉
        </Text>

        <Text
          style={styles.title}
        >
          Order Placed!
        </Text>

        <Text
          style={styles.subtitle}
        >
          Thank you for shopping
          with MOM.
        </Text>

        {shortOrderId ? (
          <View
            style={
              styles.orderIdBox
            }
          >
            <Text
              style={
                styles.orderIdLabel
              }
            >
              Order Number
            </Text>

            <Text
              style={
                styles.orderId
              }
            >
              #{shortOrderId}
            </Text>
          </View>
        ) : null}

        <Text
          style={
            styles.message
          }
        >
          Your order has been
          received successfully and
          is now pending
          confirmation.
        </Text>

        {params.orderId ? (
          <TouchableOpacity
            style={
              styles.primaryButton
            }
            activeOpacity={0.8}
            onPress={() =>
              router.replace({
                pathname:
                  "/order-details",

                params: {
                  id:
                    params.orderId,
                },
              })
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              View Order Details
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={
            styles.secondaryButton
          }
          activeOpacity={0.8}
          onPress={() =>
            router.replace("/")
          }
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
      justifyContent:
        "center",
      paddingHorizontal: 20,
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 28,
      padding: 28,
      alignItems: "center",
      elevation: 4,
    },

    successEmoji: {
      fontSize: 70,
    },

    title: {
      fontSize: 30,
      fontWeight: "900",
      color: "#FF4F72",
      marginTop: 15,
    },

    subtitle: {
      fontSize: 16,
      color: "#555555",
      marginTop: 8,
      textAlign: "center",
      fontWeight: "700",
    },

    orderIdBox: {
      width: "100%",
      backgroundColor:
        "#FFF3F6",
      borderRadius: 16,
      padding: 16,
      marginTop: 22,
      alignItems: "center",
    },

    orderIdLabel: {
      fontSize: 12,
      color: "#777777",
      fontWeight: "700",
    },

    orderId: {
      fontSize: 22,
      fontWeight: "900",
      color: "#FF4F72",
      marginTop: 5,
    },

    message: {
      fontSize: 14,
      color: "#777777",
      textAlign: "center",
      lineHeight: 22,
      marginTop: 20,
      marginBottom: 23,
    },

    primaryButton: {
      width: "100%",
      backgroundColor:
        "#FF4F72",
      borderRadius: 15,
      paddingVertical: 15,
      alignItems: "center",
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 15,
    },

    secondaryButton: {
      width: "100%",
      borderWidth: 1.5,
      borderColor:
        "#FFB6C5",
      borderRadius: 15,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 12,
    },

    secondaryButtonText: {
      color: "#FF4F72",
      fontWeight: "900",
      fontSize: 15,
    },
  });
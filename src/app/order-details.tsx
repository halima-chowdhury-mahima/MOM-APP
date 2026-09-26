import { API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// TYPES
// ==========================================

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;

  paymentMethod:
    | "cash_on_delivery"
    | "mobile_banking";

  status: OrderStatus;

  createdAt: string;
};

// ==========================================
// TRACKING
// ==========================================

const trackingSteps = [
  {
    key: "pending",
    title: "Order Placed",
    description:
      "Your order has been received.",
    icon: "🧾",
  },
  {
    key: "confirmed",
    title: "Confirmed",
    description:
      "Your order has been confirmed.",
    icon: "✅",
  },
  {
    key: "shipped",
    title: "Shipped",
    description:
      "Your order is on the way.",
    icon: "🚚",
  },
  {
    key: "delivered",
    title: "Delivered",
    description:
      "Your order has been delivered.",
    icon: "📦",
  },
] as const;

// ==========================================
// SCREEN
// ==========================================

export default function OrderDetailsScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const { token } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // ==========================================
  // FETCH ORDER
  // ==========================================

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [params.id, token]);

  const fetchOrder = async () => {
    if (!params.id || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      console.log(
        "Fetching order:",
        params.id
      );

      const response = await fetch(
        `${API_URL}/api/orders/${params.id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      console.log(
        "ORDER DETAILS STATUS:",
        response.status
      );

      console.log(
        "ORDER DETAILS RESPONSE:",
        text
      );

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        Alert.alert(
          "Error",
          data?.message ||
            "Could not load order."
        );

        return;
      }

      const loadedOrder =
        data?.order || data;

      setOrder(loadedOrder);
    } catch (error) {
      console.log(
        "Order details error:",
        error
      );

      Alert.alert(
        "Connection Error",
        "Could not connect to the MOM server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (
    dateString: string
  ) => {
    try {
      return new Date(
        dateString
      ).toLocaleString(
        "en-GB"
      );
    } catch {
      return dateString;
    }
  };

  // ==========================================
  // PAYMENT
  // ==========================================

  const getPaymentText = () => {
    if (
      order?.paymentMethod ===
      "cash_on_delivery"
    ) {
      return "💵 Cash on Delivery";
    }

    return "📱 Mobile Banking";
  };

  // ==========================================
  // CURRENT TRACKING INDEX
  // ==========================================

  const getCurrentStepIndex = () => {
    if (!order) {
      return 0;
    }

    switch (order.status) {
      case "pending":
        return 0;

      case "confirmed":
        return 1;

      case "shipped":
        return 2;

      case "delivered":
        return 3;

      default:
        return 0;
    }
  };

  // ==========================================
  // STATUS TEXT
  // ==========================================

  const getStatusText = () => {
    if (!order) {
      return "";
    }

    switch (order.status) {
      case "pending":
        return "Pending";

      case "confirmed":
        return "Confirmed";

      case "shipped":
        return "Shipped";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return order.status;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <View
        style={
          styles.centerContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#FF4F72"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading order...
        </Text>
      </View>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!order) {
    return (
      <View
        style={
          styles.centerContainer
        }
      >
        <Text
          style={
            styles.emptyEmoji
          }
        >
          📦
        </Text>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Order Not Found
        </Text>

        <Text
          style={
            styles.emptyDescription
          }
        >
          We could not find this
          order.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.replace(
              "/my-orders"
            )
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Back to My Orders
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStep =
    getCurrentStepIndex();

  // ==========================================
  // UI
  // ==========================================

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Text
          style={
            styles.smallHeading
          }
        >
          MOM ORDER
        </Text>

        <Text
          style={styles.title}
        >
          📦 Order Details
        </Text>

        <Text
          style={
            styles.orderNumber
          }
        >
          Order #
          {order._id
            .slice(-6)
            .toUpperCase()}
        </Text>

        <Text
          style={styles.date}
        >
          Placed on{" "}
          {formatDate(
            order.createdAt
          )}
        </Text>
      </View>

      {/* ==============================
          STATUS
      ============================== */}

      <View style={styles.card}>
        <View
          style={
            styles.statusHeader
          }
        >
          <Text
            style={
              styles.sectionTitleNoMargin
            }
          >
            Order Status
          </Text>

          <View
            style={[
              styles.statusBadge,

              order.status ===
                "cancelled" &&
                styles.cancelledBadge,

              order.status ===
                "delivered" &&
                styles.deliveredBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,

                order.status ===
                  "cancelled" &&
                  styles.cancelledText,

                order.status ===
                  "delivered" &&
                  styles.deliveredText,
              ]}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>

        {order.status ===
        "cancelled" ? (
          <View
            style={
              styles.cancelledBox
            }
          >
            <Text
              style={
                styles.cancelledIcon
              }
            >
              ❌
            </Text>

            <View style={{ flex: 1 }}>
              <Text
                style={
                  styles.cancelledTitle
                }
              >
                Order Cancelled
              </Text>

              <Text
                style={
                  styles.cancelledDescription
                }
              >
                This order has
                been cancelled.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* TRACKING */}

            <Text
              style={
                styles.trackingHeading
              }
            >
              Track Your Order
            </Text>

            <View
              style={
                styles.trackingContainer
              }
            >
              {trackingSteps.map(
                (step, index) => {
                  const completed =
                    index <=
                    currentStep;

                  const current =
                    index ===
                    currentStep;

                  const last =
                    index ===
                    trackingSteps.length -
                      1;

                  return (
                    <View
                      key={
                        step.key
                      }
                      style={
                        styles.trackingRow
                      }
                    >
                      {/* LEFT TRACK */}

                      <View
                        style={
                          styles.trackLeft
                        }
                      >
                        <View
                          style={[
                            styles.trackCircle,

                            completed &&
                              styles.trackCircleActive,

                            current &&
                              styles.trackCircleCurrent,
                          ]}
                        >
                          <Text
                            style={
                              styles.trackIcon
                            }
                          >
                            {completed
                              ? "✓"
                              : step.icon}
                          </Text>
                        </View>

                        {!last && (
                          <View
                            style={[
                              styles.trackLine,

                              index <
                                currentStep &&
                                styles.trackLineActive,
                            ]}
                          />
                        )}
                      </View>

                      {/* TEXT */}

                      <View
                        style={
                          styles.trackContent
                        }
                      >
                        <Text
                          style={[
                            styles.trackTitle,

                            completed &&
                              styles.trackTitleActive,
                          ]}
                        >
                          {
                            step.title
                          }
                        </Text>

                        <Text
                          style={
                            styles.trackDescription
                          }
                        >
                          {
                            step.description
                          }
                        </Text>

                        {current && (
                          <Text
                            style={
                              styles.currentLabel
                            }
                          >
                            Current
                            Status
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          </>
        )}
      </View>

      {/* ==============================
          ITEMS
      ============================== */}

      <View style={styles.card}>
        <Text
          style={
            styles.sectionTitle
          }
        >
          🛍️ Ordered Items
        </Text>

        {order.items.map(
          (item, index) => {
            const itemTotal =
              Number(
                item.price
              ) *
              Number(
                item.quantity
              );

            return (
              <View
                key={`${item.product}-${index}`}
                style={
                  styles.itemRow
                }
              >
                <View
                  style={
                    styles.itemIconBox
                  }
                >
                  <Text
                    style={
                      styles.itemIcon
                    }
                  >
                    📦
                  </Text>
                </View>

                <View
                  style={
                    styles.itemInfo
                  }
                >
                  <Text
                    style={
                      styles.itemName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.itemCalculation
                    }
                  >
                    ৳{item.price} ×{" "}
                    {item.quantity}
                  </Text>
                </View>

                <Text
                  style={
                    styles.itemTotal
                  }
                >
                  ৳{itemTotal}
                </Text>
              </View>
            );
          }
        )}
      </View>

      {/* ==============================
          DELIVERY ADDRESS
      ============================== */}

      <View style={styles.card}>
        <Text
          style={
            styles.sectionTitle
          }
        >
          📍 Delivery Address
        </Text>

        <View
          style={
            styles.infoBox
          }
        >
          <Text
            style={
              styles.normalText
            }
          >
            {
              order.deliveryAddress
            }
          </Text>
        </View>
      </View>

      {/* ==============================
          PAYMENT
      ============================== */}

      <View style={styles.card}>
        <Text
          style={
            styles.sectionTitle
          }
        >
          💳 Payment
        </Text>

        <View
          style={
            styles.infoBox
          }
        >
          <Text
            style={
              styles.normalText
            }
          >
            {getPaymentText()}
          </Text>
        </View>
      </View>

      {/* ==============================
          PRICE SUMMARY
      ============================== */}

      <View style={styles.card}>
        <Text
          style={
            styles.sectionTitle
          }
        >
          💰 Order Summary
        </Text>

        <View
          style={
            styles.totalRow
          }
        >
          <Text
            style={
              styles.totalLabel
            }
          >
            Order Total
          </Text>

          <Text
            style={
              styles.totalValue
            }
          >
            ৳{order.totalAmount}
          </Text>
        </View>

        <View
          style={
            styles.deliveryNoteBox
          }
        >
          <Text
            style={
              styles.deliveryNote
            }
          >
            🚚 Delivery fee is
            included in the
            total amount.
          </Text>
        </View>
      </View>

      {/* BACK BUTTON */}

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() =>
          router.replace(
            "/my-orders"
          )
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          ← Back to My Orders
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles =
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
    },

    content: {
      padding: 18,
      paddingBottom: 50,
    },

    // CENTER

    centerContainer: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
      justifyContent:
        "center",
      alignItems:
        "center",
      padding: 20,
    },

    loadingText: {
      marginTop: 12,
      color: "#777777",
      fontWeight: "700",
    },

    // HEADER

    header: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      marginBottom: 18,
      elevation: 2,

      shadowColor:
        "#000000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    smallHeading: {
      color: "#FF4F72",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.5,
      marginBottom: 7,
    },

    title: {
      fontSize: 27,
      fontWeight: "900",
      color: "#282828",
    },

    orderNumber: {
      fontSize: 16,
      fontWeight: "900",
      marginTop: 12,
      color: "#FF4F72",
    },

    date: {
      fontSize: 12,
      color: "#888888",
      marginTop: 5,
    },

    // CARDS

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 18,
      marginBottom: 15,
      elevation: 2,

      shadowColor:
        "#000000",
      shadowOpacity: 0.04,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 14,
      color: "#282828",
    },

    sectionTitleNoMargin: {
      fontSize: 18,
      fontWeight: "900",
      color: "#282828",
    },

    // STATUS

    statusHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 20,
    },

    statusBadge: {
      backgroundColor:
        "#FFF1F4",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
    },

    statusText: {
      color: "#FF4F72",
      fontWeight: "900",
      fontSize: 12,
      textTransform:
        "capitalize",
    },

    deliveredBadge: {
      backgroundColor:
        "#EAF8EF",
    },

    deliveredText: {
      color: "#2E9B57",
    },

    cancelledBadge: {
      backgroundColor:
        "#FFF0F0",
    },

    cancelledText: {
      color: "#E53935",
    },

    // TRACKING

    trackingHeading: {
      fontSize: 14,
      fontWeight: "900",
      color: "#555555",
      marginBottom: 17,
    },

    trackingContainer: {
      paddingLeft: 2,
    },

    trackingRow: {
      flexDirection: "row",
      minHeight: 90,
    },

    trackLeft: {
      width: 48,
      alignItems: "center",
    },

    trackCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "#F1F1F1",
      justifyContent:
        "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor:
        "#E1E1E1",
      zIndex: 2,
    },

    trackCircleActive: {
      backgroundColor:
        "#FF4F72",
      borderColor:
        "#FF4F72",
    },

    trackCircleCurrent: {
      borderWidth: 4,
      borderColor:
        "#FFC0CD",
    },

    trackIcon: {
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "900",
    },

    trackLine: {
      width: 3,
      flex: 1,
      backgroundColor:
        "#E8E8E8",
    },

    trackLineActive: {
      backgroundColor:
        "#FF4F72",
    },

    trackContent: {
      flex: 1,
      paddingLeft: 10,
      paddingBottom: 20,
    },

    trackTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: "#999999",
      marginTop: 5,
    },

    trackTitleActive: {
      color: "#282828",
    },

    trackDescription: {
      fontSize: 12,
      color: "#888888",
      marginTop: 4,
      lineHeight: 18,
    },

    currentLabel: {
      alignSelf:
        "flex-start",
      backgroundColor:
        "#FFF1F4",
      color: "#FF4F72",
      fontSize: 10,
      fontWeight: "900",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginTop: 7,
    },

    // CANCELLED

    cancelledBox: {
      flexDirection: "row",
      backgroundColor:
        "#FFF5F5",
      borderRadius: 14,
      padding: 15,
      alignItems: "center",
    },

    cancelledIcon: {
      fontSize: 28,
      marginRight: 12,
    },

    cancelledTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#E53935",
    },

    cancelledDescription: {
      fontSize: 12,
      color: "#777777",
      marginTop: 3,
    },

    // ITEMS

    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F3EBE8",
    },

    itemIconBox: {
      width: 50,
      height: 50,
      borderRadius: 13,
      backgroundColor:
        "#FFF1EC",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    itemIcon: {
      fontSize: 24,
    },

    itemInfo: {
      flex: 1,
    },

    itemName: {
      fontSize: 15,
      fontWeight: "900",
      color: "#333333",
    },

    itemCalculation: {
      fontSize: 12,
      color: "#777777",
      marginTop: 4,
    },

    itemTotal: {
      fontSize: 15,
      fontWeight: "900",
      color: "#FF6548",
      marginLeft: 10,
    },

    // INFO

    infoBox: {
      backgroundColor:
        "#FFF8F5",
      borderRadius: 13,
      padding: 14,
    },

    normalText: {
      fontSize: 15,
      color: "#555555",
      lineHeight: 23,
      fontWeight: "700",
    },

    // TOTAL

    totalRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    totalLabel: {
      fontSize: 19,
      fontWeight: "900",
      color: "#282828",
    },

    totalValue: {
      fontSize: 23,
      fontWeight: "900",
      color: "#FF6548",
    },

    deliveryNoteBox: {
      backgroundColor:
        "#F1FAF4",
      borderRadius: 10,
      padding: 10,
      marginTop: 14,
    },

    deliveryNote: {
      color: "#2E8B57",
      fontSize: 12,
      fontWeight: "700",
    },

    // BUTTON

    button: {
      backgroundColor:
        "#FF4F72",
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 5,
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 15,
    },

    // EMPTY

    emptyEmoji: {
      fontSize: 50,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "900",
      marginTop: 15,
      color: "#282828",
    },

    emptyDescription: {
      color: "#777777",
      marginTop: 7,
      marginBottom: 20,
    },
  });
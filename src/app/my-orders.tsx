import { API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
};

export default function MyOrdersScreen() {
  const { token } = useAuth();

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders =
    async (
      refreshing = false
    ) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response =
          await fetch(
            `${API_URL}/api/orders/my-orders`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            "Error",
            data.message ||
              "Could not load orders."
          );

          return;
        }

        setOrders(
          data.orders || []
        );
      } catch (error) {
        console.log(
          "Orders fetch error:",
          error
        );

        Alert.alert(
          "Connection Error",
          "Could not connect to the MOM server."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

  const formatDate = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusEmoji = (
    status: Order["status"]
  ) => {
    switch (status) {
      case "pending":
        return "⏳";

      case "confirmed":
        return "✅";

      case "shipped":
        return "🚚";

      case "delivered":
        return "📦";

      case "cancelled":
        return "❌";

      default:
        return "🛍️";
    }
  };

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
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={
        styles.content
      }
      refreshControl={
        <RefreshControl
          refreshing={
            isRefreshing
          }
          onRefresh={() =>
            fetchOrders(true)
          }
        />
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View
        style={styles.header}
      >
        <Text
          style={styles.title}
        >
          📦 My Orders
        </Text>

        <Text
          style={styles.subtitle}
        >
          Track and review all
          your MOM orders.
        </Text>
      </View>

      {orders.length === 0 ? (
        <View
          style={styles.emptyBox}
        >
          <Text
            style={
              styles.emptyEmoji
            }
          >
            🛍️
          </Text>

          <Text
            style={
              styles.emptyTitle
            }
          >
            No Orders Yet
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Your placed orders
            will appear here.
          </Text>

          <TouchableOpacity
            style={
              styles.shopButton
            }
            onPress={() =>
              router.push("/")
            }
          >
            <Text
              style={
                styles.shopButtonText
              }
            >
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map(
          (order) => (
            <TouchableOpacity
              key={order._id}
              style={
                styles.orderCard
              }
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname:
                    "/order-details",

                  params: {
                    id: order._id,
                  },
                })
              }
            >
              <View
                style={
                  styles.orderTop
                }
              >
                <View>
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
                    style={
                      styles.orderDate
                    }
                  >
                    {formatDate(
                      order.createdAt
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.statusBadge
                  }
                >
                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {getStatusEmoji(
                      order.status
                    )}{" "}
                    {order.status}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Items
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {order.items.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      item.quantity,
                    0
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Payment
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {order.paymentMethod ===
                  "cash_on_delivery"
                    ? "Cash on Delivery"
                    : "Mobile Banking"}
                </Text>
              </View>

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Total
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  ৳{" "}
                  {
                    order.totalAmount
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.detailsText
                }
              >
                View Details →
              </Text>
            </TouchableOpacity>
          )
        )
      )}
    </ScrollView>
  );
}

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

    centerContainer: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
      justifyContent:
        "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 12,
      color: "#777777",
      fontWeight: "700",
    },

    header: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
    },

    title: {
      fontSize: 28,
      fontWeight: "900",
      color: "#FF4F72",
    },

    subtitle: {
      fontSize: 14,
      color: "#777777",
      marginTop: 6,
    },

    orderCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 15,
      elevation: 2,
    },

    orderTop: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      gap: 10,
    },

    orderNumber: {
      fontSize: 16,
      fontWeight: "900",
      color: "#282828",
    },

    orderDate: {
      fontSize: 12,
      color: "#888888",
      marginTop: 4,
    },

    statusBadge: {
      backgroundColor:
        "#FFF1F4",
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
    },

    statusText: {
      color: "#FF4F72",
      fontSize: 12,
      fontWeight: "900",
      textTransform:
        "capitalize",
    },

    divider: {
      height: 1,
      backgroundColor:
        "#F0E6E2",
      marginVertical: 14,
    },

    infoRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    infoLabel: {
      color: "#777777",
      fontWeight: "700",
    },

    infoValue: {
      color: "#333333",
      fontWeight: "800",
    },

    totalLabel: {
      fontSize: 16,
      fontWeight: "900",
    },

    totalValue: {
      fontSize: 18,
      fontWeight: "900",
      color: "#FF6548",
    },

    detailsText: {
      marginTop: 7,
      textAlign: "right",
      color: "#FF4F72",
      fontWeight: "900",
    },

    emptyBox: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      padding: 30,
      alignItems: "center",
    },

    emptyEmoji: {
      fontSize: 50,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "900",
      marginTop: 12,
    },

    emptyText: {
      color: "#777777",
      marginTop: 6,
      textAlign: "center",
    },

    shopButton: {
      backgroundColor:
        "#FF4F72",
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: 15,
    },

    shopButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
    },
  });
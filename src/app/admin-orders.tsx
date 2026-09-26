import { API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

import { router } from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

type OrderUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type Order = {
  _id: string;

  user:
    | OrderUser
    | string;

  items: OrderItem[];

  totalAmount: number;

  deliveryAddress: string;

  paymentMethod:
    | "cash_on_delivery"
    | "mobile_banking";

  status: OrderStatus;

  createdAt: string;
};

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersScreen() {
  const {
    token,
    user,
  } = useAuth();

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    selectedOrder,
    setSelectedOrder,
  ] =
    useState<Order | null>(
      null
    );

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const fetchOrders =
    async () => {
      if (!token) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/orders/admin/all`,
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
          "Admin orders error:",
          error
        );

        Alert.alert(
          "Connection Error",
          "Could not connect to the MOM server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    if (!user) {
      return;
    }

    if (
      user.role !== "admin"
    ) {
      Alert.alert(
        "Access Denied",
        "Admin access required.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                "/"
              ),
          },
        ]
      );

      return;
    }

    fetchOrders();
  }, [user, token]);

  const onRefresh = () => {
    setRefreshing(true);

    fetchOrders();
  };

  const openStatusModal = (
    order: Order
  ) => {
    setSelectedOrder(
      order
    );

    setModalVisible(
      true
    );
  };

  const updateStatus =
    async (
      status: OrderStatus
    ) => {
      if (
        !token ||
        !selectedOrder
      ) {
        return;
      }

      try {
        setUpdating(true);

        const response =
          await fetch(
            `${API_URL}/api/orders/admin/${selectedOrder._id}/status`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  status,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            "Error",
            data.message ||
              "Could not update order."
          );

          return;
        }

        setModalVisible(
          false
        );

        setSelectedOrder(
          null
        );

        await fetchOrders();

        Alert.alert(
          "Success",
          `Order status changed to ${status}.`
        );
      } catch (error) {
        console.log(
          "Update order error:",
          error
        );

        Alert.alert(
          "Error",
          "Could not update order status."
        );
      } finally {
        setUpdating(false);
      }
    };

  const getUserName = (
    order: Order
  ) => {
    if (
      typeof order.user ===
      "string"
    ) {
      return "MOM User";
    }

    return (
      order.user?.name ||
      "MOM User"
    );
  };

  const getUserEmail = (
    order: Order
  ) => {
    if (
      typeof order.user ===
      "string"
    ) {
      return "";
    }

    return (
      order.user?.email ||
      ""
    );
  };

  const getUserPhone = (
    order: Order
  ) => {
    if (
      typeof order.user ===
      "string"
    ) {
      return "";
    }

    return (
      order.user?.phone ||
      ""
    );
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  const getPaymentLabel = (
    method: string
  ) => {
    return method ===
      "mobile_banking"
      ? "Mobile Banking"
      : "Cash on Delivery";
  };

  if (!user) {
    return (
      <View
        style={
          styles.center
        }
      >
        <ActivityIndicator
          size="large"
          color="#FF4F72"
        />
      </View>
    );
  }

  if (
    user.role !== "admin"
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.lockEmoji
          }
        >
          🔒
        </Text>

        <Text
          style={
            styles.accessTitle
          }
        >
          Admin Access Only
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View
        style={styles.header}
      >
        <View>
          <Text
            style={styles.title}
          >
            📦 Admin Orders
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Manage customer orders
          </Text>
        </View>
      </View>

      {loading ? (
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="large"
            color="#FF4F72"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
            />
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.summaryCard
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {orders.length}
            </Text>

            <Text
              style={
                styles.summaryText
              }
            >
              Total Orders
            </Text>
          </View>

          {orders.map(
            (order) => (
              <View
                key={
                  order._id
                }
                style={
                  styles.card
                }
              >
                <View
                  style={
                    styles.cardHeader
                  }
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
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
                        styles.date
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
                      {
                        order.status
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.divider
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  👤 Customer
                </Text>

                <Text
                  style={
                    styles.customerName
                  }
                >
                  {getUserName(
                    order
                  )}
                </Text>

                {getUserEmail(
                  order
                ) ? (
                  <Text
                    style={
                      styles.secondaryText
                    }
                  >
                    {getUserEmail(
                      order
                    )}
                  </Text>
                ) : null}

                {getUserPhone(
                  order
                ) ? (
                  <Text
                    style={
                      styles.secondaryText
                    }
                  >
                    {getUserPhone(
                      order
                    )}
                  </Text>
                ) : null}

                <View
                  style={
                    styles.divider
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  🛒 Items
                </Text>

                {order.items.map(
                  (
                    item,
                    index
                  ) => (
                    <View
                      key={`${order._id}-${index}`}
                      style={
                        styles.itemRow
                      }
                    >
                      <Text
                        style={
                          styles.itemName
                        }
                      >
                        {
                          item.name
                        }{" "}
                        ×{" "}
                        {
                          item.quantity
                        }
                      </Text>

                      <Text
                        style={
                          styles.itemPrice
                        }
                      >
                        ৳{" "}
                        {item.price *
                          item.quantity}
                      </Text>
                    </View>
                  )
                )}

                <View
                  style={
                    styles.divider
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  📍 Delivery Address
                </Text>

                <Text
                  style={
                    styles.address
                  }
                >
                  {
                    order.deliveryAddress
                  }
                </Text>

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
                    {getPaymentLabel(
                      order.paymentMethod
                    )}
                  </Text>
                </View>

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
                    Total
                  </Text>

                  <Text
                    style={
                      styles.total
                    }
                  >
                    ৳{" "}
                    {
                      order.totalAmount
                    }
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.statusButton
                  }
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    openStatusModal(
                      order
                    )
                  }
                >
                  <Text
                    style={
                      styles.statusButtonText
                    }
                  >
                    Change Status
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {orders.length ===
            0 && (
            <View
              style={
                styles.empty
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
                No Orders Yet
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modal
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Update Order Status
            </Text>

            {selectedOrder ? (
              <Text
                style={
                  styles.modalOrder
                }
              >
                Order #
                {selectedOrder._id
                  .slice(-6)
                  .toUpperCase()}
              </Text>
            ) : null}

            {statuses.map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,

                    selectedOrder?.status ===
                      status &&
                      styles.statusOptionActive,
                  ]}
                  disabled={
                    updating
                  }
                  onPress={() =>
                    updateStatus(
                      status
                    )
                  }
                >
                  <Text
                    style={[
                      styles.statusOptionText,

                      selectedOrder?.status ===
                        status &&
                        styles.statusOptionTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={
                styles.cancelButton
              }
              disabled={
                updating
              }
              onPress={() => {
                setModalVisible(
                  false
                );

                setSelectedOrder(
                  null
                );
              }}
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {updating && (
              <ActivityIndicator
                style={{
                  marginTop: 15,
                }}
                color="#FF4F72"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
    },

    header: {
      backgroundColor:
        "#FFFFFF",

      paddingHorizontal: 18,

      paddingTop: 22,

      paddingBottom: 16,

      elevation: 3,
    },

    title: {
      fontSize: 25,

      fontWeight: "900",

      color: "#FF4F72",
    },

    subtitle: {
      color: "#777777",

      marginTop: 3,
    },

    content: {
      padding: 18,

      paddingBottom: 60,
    },

    center: {
      flex: 1,

      justifyContent:
        "center",

      alignItems: "center",
    },

    summaryCard: {
      backgroundColor:
        "#FF4F72",

      padding: 20,

      borderRadius: 20,

      marginBottom: 18,
    },

    summaryNumber: {
      fontSize: 30,

      fontWeight: "900",

      color: "#FFFFFF",
    },

    summaryText: {
      color: "#FFFFFF",

      fontWeight: "700",

      marginTop: 3,
    },

    card: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      padding: 16,

      marginBottom: 16,

      elevation: 2,
    },

    cardHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    orderNumber: {
      fontSize: 17,

      fontWeight: "900",

      color: "#282828",
    },

    date: {
      fontSize: 12,

      color: "#888888",

      marginTop: 4,
    },

    statusBadge: {
      backgroundColor:
        "#FFF0F4",

      paddingHorizontal: 11,

      paddingVertical: 6,

      borderRadius: 20,
    },

    statusText: {
      color: "#FF4F72",

      fontSize: 11,

      fontWeight: "900",

      textTransform:
        "capitalize",
    },

    divider: {
      height: 1,

      backgroundColor:
        "#F1E8E5",

      marginVertical: 14,
    },

    sectionTitle: {
      fontSize: 14,

      fontWeight: "900",

      color: "#444444",

      marginBottom: 7,
    },

    customerName: {
      fontSize: 15,

      fontWeight: "900",

      color: "#282828",
    },

    secondaryText: {
      fontSize: 13,

      color: "#777777",

      marginTop: 3,
    },

    itemRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      marginBottom: 8,
    },

    itemName: {
      flex: 1,

      fontSize: 14,

      color: "#444444",

      paddingRight: 10,
    },

    itemPrice: {
      fontSize: 14,

      fontWeight: "800",

      color: "#282828",
    },

    address: {
      color: "#666666",

      lineHeight: 20,
    },

    infoRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      marginTop: 15,
    },

    infoLabel: {
      color: "#777777",

      fontWeight: "700",
    },

    infoValue: {
      fontWeight: "800",

      color: "#333333",
    },

    totalRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginTop: 16,
    },

    totalLabel: {
      fontSize: 17,

      fontWeight: "900",
    },

    total: {
      fontSize: 20,

      fontWeight: "900",

      color: "#FF4F72",
    },

    statusButton: {
      backgroundColor:
        "#FF4F72",

      paddingVertical: 13,

      alignItems: "center",

      borderRadius: 14,

      marginTop: 18,
    },

    statusButtonText: {
      color: "#FFFFFF",

      fontWeight: "900",
    },

    modalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.4)",

      justifyContent:
        "flex-end",
    },

    modal: {
      backgroundColor:
        "#FFFFFF",

      padding: 20,

      borderTopLeftRadius: 28,

      borderTopRightRadius: 28,
    },

    modalTitle: {
      fontSize: 23,

      fontWeight: "900",

      color: "#FF4F72",
    },

    modalOrder: {
      color: "#777777",

      marginTop: 5,

      marginBottom: 18,
    },

    statusOption: {
      borderWidth: 1,

      borderColor:
        "#FFD0DA",

      paddingVertical: 13,

      borderRadius: 13,

      alignItems: "center",

      marginBottom: 10,
    },

    statusOptionActive: {
      backgroundColor:
        "#FF4F72",

      borderColor:
        "#FF4F72",
    },

    statusOptionText: {
      color: "#FF4F72",

      fontWeight: "900",

      textTransform:
        "capitalize",
    },

    statusOptionTextActive: {
      color: "#FFFFFF",
    },

    cancelButton: {
      paddingVertical: 14,

      alignItems: "center",

      marginTop: 5,

      marginBottom: 10,
    },

    cancelText: {
      color: "#777777",

      fontWeight: "900",
    },

    empty: {
      alignItems: "center",

      paddingVertical: 60,
    },

    emptyEmoji: {
      fontSize: 50,
    },

    emptyTitle: {
      fontSize: 20,

      fontWeight: "900",

      marginTop: 10,
    },

    lockEmoji: {
      fontSize: 50,
    },

    accessTitle: {
      fontSize: 20,

      fontWeight: "900",

      marginTop: 12,
    },
  });
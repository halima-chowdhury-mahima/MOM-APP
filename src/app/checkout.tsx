import { API_URL } from "@/config/api";
import { useAddress } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// TYPES
// ==========================================

type BackendProduct = {
  _id: string;
  name: string;
};

// ==========================================
// CHECKOUT SCREEN
// ==========================================

export default function CheckoutScreen() {
  const {
    cartItems,
    totalPrice,
    clearCart,
  } = useCart();

  const { token } = useAuth();

  const { savedAddress } =
    useAddress();

  const {
    savedName,
    savedPhone,
    saveUserInfo,
  } = useUser();

  // ==========================================
  // STATES
  // ==========================================

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState(
    "Cash on Delivery"
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  // ==========================================
  // TOTAL
  // ==========================================

  const deliveryFee =
    cartItems.length > 0
      ? 60
      : 0;

  const grandTotal =
    Number(totalPrice || 0) +
    deliveryFee;

  // ==========================================
  // LOAD SAVED USER INFO
  // ==========================================

  useEffect(() => {
    if (savedName) {
      setName(savedName);
    }

    if (savedPhone) {
      setPhone(savedPhone);
    }

    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, [
    savedName,
    savedPhone,
    savedAddress,
  ]);

  // ==========================================
  // GET BACKEND PRODUCTS
  // ==========================================

  const getBackendProducts =
    async () => {
      const response =
        await fetch(
          `${API_URL}/api/products`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not load products"
        );
      }

      if (
        Array.isArray(data)
      ) {
        return data as BackendProduct[];
      }

      if (
        Array.isArray(
          data?.products
        )
      ) {
        return data.products as BackendProduct[];
      }

      if (
        Array.isArray(
          data?.data
        )
      ) {
        return data.data as BackendProduct[];
      }

      return [];
    };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder =
    async () => {
      // --------------------------------------
      // REQUIRED FIELD CHECK
      // --------------------------------------

      if (
        !name.trim() ||
        !phone.trim() ||
        !address.trim()
      ) {
        Alert.alert(
          "Missing Information",
          "Please fill in your name, phone number and delivery address."
        );

        return;
      }

      // --------------------------------------
      // PHONE VALIDATION
      // --------------------------------------

      const cleanPhone =
        phone.replace(
          /\s+/g,
          ""
        );

      if (
        !/^01\d{9}$/.test(
          cleanPhone
        )
      ) {
        Alert.alert(
          "Invalid Phone Number",
          "Please enter a valid 11-digit Bangladesh phone number."
        );

        return;
      }

      // --------------------------------------
      // EMPTY CART
      // --------------------------------------

      if (
        cartItems.length === 0
      ) {
        Alert.alert(
          "Empty Cart",
          "Your cart is empty."
        );

        return;
      }

      // --------------------------------------
      // AUTH CHECK
      // --------------------------------------

      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login again before placing your order."
        );

        return;
      }

      try {
        setIsSubmitting(true);

        // ------------------------------------
        // SAVE NAME + PHONE
        // ------------------------------------

        await saveUserInfo(
          name.trim(),
          cleanPhone
        );

        // ------------------------------------
        // GET BACKEND PRODUCTS
        // ------------------------------------

        const backendProducts =
          await getBackendProducts();

        // ------------------------------------
        // CREATE ORDER ITEMS
        // ------------------------------------

        const orderItems =
          cartItems.map(
            (item) => {
              let productId =
                item.productId;

              // Older cart items may not
              // contain productId.
              if (!productId) {
                const matchedProduct =
                  backendProducts.find(
                    (product) =>
                      product.name
                        .trim()
                        .toLowerCase() ===
                      item.name
                        .trim()
                        .toLowerCase()
                  );

                productId =
                  matchedProduct?._id;
              }

              if (!productId) {
                throw new Error(
                  `Product ID not found for ${item.name}`
                );
              }

              return {
                product:
                  productId,

                name:
                  item.name,

                price:
                  Number(
                    item.price
                  ),

                quantity:
                  Number(
                    item.quantity
                  ),
              };
            }
          );

        // ------------------------------------
        // PAYMENT METHOD FOR BACKEND
        // ------------------------------------

        const backendPaymentMethod =
          paymentMethod ===
          "Cash on Delivery"
            ? "cash_on_delivery"
            : "mobile_banking";

        // ------------------------------------
        // ORDER BODY
        // ------------------------------------

        const orderBody = {
          items:
            orderItems,

          totalAmount:
            grandTotal,

          deliveryAddress:
            address.trim(),

          paymentMethod:
            backendPaymentMethod,
        };

        console.log(
          "=============================="
        );

        console.log(
          "PLACING ORDER..."
        );

        console.log(
          "ORDER BODY:",
          JSON.stringify(
            orderBody,
            null,
            2
          )
        );

        console.log(
          "=============================="
        );

        // ------------------------------------
        // SEND ORDER
        // ------------------------------------

        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  orderBody
                ),
            }
          );

        const responseText =
          await response.text();

        console.log(
          "ORDER STATUS:",
          response.status
        );

        console.log(
          "ORDER RESPONSE:",
          responseText
        );

        let data: any = {};

        try {
          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};
        } catch {
          data = {};
        }

        // ------------------------------------
        // ERROR
        // ------------------------------------

        if (!response.ok) {
          Alert.alert(
            "Order Failed",
            data?.message ||
              "Could not place order."
          );

          return;
        }

        // ------------------------------------
        // SUCCESS
        // ------------------------------------

        const orderId =
          data?.order?._id ||
          data?._id ||
          data?.orderId ||
          "";

        console.log(
          "ORDER CREATED ✅"
        );

        console.log(
          "ORDER ID:",
          orderId
        );

        clearCart();

        router.replace({
          pathname:
            "/order-success",

          params: {
            orderId:
              String(orderId),
          },
        });
      } catch (
        error: any
      ) {
        console.log(
          "ORDER ERROR ❌",
          error
        );

        Alert.alert(
          "Order Failed",
          error?.message ||
            "Something went wrong while placing your order."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  // ==========================================
  // UI
  // ==========================================

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <View
        style={
          styles.header
        }
      >
        <Text
          style={
            styles.smallTitle
          }
        >
          MOM CHECKOUT
        </Text>

        <Text
          style={
            styles.title
          }
        >
          🧾 Checkout
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Review your order
          and enter your
          delivery information.
        </Text>
      </View>

      {/* ======================================
          CUSTOMER INFORMATION
      ====================================== */}

      <View
        style={
          styles.sectionCard
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          👤 Customer
          Information
        </Text>

        {/* NAME */}

        <Text
          style={
            styles.inputLabel
          }
        >
          Full Name *
        </Text>

        <TextInput
          style={
            styles.input
          }
          placeholder="Enter your full name"
          placeholderTextColor="#999999"
          value={name}
          onChangeText={
            setName
          }
          autoCapitalize="words"
        />

        {/* PHONE */}

        <Text
          style={
            styles.inputLabel
          }
        >
          Phone Number *
        </Text>

        <TextInput
          style={
            styles.input
          }
          placeholder="01XXXXXXXXX"
          placeholderTextColor="#999999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={
            setPhone
          }
          maxLength={11}
        />

        <Text
          style={
            styles.helperText
          }
        >
          Enter an
          11-digit Bangladesh
          phone number.
        </Text>

        {/* ADDRESS */}

        <Text
          style={
            styles.inputLabel
          }
        >
          Delivery Address *
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.addressInput,
          ]}
          placeholder="House, road, area, city..."
          placeholderTextColor="#999999"
          multiline
          textAlignVertical="top"
          value={address}
          onChangeText={
            setAddress
          }
        />
      </View>

      {/* ======================================
          PAYMENT METHOD
      ====================================== */}

      <View
        style={
          styles.sectionCard
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          💳 Payment Method
        </Text>

        {/* CASH ON DELIVERY */}

        <TouchableOpacity
          style={[
            styles.paymentOption,

            paymentMethod ===
              "Cash on Delivery" &&
              styles.selectedPayment,
          ]}
          activeOpacity={
            0.8
          }
          onPress={() =>
            setPaymentMethod(
              "Cash on Delivery"
            )
          }
        >
          <View
            style={[
              styles.radioOuter,

              paymentMethod ===
                "Cash on Delivery" &&
                styles.radioOuterSelected,
            ]}
          >
            {paymentMethod ===
              "Cash on Delivery" && (
              <View
                style={
                  styles.radioInner
                }
              />
            )}
          </View>

          <View
            style={
              styles.paymentInfo
            }
          >
            <Text
              style={
                styles.paymentTitle
              }
            >
              💵 Cash on
              Delivery
            </Text>

            <Text
              style={
                styles.paymentSubtitle
              }
            >
              Pay when your
              order arrives
            </Text>
          </View>

          <View
            style={
              styles.recommendedBadge
            }
          >
            <Text
              style={
                styles.recommendedText
              }
            >
              Recommended
            </Text>
          </View>
        </TouchableOpacity>

        {/* MOBILE BANKING */}

        <TouchableOpacity
          style={[
            styles.paymentOption,

            paymentMethod ===
              "Mobile Banking" &&
              styles.selectedPayment,
          ]}
          activeOpacity={
            0.8
          }
          onPress={() =>
            setPaymentMethod(
              "Mobile Banking"
            )
          }
        >
          <View
            style={[
              styles.radioOuter,

              paymentMethod ===
                "Mobile Banking" &&
                styles.radioOuterSelected,
            ]}
          >
            {paymentMethod ===
              "Mobile Banking" && (
              <View
                style={
                  styles.radioInner
                }
              />
            )}
          </View>

          <View
            style={
              styles.paymentInfo
            }
          >
            <Text
              style={
                styles.paymentTitle
              }
            >
              📱 Mobile Banking
            </Text>

            <Text
              style={
                styles.paymentSubtitle
              }
            >
              bKash / Nagad
            </Text>
          </View>
        </TouchableOpacity>

        {paymentMethod ===
          "Mobile Banking" && (
          <View
            style={
              styles.noticeBox
            }
          >
            <Text
              style={
                styles.noticeTitle
              }
            >
              ⚠️ Demo Payment
            </Text>

            <Text
              style={
                styles.noticeText
              }
            >
              Mobile Banking
              is currently a
              demo payment
              option. Use Cash
              on Delivery while
              testing real
              orders.
            </Text>
          </View>
        )}
      </View>

      {/* ======================================
          ORDER SUMMARY
      ====================================== */}

      <View
        style={
          styles.sectionCard
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          🛍️ Order Summary
        </Text>

        {cartItems.length ===
        0 ? (
          <View
            style={
              styles.emptyCart
            }
          >
            <Text
              style={
                styles.emptyEmoji
              }
            >
              🛒
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Your cart is
              empty.
            </Text>
          </View>
        ) : (
          cartItems.map(
            (
              item,
              index
            ) => {
              const price =
                Number(
                  item.price ||
                    0
                );

              const quantity =
                Number(
                  item.quantity ||
                    1
                );

              const itemSubtotal =
                price *
                quantity;

              const validImage =
                typeof item.image ===
                  "string" &&
                item.image
                  .trim()
                  .startsWith(
                    "http"
                  );

              return (
                <View
                  key={
                    item.productId ||
                    `${item.name}-${index}`
                  }
                  style={
                    styles.orderItem
                  }
                >
                  {/* REAL PRODUCT IMAGE */}

                  <View
                    style={
                      styles.orderImageBox
                    }
                  >
                    {validImage ? (
                      <Image
                        source={{
                          uri: item.image,
                        }}
                        style={
                          styles.orderImage
                        }
                        resizeMode="contain"
                        onLoad={() =>
                          console.log(
                            "CHECKOUT IMAGE LOADED ✅",
                            item.name
                          )
                        }
                        onError={(
                          event
                        ) =>
                          console.log(
                            "CHECKOUT IMAGE ERROR ❌",
                            item.name,
                            event
                              .nativeEvent
                              .error
                          )
                        }
                      />
                    ) : (
                      <Text
                        style={
                          styles.orderEmoji
                        }
                      >
                        {item.emoji ||
                          "📦"}
                      </Text>
                    )}
                  </View>

                  {/* INFO */}

                  <View
                    style={
                      styles.orderInfo
                    }
                  >
                    {!!item.brand && (
                      <Text
                        style={
                          styles.brand
                        }
                      >
                        {
                          item.brand
                        }
                      </Text>
                    )}

                    <Text
                      style={
                        styles.orderName
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={
                        styles.orderCalculation
                      }
                    >
                      ৳{price} ×{" "}
                      {quantity}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.itemSubtotal
                    }
                  >
                    ৳
                    {
                      itemSubtotal
                    }
                  </Text>
                </View>
              );
            }
          )
        )}

        {/* DIVIDER */}

        <View
          style={
            styles.divider
          }
        />

        {/* SUBTOTAL */}

        <View
          style={
            styles.summaryRow
          }
        >
          <Text
            style={
              styles.summaryLabel
            }
          >
            Cart Subtotal
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            ৳
            {Number(
              totalPrice ||
                0
            )}
          </Text>
        </View>

        {/* DELIVERY */}

        <View
          style={
            styles.summaryRow
          }
        >
          <Text
            style={
              styles.summaryLabel
            }
          >
            Delivery Fee
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            ৳{deliveryFee}
          </Text>
        </View>

        <View
          style={
            styles.totalDivider
          }
        />

        {/* TOTAL */}

        <View
          style={
            styles.summaryRow
          }
        >
          <Text
            style={
              styles.totalLabel
            }
          >
            Grand Total
          </Text>

          <Text
            style={
              styles.totalValue
            }
          >
            ৳{grandTotal}
          </Text>
        </View>

        <View
          style={
            styles.deliveryBox
          }
        >
          <Text
            style={
              styles.deliveryText
            }
          >
            🚚 Delivery Fee:
            ৳60
          </Text>
        </View>
      </View>

      {/* ======================================
          PLACE ORDER
      ====================================== */}

      <TouchableOpacity
        style={[
          styles.placeOrderButton,

          (isSubmitting ||
            cartItems.length ===
              0) &&
            styles.disabledButton,
        ]}
        disabled={
          isSubmitting ||
          cartItems.length ===
            0
        }
        activeOpacity={
          0.85
        }
        onPress={
          handlePlaceOrder
        }
      >
        {isSubmitting ? (
          <View
            style={
              styles.loadingRow
            }
          >
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />

            <Text
              style={
                styles.loadingButtonText
              }
            >
              Placing Order...
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.placeOrderContent
            }
          >
            <View>
              <Text
                style={
                  styles.placeOrderButtonText
                }
              >
                Place Order
              </Text>

              <Text
                style={
                  styles.placeOrderSubtext
                }
              >
                {paymentMethod}
              </Text>
            </View>

            <Text
              style={
                styles.placeOrderPrice
              }
            >
              ৳{grandTotal}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* BACK TO CART */}

      <TouchableOpacity
        style={
          styles.backToCartButton
        }
        activeOpacity={
          0.8
        }
        onPress={() =>
          router.back()
        }
      >
        <Text
          style={
            styles.backToCartButtonText
          }
        >
          ← Back to Cart
        </Text>
      </TouchableOpacity>

      <View
        style={{
          height: 30,
        }}
      />
    </ScrollView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 25,
      paddingBottom: 50,
    },

    // ======================================
    // HEADER
    // ======================================

    header: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
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

    smallTitle: {
      color: "#FF4F72",
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 1.5,
      marginBottom: 6,
    },

    title: {
      fontSize: 30,
      fontWeight: "900",
      color: "#282828",
    },

    subtitle: {
      fontSize: 15,
      color: "#666666",
      lineHeight: 22,
      marginTop: 7,
    },

    // ======================================
    // SECTION
    // ======================================

    sectionCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      padding: 18,
      marginBottom: 18,
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
      fontSize: 20,
      fontWeight: "900",
      color: "#282828",
      marginBottom: 18,
    },

    // ======================================
    // INPUT
    // ======================================

    inputLabel: {
      fontSize: 14,
      fontWeight: "800",
      color: "#444444",
      marginBottom: 8,
    },

    input: {
      minHeight: 52,
      backgroundColor:
        "#FFF8F5",
      borderWidth: 1,
      borderColor:
        "#F1E4DF",
      borderRadius: 14,
      paddingHorizontal: 14,
      fontSize: 15,
      color: "#222222",
      marginBottom: 16,
    },

    helperText: {
      fontSize: 11,
      color: "#888888",
      marginTop: -10,
      marginBottom: 16,
    },

    addressInput: {
      minHeight: 105,
      paddingTop: 14,
    },

    // ======================================
    // PAYMENT
    // ======================================

    paymentOption: {
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1.5,
      borderColor:
        "#F0E2DE",
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },

    selectedPayment: {
      borderColor:
        "#FF4F72",
      backgroundColor:
        "#FFF4F6",
    },

    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor:
        "#C8C8C8",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 12,
    },

    radioOuterSelected: {
      borderColor:
        "#FF4F72",
    },

    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor:
        "#FF4F72",
    },

    paymentInfo: {
      flex: 1,
    },

    paymentTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#282828",
    },

    paymentSubtitle: {
      fontSize: 13,
      color: "#777777",
      marginTop: 3,
    },

    recommendedBadge: {
      backgroundColor:
        "#E9F8EE",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    recommendedText: {
      color: "#2E9B57",
      fontSize: 9,
      fontWeight: "900",
    },

    noticeBox: {
      backgroundColor:
        "#FFF8E8",
      borderRadius: 12,
      padding: 12,
    },

    noticeTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: "#80652A",
      marginBottom: 4,
    },

    noticeText: {
      fontSize: 13,
      color: "#80652A",
      lineHeight: 19,
    },

    // ======================================
    // ORDER PRODUCTS
    // ======================================

    orderItem: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F6EFEC",
    },

    orderImageBox: {
      width: 62,
      height: 62,
      borderRadius: 14,
      backgroundColor:
        "#FFF1EC",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 12,
      overflow: "hidden",
    },

    orderImage: {
      width: "90%",
      height: "90%",
      borderRadius: 10,
    },

    orderEmoji: {
      fontSize: 30,
    },

    orderInfo: {
      flex: 1,
    },

    brand: {
      color: "#FF4F72",
      fontSize: 10,
      fontWeight: "900",
      textTransform:
        "uppercase",
      marginBottom: 3,
    },

    orderName: {
      fontSize: 15,
      fontWeight: "900",
      color: "#282828",
    },

    orderCalculation: {
      fontSize: 13,
      color: "#777777",
      marginTop: 4,
    },

    itemSubtotal: {
      fontSize: 15,
      fontWeight: "900",
      color: "#FF6548",
      marginLeft: 8,
    },

    // ======================================
    // SUMMARY
    // ======================================

    divider: {
      height: 1,
      backgroundColor:
        "#EFE7E4",
      marginVertical: 14,
    },

    summaryRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 12,
    },

    summaryLabel: {
      fontSize: 15,
      color: "#666666",
      fontWeight: "700",
    },

    summaryValue: {
      fontSize: 16,
      color: "#282828",
      fontWeight: "800",
    },

    totalDivider: {
      height: 1.5,
      backgroundColor:
        "#F0E4E0",
      marginBottom: 15,
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

    deliveryBox: {
      backgroundColor:
        "#F1FAF4",
      padding: 10,
      borderRadius: 10,
      marginTop: 5,
    },

    deliveryText: {
      color: "#2E8B57",
      fontSize: 12,
      fontWeight: "700",
    },

    // ======================================
    // EMPTY
    // ======================================

    emptyCart: {
      alignItems:
        "center",
      paddingVertical: 25,
    },

    emptyEmoji: {
      fontSize: 42,
    },

    emptyText: {
      marginTop: 8,
      color: "#777777",
      fontWeight: "700",
    },

    // ======================================
    // PLACE ORDER
    // ======================================

    placeOrderButton: {
      backgroundColor:
        "#FF4F72",
      borderRadius: 17,
      paddingVertical: 16,
      paddingHorizontal: 18,
      elevation: 3,
    },

    placeOrderContent: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    placeOrderButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
    },

    placeOrderSubtext: {
      color: "#FFE6EC",
      fontSize: 11,
      marginTop: 3,
      fontWeight: "600",
    },

    placeOrderPrice: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
    },

    loadingRow: {
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      gap: 10,
    },

    loadingButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },

    disabledButton: {
      opacity: 0.6,
    },

    // ======================================
    // BACK
    // ======================================

    backToCartButton: {
      borderWidth: 1.5,
      borderColor:
        "#FFB8C6",
      borderRadius: 16,
      paddingVertical: 14,
      alignItems:
        "center",
      marginTop: 12,
    },

    backToCartButtonText: {
      color: "#FF4F72",
      fontSize: 15,
      fontWeight: "900",
    },
  });
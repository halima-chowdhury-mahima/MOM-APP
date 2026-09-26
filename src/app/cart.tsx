import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { router } from "expo-router";

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalPrice,
  } = useCart();

  // ==========================================
  // DELIVERY
  // ==========================================

  const deliveryFee = cartItems.length > 0 ? 60 : 0;

  const grandTotal =
    Number(totalPrice || 0) + deliveryFee;

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  const handleRemove = (
  productId: string,
  name: string
) => {
  Alert.alert(
    "Remove Product",
    `Remove ${name} from your cart?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          removeFromCart(productId),
      },
    ]
  );
};

  // ==========================================
  // CHECKOUT
  // ==========================================

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Cart Empty",
        "Please add a product before checkout."
      );

      return;
    }

    router.push("/checkout");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.smallTitle}>
            MOM SHOPPING
          </Text>

          <Text style={styles.title}>
            🛒 My Cart
          </Text>

          <Text style={styles.subtitle}>
            Review your selected products before
            checkout.
          </Text>
        </View>

        {/* EMPTY CART */}

        {cartItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>
              🛍️
            </Text>

            <Text style={styles.emptyTitle}>
              Your Cart is Empty
            </Text>

            <Text style={styles.emptyText}>
              Add Grocery, Skincare or Health
              products and they will appear here.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/grocery")
              }
            >
              <Text style={styles.shopButtonText}>
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* CART COUNT */}

            <View style={styles.cartCountRow}>
              <Text style={styles.cartCountTitle}>
                Your Products
              </Text>

              <Text style={styles.cartCount}>
                {cartItems.length} item
                {cartItems.length > 1 ? "s" : ""}
              </Text>
            </View>

            {/* PRODUCTS */}

            {cartItems.map((item, index) => {
              const price = Number(
                item.price || 0
              );

              const quantity = Number(
                item.quantity || 1
              );

              const subtotal =
                price * quantity;

              const validImage =
                typeof item.image === "string" &&
                item.image
                  .trim()
                  .startsWith("http");

              return (
                <View
                  key={
                    item.productId ||
                    `${item.name}-${index}`
                  }
                  style={styles.cartCard}
                >
                  {/* IMAGE */}

                  <View style={styles.imageBox}>
                    {validImage ? (
                      <Image
                        source={{
                          uri: item.image,
                        }}
                        style={styles.productImage}
                        resizeMode="contain"
                        onError={(event) =>
                          console.log(
                            "Cart image error:",
                            item.name,
                            event.nativeEvent.error
                          )
                        }
                      />
                    ) : (
                      <Text
                        style={styles.productEmoji}
                      >
                        {item.emoji || "📦"}
                      </Text>
                    )}
                  </View>

                  {/* PRODUCT CONTENT */}

                  <View
                    style={styles.productContent}
                  >
                    {!!item.brand && (
                      <Text style={styles.brand}>
                        {item.brand}
                      </Text>
                    )}

                    <Text
                      style={styles.productName}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text style={styles.unitPrice}>
                      ৳{price} each
                    </Text>

                    {/* QUANTITY */}

                    <View
                      style={styles.quantityRow}
                    >
                      <TouchableOpacity
                        style={
                          styles.quantityButton
                        }
                        activeOpacity={0.8}
                        onPress={() => {
  if (!item.productId) {
    Alert.alert(
      "Cart Error",
      "Product ID is missing. Please remove this old cart item and add it again."
    );
    return;
  }

  decreaseQuantity(item.productId);
}}
                      >
                        <Text
                          style={
                            styles.quantityButtonText
                          }
                        >
                          −
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={
                          styles.quantityBox
                        }
                      >
                        <Text
                          style={styles.quantity}
                        >
                          {quantity}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={
                          styles.quantityButton
                        }
                        activeOpacity={0.8}
                        onPress={() => {
  if (!item.productId) {
    Alert.alert(
      "Cart Error",
      "Product ID is missing. Please remove this old cart item and add it again."
    );
    return;
  }

  increaseQuantity(item.productId);
}}
                      >
                        <Text
                          style={
                            styles.quantityButtonText
                          }
                        >
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* SUBTOTAL */}

                    <View
                      style={styles.subtotalBox}
                    >
                      <Text
                        style={styles.subtotalText}
                      >
                        ৳{price} × {quantity}
                      </Text>

                      <Text
                        style={
                          styles.subtotalPrice
                        }
                      >
                        ৳{subtotal}
                      </Text>
                    </View>

                    {/* REMOVE */}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
  if (!item.productId) {
    Alert.alert(
      "Cart Error",
      "This is an old cart item. Clear the cart and add the product again."
    );
    return;
  }

  handleRemove(
    item.productId,
    item.name
  );
}}
                    >
                      <Text
                        style={styles.removeText}
                      >
                        🗑 Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* ORDER SUMMARY */}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                Order Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text
                  style={styles.summaryLabel}
                >
                  Subtotal
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  ৳{totalPrice}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text
                  style={styles.summaryLabel}
                >
                  Delivery Fee
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  ৳{deliveryFee}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalValue}>
                  ৳{grandTotal}
                </Text>
              </View>

              <Text style={styles.deliveryNote}>
                🚚 Delivery charge will be
                confirmed during checkout.
              </Text>
            </View>

            {/* CHECKOUT */}

            <TouchableOpacity
              style={styles.checkoutButton}
              activeOpacity={0.85}
              onPress={handleCheckout}
            >
              <View>
                <Text
                  style={
                    styles.checkoutButtonText
                  }
                >
                  Proceed to Checkout
                </Text>

                <Text
                  style={styles.checkoutSubtext}
                >
                  Cash on Delivery available
                </Text>
              </View>

              <Text style={styles.checkoutArrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* CONTINUE SHOPPING */}

            <TouchableOpacity
              style={styles.addMoreButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/grocery")
              }
            >
              <Text
                style={styles.addMoreButtonText}
              >
                + Continue Shopping
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 120,
  },

  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },

  smallTitle: {
    color: "#FF4F72",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#282828",
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 7,
    lineHeight: 21,
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 45,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 2,
  },

  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#282828",
  },

  emptyText: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  shopButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
    marginTop: 22,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  cartCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  cartCountTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#282828",
  },

  cartCount: {
    color: "#777777",
    fontSize: 13,
    fontWeight: "700",
  },

  cartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 15,
    flexDirection: "row",
    elevation: 3,

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  imageBox: {
    width: 105,
    height: 115,
    borderRadius: 18,
    backgroundColor: "#FFF1EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },

  productImage: {
    width: "90%",
    height: "90%",
  },

  productEmoji: {
    fontSize: 48,
  },

  productContent: {
    flex: 1,
  },

  brand: {
    color: "#FF4F72",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 3,
  },

  productName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#282828",
  },

  unitPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF6548",
    marginTop: 5,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF1EC",
    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonText: {
    fontSize: 21,
    fontWeight: "900",
    color: "#FF4F72",
  },

  quantityBox: {
    minWidth: 44,
    alignItems: "center",
  },

  quantity: {
    fontSize: 17,
    fontWeight: "900",
    color: "#282828",
  },

  subtotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF8F5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
  },

  subtotalText: {
    fontSize: 12,
    color: "#777777",
    fontWeight: "700",
  },

  subtotalPrice: {
    fontSize: 15,
    color: "#FF6548",
    fontWeight: "900",
  },

  removeText: {
    color: "#FF4F72",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#282828",
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "700",
  },

  summaryValue: {
    fontSize: 15,
    color: "#282828",
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E7E4",
    marginVertical: 6,
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 18,
    color: "#282828",
    fontWeight: "900",
  },

  totalValue: {
    fontSize: 22,
    color: "#FF6548",
    fontWeight: "900",
  },

  deliveryNote: {
    backgroundColor: "#FFF8F5",
    color: "#777777",
    fontSize: 12,
    lineHeight: 18,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },

  checkoutButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 17,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginTop: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  checkoutSubtext: {
    color: "#FFE8EE",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  checkoutArrow: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "400",
  },

  addMoreButton: {
    borderWidth: 1.5,
    borderColor: "#FFB5C4",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  addMoreButtonText: {
    color: "#FF4F72",
    fontSize: 15,
    fontWeight: "900",
  },
});
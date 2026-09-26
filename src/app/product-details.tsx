import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoriteContext";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetailsScreen() {
  
  const params = useLocalSearchParams();

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  // ==========================================
  // PRODUCT DATA FROM ROUTER PARAMS
  // ==========================================

  const productId = String(params.id || "");

  const name = String(params.name || "Product");

  const brand = String(params.brand || "");

  const price = Number(params.price || 0);

  const oldPrice = Number(params.oldPrice || 0);

  const category = String(params.category || "General");

  const subcategory = String(params.subcategory || "");

  const image = String(params.image || "");

  const emoji = String(params.emoji || "🛍️");

  const description = String(
    params.description || "Product description is not available."
  );

  const stock = Number(params.stock || 0);

  const rating = Number(params.rating || 0);

  const reviewCount = Number(params.reviewCount || 0);

  // ==========================================
  // STATE
  // ==========================================

  const [quantity, setQuantity] = useState(1);

  const [imageError, setImageError] = useState(false);

  // ==========================================
  // DEBUG
  // ==========================================

  console.log("==============================");
  console.log("PRODUCT DETAILS OPENED");
  console.log("PRODUCT ID =", productId);
  console.log("PRODUCT NAME =", name);
  console.log("PRODUCT IMAGE =", image);
  console.log("==============================");

  // ==========================================
  // IMAGE
  // ==========================================

  const hasImage =
    image.trim().startsWith("https://") ||
    image.trim().startsWith("http://");

  const showImage = hasImage && !imageError;

  // ==========================================
  // STOCK
  // ==========================================

  const outOfStock = stock <= 0;

  // ==========================================
  // DISCOUNT
  // ==========================================

  const discount = useMemo(() => {
    if (!oldPrice || oldPrice <= price) {
      return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }, [oldPrice, price]);

  // ==========================================
  // TOTAL
  // ==========================================

  const totalPrice = price * quantity;

  // ==========================================
  // QUANTITY
  // ==========================================

  const increaseQuantity = () => {
    if (outOfStock) {
      return;
    }

    setQuantity((current) => {
      if (stock > 0 && current >= stock) {
        return current;
      }

      return current + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => {
      if (current <= 1) {
        return 1;
      }

      return current - 1;
    });
  };

  // ==========================================
  // FAVORITE
  // ==========================================

  const handleFavorite = () => {
    toggleFavorite({
      name,
      price,
      emoji,
      category,
    });
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = () => {
    if (outOfStock) {
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId,
        name,
        price,
        emoji,
        image,
        brand,
      });
    }

    router.push("/cart");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* BACK BUTTON */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      {/* PRODUCT CARD */}

      <View style={styles.card}>
        {/* IMAGE */}

        <View style={styles.imageBox}>
          {showImage ? (
            <Image
              source={{
                uri: image,
              }}
              style={styles.productImage}
              resizeMode="contain"
              onLoad={() => {
                console.log("PRODUCT IMAGE LOADED ✅");
                console.log(image);
              }}
              onError={(event) => {
                console.log("PRODUCT IMAGE FAILED ❌");
                console.log(event.nativeEvent);
                console.log("FAILED URL =", image);

                setImageError(true);
              }}
            />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.productEmoji}>
                {emoji || "🛍️"}
              </Text>

              {imageError && (
                <Text style={styles.imageErrorText}>
                  Image could not be loaded
                </Text>
              )}
            </View>
          )}

          {/* FAVORITE */}

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
            activeOpacity={0.8}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite(name) ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PRODUCT INFORMATION */}

        <View style={styles.info}>
          {/* CATEGORY */}

          <Text style={styles.category}>
            {category}

            {subcategory ? ` • ${subcategory}` : ""}
          </Text>

          {/* NAME */}

          <Text style={styles.productName}>
            {name}
          </Text>

          {/* BRAND */}

          {brand ? (
            <Text style={styles.brand}>
              Brand: {brand}
            </Text>
          ) : null}

          {/* RATING */}

          {rating > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>

              <Text style={styles.rating}>
                {rating.toFixed(1)}
              </Text>

              {reviewCount > 0 && (
                <Text style={styles.review}>
                  ({reviewCount} reviews)
                </Text>
              )}
            </View>
          )}

          {/* PRICE */}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ৳ {price}
            </Text>

            {oldPrice > price && (
              <Text style={styles.oldPrice}>
                ৳ {oldPrice}
              </Text>
            )}

            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {discount}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* STOCK */}

          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                outOfStock && styles.outOfStockDot,
              ]}
            />

            <Text
              style={[
                styles.stockText,
                outOfStock && styles.outOfStockText,
              ]}
            >
              {outOfStock
                ? "Out of Stock"
                : `In Stock • ${stock} available`}
            </Text>
          </View>

          {/* DIVIDER */}

          <View style={styles.divider} />

          {/* DESCRIPTION */}

          <Text style={styles.sectionTitle}>
            Product Description
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>

          {!outOfStock && (
            <>
              <View style={styles.divider} />

              {/* QUANTITY */}

              <Text style={styles.sectionTitle}>
                Quantity
              </Text>

              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Text style={styles.quantityButtonText}>
                    −
                  </Text>
                </TouchableOpacity>

                <View style={styles.quantityNumberBox}>
                  <Text style={styles.quantityNumber}>
                    {quantity}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Text style={styles.quantityButtonText}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TOTAL */}

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalPrice}>
                  ৳ {totalPrice}
                </Text>
              </View>
            </>
          )}

          {/* ADD TO CART */}

          <TouchableOpacity
            style={[
              styles.addButton,
              outOfStock && styles.disabledButton,
            ]}
            disabled={outOfStock}
            activeOpacity={0.85}
            onPress={handleAddToCart}
          >
            <Text style={styles.cartIcon}>
              🛒
            </Text>

            <Text style={styles.addButtonText}>
              {outOfStock
                ? "Out of Stock"
                : `Add ${quantity} to Cart`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 50,
  },

  // BACK

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 15,
  },

  backText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FF4168",
  },

  // CARD

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 15,

    elevation: 5,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  // IMAGE

  imageBox: {
    width: "100%",
    height: 330,

    backgroundColor: "#FFF1EC",

    borderRadius: 24,

    overflow: "hidden",

    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  placeholderBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  productEmoji: {
    fontSize: 100,
  },

  imageErrorText: {
    marginTop: 10,
    color: "#888",
    fontSize: 13,
  },

  // FAVORITE

  favoriteButton: {
    position: "absolute",

    top: 14,
    right: 14,

    width: 54,
    height: 54,

    borderRadius: 27,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    elevation: 5,
  },

  favoriteIcon: {
    fontSize: 27,
  },

  // INFO

  info: {
    paddingHorizontal: 5,
    paddingTop: 22,
    paddingBottom: 8,
  },

  category: {
    color: "#FF4168",

    fontSize: 15,
    fontWeight: "900",

    textTransform: "capitalize",

    marginBottom: 8,
  },

  productName: {
    color: "#202020",

    fontSize: 31,
    lineHeight: 38,

    fontWeight: "900",
  },

  brand: {
    color: "#777",

    fontSize: 15,
    fontWeight: "600",

    marginTop: 7,
  },

  // RATING

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 12,
  },

  star: {
    color: "#FFB000",

    fontSize: 23,

    marginRight: 6,
  },

  rating: {
    color: "#282828",

    fontSize: 16,
    fontWeight: "900",
  },

  review: {
    color: "#888",

    fontSize: 14,

    marginLeft: 7,
  },

  // PRICE

  priceRow: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",

    marginTop: 18,
  },

  price: {
    color: "#FF4F45",

    fontSize: 29,
    fontWeight: "900",
  },

  oldPrice: {
    color: "#999",

    fontSize: 17,

    textDecorationLine: "line-through",

    marginLeft: 14,
  },

  discountBadge: {
    backgroundColor: "#FF4168",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 10,

    marginLeft: 13,
  },

  discountText: {
    color: "#FFFFFF",

    fontSize: 12,
    fontWeight: "900",
  },

  // STOCK

  stockRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 16,
  },

  stockDot: {
    width: 11,
    height: 11,

    borderRadius: 6,

    backgroundColor: "#18B63C",

    marginRight: 8,
  },

  outOfStockDot: {
    backgroundColor: "#DC3545",
  },

  stockText: {
    color: "#159B31",

    fontSize: 15,
    fontWeight: "700",
  },

  outOfStockText: {
    color: "#DC3545",
  },

  // DIVIDER

  divider: {
    height: 1,

    backgroundColor: "#EEEEEE",

    marginVertical: 22,
  },

  // DESCRIPTION

  sectionTitle: {
    color: "#282828",

    fontSize: 19,
    fontWeight: "900",

    marginBottom: 10,
  },

  description: {
    color: "#666",

    fontSize: 15,

    lineHeight: 23,
  },

  // QUANTITY

  quantityRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  quantityButton: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: "#FFF0F0",

    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonText: {
    color: "#FF4168",

    fontSize: 28,
    fontWeight: "900",
  },

  quantityNumberBox: {
    width: 70,
    height: 52,

    justifyContent: "center",
    alignItems: "center",
  },

  quantityNumber: {
    color: "#282828",

    fontSize: 21,
    fontWeight: "900",
  },

  // TOTAL

  totalBox: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "#FFF5F2",

    borderRadius: 18,

    paddingHorizontal: 18,
    paddingVertical: 20,

    marginTop: 25,
  },

  totalLabel: {
    color: "#444",

    fontSize: 18,
    fontWeight: "900",
  },

  totalPrice: {
    color: "#FF4F45",

    fontSize: 25,
    fontWeight: "900",
  },

  // CART

  addButton: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FF4168",

    borderRadius: 17,

    paddingVertical: 18,

    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: "#BBBBBB",

    opacity: 0.7,
  },

  cartIcon: {
    fontSize: 20,

    marginRight: 9,
  },

  addButtonText: {
    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "900",
  },
});
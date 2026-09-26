import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoriteContext";
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

export default function FavoritesScreen() {
  const {
    favorites,
    removeFavorite,
    isLoaded,
  } = useFavorites();

  const { addToCart } = useCart();

  // ==========================================
  // PRODUCT DETAILS
  // ==========================================

  const openProductDetails = (item: any) => {
    router.push({
      pathname: "/product-details",
      params: {
        id: item.productId,
        name: item.name,
        brand: item.brand || "",
        price: String(item.price || 0),
        oldPrice: String(item.oldPrice || 0),
        image: item.image || "",
        emoji: item.emoji || "📦",
        category: item.category || "",
        subcategory: item.subcategory || "",
        description: item.description || "",
        stock: String(item.stock || 0),
        rating: String(item.rating || 0),
        reviewCount: String(
          item.reviewCount || 0
        ),
      },
    });
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = (item: any) => {
    if (
      typeof item.stock === "number" &&
      item.stock <= 0
    ) {
      Alert.alert(
        "Out of Stock",
        "This product is currently unavailable."
      );

      return;
    }

    addToCart({
      productId: item.productId,
      name: item.name,
      brand: item.brand || "",
      price: Number(item.price || 0),
      image: item.image || "",
      emoji: item.emoji || "📦",
      category: item.category || "",
    });

    Alert.alert(
      "Added to Cart",
      `${item.name} has been added to your cart.`,
      [
        {
          text: "Continue",
          style: "cancel",
        },
        {
          text: "View Cart",
          onPress: () =>
            router.push("/cart"),
        },
      ]
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!isLoaded) {
    return (
      <View style={styles.loadingPage}>
        <Text style={styles.loadingHeart}>
          ❤️
        </Text>

        <Text style={styles.loadingText}>
          Loading favorites...
        </Text>
      </View>
    );
  }

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
          <View>
            <Text style={styles.smallTitle}>
              MOM SHOPPING
            </Text>

            <Text style={styles.title}>
              My Favorites ❤️
            </Text>

            <Text style={styles.subtitle}>
              Your saved products in one place.
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {favorites.length}
            </Text>
          </View>
        </View>

        {/* EMPTY FAVORITES */}

        {favorites.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>
              🤍
            </Text>

            <Text style={styles.emptyTitle}>
              No Favorites Yet
            </Text>

            <Text style={styles.emptyText}>
              Tap the heart icon on any product
              to save it to your favorites.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push("/")
              }
            >
              <Text
                style={styles.shopButtonText}
              >
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.products}>
            {favorites.map((item) => {
              const validImage =
                typeof item.image ===
                  "string" &&
                item.image
                  .trim()
                  .startsWith("http");

              const hasOldPrice =
                Number(item.oldPrice || 0) >
                Number(item.price || 0);

              const discount =
                hasOldPrice &&
                Number(item.oldPrice) > 0
                  ? Math.round(
                      ((Number(
                        item.oldPrice
                      ) -
                        Number(
                          item.price
                        )) /
                        Number(
                          item.oldPrice
                        )) *
                        100
                    )
                  : 0;

              return (
                <View
                  style={styles.productCard}
                  key={item.productId}
                >
                  {/* FAVORITE BUTTON */}

                  <TouchableOpacity
                    style={
                      styles.favoriteButton
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      removeFavorite(
                        item.productId
                      )
                    }
                  >
                    <Text
                      style={
                        styles.favoriteIcon
                      }
                    >
                      ❤️
                    </Text>
                  </TouchableOpacity>

                  {/* DISCOUNT */}

                  {discount > 0 && (
                    <View
                      style={
                        styles.discountBadge
                      }
                    >
                      <Text
                        style={
                          styles.discountText
                        }
                      >
                        -{discount}%
                      </Text>
                    </View>
                  )}

                  {/* IMAGE */}

                  <TouchableOpacity
                    style={styles.imageBox}
                    activeOpacity={0.9}
                    onPress={() =>
                      openProductDetails(
                        item
                      )
                    }
                  >
                    {validImage ? (
                      <Image
                        source={{
                          uri: item.image,
                        }}
                        style={
                          styles.productImage
                        }
                        resizeMode="contain"
                      />
                    ) : (
                      <Text
                        style={
                          styles.productEmoji
                        }
                      >
                        {item.emoji ||
                          "📦"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* BRAND */}

                  {!!item.brand && (
                    <Text
                      style={styles.brand}
                      numberOfLines={1}
                    >
                      {item.brand}
                    </Text>
                  )}

                  {/* NAME */}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      openProductDetails(
                        item
                      )
                    }
                  >
                    <Text
                      style={
                        styles.productName
                      }
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>

                  {/* RATING */}

                  <View
                    style={styles.ratingRow}
                  >
                    <Text
                      style={
                        styles.ratingText
                      }
                    >
                      ⭐{" "}
                      {Number(
                        item.rating || 0
                      ).toFixed(1)}
                    </Text>

                    {!!item.reviewCount && (
                      <Text
                        style={
                          styles.reviewText
                        }
                      >
                        (
                        {item.reviewCount})
                      </Text>
                    )}
                  </View>

                  {/* PRICE */}

                  <View
                    style={styles.priceRow}
                  >
                    <Text
                      style={styles.price}
                    >
                      ৳{item.price}
                    </Text>

                    {hasOldPrice && (
                      <Text
                        style={
                          styles.oldPrice
                        }
                      >
                        ৳{item.oldPrice}
                      </Text>
                    )}
                  </View>

                  {/* STOCK */}

                  <Text
                    style={[
                      styles.stockText,

                      Number(
                        item.stock || 0
                      ) <= 0 &&
                        styles.outOfStockText,
                    ]}
                  >
                    {Number(
                      item.stock || 0
                    ) > 0
                      ? `In Stock: ${item.stock}`
                      : "Out of Stock"}
                  </Text>

                  {/* ADD TO CART */}

                  <TouchableOpacity
                    style={[
                      styles.addButton,

                      Number(
                        item.stock || 0
                      ) <= 0 &&
                        styles.disabledButton,
                    ]}
                    activeOpacity={0.85}
                    disabled={
                      Number(
                        item.stock || 0
                      ) <= 0
                    }
                    onPress={() =>
                      handleAddToCart(item)
                    }
                  >
                    <Text
                      style={
                        styles.addButtonText
                      }
                    >
                      {Number(
                        item.stock || 0
                      ) > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </Text>
                  </TouchableOpacity>

                  {/* REMOVE */}

                  <TouchableOpacity
                    style={
                      styles.removeButton
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      removeFavorite(
                        item.productId
                      )
                    }
                  >
                    <Text
                      style={
                        styles.removeButtonText
                      }
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  loadingPage: {
    flex: 1,
    backgroundColor: "#FFF8F5",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingHeart: {
    fontSize: 45,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#777777",
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

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    elevation: 2,
  },

  smallTitle: {
    color: "#FF4F72",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#282828",
  },

  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 6,
  },

  countBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF0F4",
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#FF4F72",
    fontSize: 17,
    fontWeight: "900",
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
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 21,
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
    paddingVertical: 12,
    paddingHorizontal: 26,
    marginTop: 20,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  products: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  productCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    position: "relative",

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  favoriteIcon: {
    fontSize: 19,
  },

  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: "#FF6548",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  imageBox: {
    height: 130,
    borderRadius: 16,
    backgroundColor: "#FFF8F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },

  productImage: {
    width: "90%",
    height: "90%",
  },

  productEmoji: {
    fontSize: 50,
  },

  brand: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FF4F72",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  productName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#282828",
    minHeight: 38,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  ratingText: {
    fontSize: 12,
    color: "#444444",
    fontWeight: "800",
  },

  reviewText: {
    fontSize: 11,
    color: "#999999",
    marginLeft: 4,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  price: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FF6548",
  },

  oldPrice: {
    fontSize: 12,
    color: "#AAAAAA",
    textDecorationLine: "line-through",
    marginLeft: 7,
  },

  stockText: {
    color: "#3C8D5A",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },

  outOfStockText: {
    color: "#D94A4A",
  },

  addButton: {
    backgroundColor: "#FF4F72",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },

  disabledButton: {
    backgroundColor: "#D7D7D7",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  removeButton: {
    borderWidth: 1,
    borderColor: "#FFD1DA",
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: 8,
  },

  removeButtonText: {
    color: "#FF4F72",
    fontSize: 12,
    fontWeight: "900",
  },
});
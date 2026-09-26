import BottomNav from "@/components/BottomNav";
import { API_URL } from "@/config/api";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoriteContext";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// TYPES
// ==========================================

type HealthCategory =
  | "All"
  | "Medicine"
  | "First Aid"
  | "Devices"
  | "Hygiene"
  | "Vitamins"
  | "Other";

type PriceFilter =
  | "All Prices"
  | "Under ৳200"
  | "৳200–৳500"
  | "Above ৳500";

type SortOption =
  | "Default"
  | "Low → High"
  | "High → Low";

type Product = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  category?: string;
  subcategory?: string;
  image?: string;
  emoji?: string;
  description?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  isActive?: boolean;
};

// ==========================================
// FILTER OPTIONS
// ==========================================

const categories: HealthCategory[] = [
  "All",
  "Medicine",
  "First Aid",
  "Devices",
  "Hygiene",
  "Vitamins",
  "Other",
];

const priceFilters: PriceFilter[] = [
  "All Prices",
  "Under ৳200",
  "৳200–৳500",
  "Above ৳500",
];

const sortOptions: SortOption[] = [
  "Default",
  "Low → High",
  "High → Low",
];

// ==========================================
// SCREEN
// ==========================================

export default function HealthScreen() {
  const { addToCart } = useCart();

  const {
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<HealthCategory>("All");

  const [selectedPrice, setSelectedPrice] =
    useState<PriceFilter>("All Prices");

  const [selectedSort, setSelectedSort] =
    useState<SortOption>("Default");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH HEALTH PRODUCTS
  // ==========================================

  const fetchProducts = useCallback(async () => {
    try {
      setError("");

      console.log("Fetching health products...");
      console.log("API URL:", API_URL);

      const response = await fetch(
        `${API_URL}/api/products?category=health`
      );

      const text = await response.text();

      console.log("Health status:", response.status);
      console.log("Health response:", text);

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned invalid data.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not load health products."
        );
      }

      let list: Product[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.products)) {
        list = data.products;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      }

      const healthProducts = list.filter((product) => {
        const category = String(product.category || "")
          .trim()
          .toLowerCase();

        const active =
          product.isActive === undefined
            ? true
            : product.isActive;

        return category === "health" && active;
      });

      healthProducts.forEach((product) => {
        console.log(
          "HEALTH PRODUCT:",
          product.name,
          "IMAGE:",
          product.image
        );
      });

      setProducts(healthProducts);
    } catch (err: any) {
      console.log("Health fetch error:", err);

      setError(
        err?.message || "Could not connect to server."
      );

      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // ==========================================
  // FILTER + SORT
  // ==========================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((product) => {
        const subcategory = String(product.subcategory || "")
          .trim()
          .toLowerCase();

        return (
          subcategory === selectedCategory.toLowerCase()
        );
      });
    }

    if (selectedPrice === "Under ৳200") {
      result = result.filter(
        (product) => Number(product.price) < 200
      );
    }

    if (selectedPrice === "৳200–৳500") {
      result = result.filter(
        (product) =>
          Number(product.price) >= 200 &&
          Number(product.price) <= 500
      );
    }

    if (selectedPrice === "Above ৳500") {
      result = result.filter(
        (product) => Number(product.price) > 500
      );
    }

    if (selectedSort === "Low → High") {
      result.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    }

    if (selectedSort === "High → Low") {
      result.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedPrice,
    selectedSort,
  ]);

  // ==========================================
  // DISCOUNT
  // ==========================================

  const getDiscount = (
    price: number,
    oldPrice?: number
  ) => {
    const current = Number(price || 0);
    const old = Number(oldPrice || 0);

    if (old <= current || old <= 0) {
      return 0;
    }

    return Math.round(
      ((old - current) / old) * 100
    );
  };

  // ==========================================
  // DETAILS
  // ==========================================

  const openProductDetails = (product: Product) => {
    console.log("Opening health:", product.name);
    console.log("Sending image:", product.image);

    router.push({
      pathname: "/product-details",

      params: {
        id: product._id || "",
        name: product.name || "Product",
        brand: product.brand || "",
        price: String(product.price ?? 0),
        oldPrice: String(product.oldPrice ?? 0),
        category: product.category || "health",
        subcategory: product.subcategory || "",
        image: product.image || "",
        emoji: product.emoji || "",
        description: product.description || "",
        stock: String(product.stock ?? 0),
        rating: String(product.rating ?? 0),
        reviewCount: String(product.reviewCount ?? 0),
      },
    });
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = (product: Product) => {
    const stock = Number(product.stock ?? 0);

    if (stock <= 0) {
      Alert.alert(
        "Out of Stock",
        `${product.name} is currently unavailable.`
      );

      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: Number(product.price),
      emoji: product.emoji || "💊",
      image: product.image || "",
      brand: product.brand || "",
    });

    Alert.alert(
      "Added to Cart 🛒",
      `${product.name} added successfully.`
    );
  };

  // ==========================================
  // FAVORITE
  // ==========================================

  const handleFavorite = (product: Product) => {
    toggleFavorite({
      name: product.name,
      price: Number(product.price),
      emoji: product.emoji || "💊",
      category: "health",
    });
  };

  // ==========================================
  // FILTER COMPONENT
  // ==========================================

  const FilterSection = ({
    title,
    items,
    selected,
    onSelect,
  }: {
    title: string;
    items: string[];
    selected: string;
    onSelect: (value: string) => void;
  }) => {
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>
          {title}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {items.map((item) => {
            const active = selected === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
                onPress={() => onSelect(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.headerEmoji}>
            💊
          </Text>

          <Text style={styles.title}>
            Health
          </Text>

          <Text style={styles.subtitle}>
            Health and wellness essentials for your family.
          </Text>
        </View>

        {/* CATEGORY FILTER */}

        <FilterSection
          title="Categories"
          items={categories}
          selected={selectedCategory}
          onSelect={(value) =>
            setSelectedCategory(
              value as HealthCategory
            )
          }
        />

        {/* PRICE FILTER */}

        <FilterSection
          title="Price"
          items={priceFilters}
          selected={selectedPrice}
          onSelect={(value) =>
            setSelectedPrice(
              value as PriceFilter
            )
          }
        />

        {/* SORT */}

        <FilterSection
          title="Sort By"
          items={sortOptions}
          selected={selectedSort}
          onSelect={(value) =>
            setSelectedSort(
              value as SortOption
            )
          }
        />

        {/* PRODUCT HEADER */}

        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>
            Products
          </Text>

          <Text style={styles.productCount}>
            {filteredProducts.length} products
          </Text>
        </View>

        {/* LOADING */}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color="#3F8CFF"
            />

            <Text style={styles.loadingText}>
              Loading health products...
            </Text>
          </View>
        ) : error ? (
          /* ERROR */

          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>
              ⚠️
            </Text>

            <Text style={styles.emptyTitle}>
              Connection Error
            </Text>

            <Text style={styles.emptyText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                fetchProducts();
              }}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredProducts.length === 0 ? (
          /* EMPTY */

          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>
              💊
            </Text>

            <Text style={styles.emptyTitle}>
              No products found
            </Text>

            <Text style={styles.emptyText}>
              No health products match this filter.
            </Text>
          </View>
        ) : (
          /* PRODUCTS */

          filteredProducts.map((product) => {
            const price = Number(product.price || 0);

            const oldPrice = Number(
              product.oldPrice || 0
            );

            const stock = Number(
              product.stock ?? 0
            );

            const rating = Number(
              product.rating || 0
            );

            const reviews = Number(
              product.reviewCount || 0
            );

            const discount = getDiscount(
              price,
              oldPrice
            );

            const favorite = isFavorite(
              product.name
            );

            const validImage =
              typeof product.image === "string" &&
              product.image
                .trim()
                .startsWith("http");

            return (
              <View
                key={product._id}
                style={styles.productCard}
              >
                {/* CLICKABLE PRODUCT */}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    openProductDetails(product)
                  }
                >
                  {/* IMAGE */}

                  <View style={styles.imageBox}>
                    {validImage ? (
                      <Image
                        source={{
                          uri: product.image,
                        }}
                        style={styles.productImage}
                        resizeMode="contain"
                        onLoad={() =>
                          console.log(
                            "HEALTH IMAGE LOADED ✅",
                            product.image
                          )
                        }
                        onError={(event) =>
                          console.log(
                            "HEALTH IMAGE ERROR ❌",
                            product.name,
                            event.nativeEvent.error
                          )
                        }
                      />
                    ) : (
                      <Text
                        style={styles.productEmoji}
                      >
                        {product.emoji || "💊"}
                      </Text>
                    )}

                    {/* DISCOUNT */}

                    {discount > 0 && (
                      <View
                        style={styles.discountBadge}
                      >
                        <Text
                          style={styles.discountText}
                        >
                          -{discount}%
                        </Text>
                      </View>
                    )}

                    {/* FAVORITE */}

                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() =>
                        handleFavorite(product)
                      }
                    >
                      <Text
                        style={styles.favoriteText}
                      >
                        {favorite ? "❤️" : "🤍"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* PRODUCT INFO */}

                  <View style={styles.productInfo}>
                    {!!product.brand && (
                      <Text style={styles.brand}>
                        {product.brand}
                      </Text>
                    )}

                    <Text style={styles.productName}>
                      {product.name}
                    </Text>

                    {!!product.subcategory && (
                      <Text
                        style={styles.subcategory}
                      >
                        {product.subcategory}
                      </Text>
                    )}

                    {/* RATING */}

                    {rating > 0 && (
                      <Text style={styles.rating}>
                        ⭐ {rating}
                        {reviews > 0 &&
                          ` (${reviews} reviews)`}
                      </Text>
                    )}

                    {/* PRICE */}

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>
                        ৳{price}
                      </Text>

                      {oldPrice > price && (
                        <Text
                          style={styles.oldPrice}
                        >
                          ৳{oldPrice}
                        </Text>
                      )}
                    </View>

                    {/* STOCK */}

                    <Text
                      style={[
                        styles.stock,
                        stock <= 0 &&
                          styles.outOfStock,
                      ]}
                    >
                      {stock > 0
                        ? `${stock} in stock`
                        : "Out of stock"}
                    </Text>

                    {!!product.description && (
                      <Text
                        style={styles.description}
                        numberOfLines={2}
                      >
                        {product.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* ACTIONS */}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() =>
                      openProductDetails(product)
                    }
                  >
                    <Text
                      style={
                        styles.detailsButtonText
                      }
                    >
                      View Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={stock <= 0}
                    style={[
                      styles.cartButton,
                      stock <= 0 &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      handleAddToCart(product)
                    }
                  >
                    <Text
                      style={styles.cartButtonText}
                    >
                      {stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 110 }} />
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
    backgroundColor: "#F7FAFF",
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  header: {
    marginBottom: 24,
  },

  headerEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#222222",
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    marginTop: 5,
    lineHeight: 21,
  },

  filterSection: {
    marginBottom: 18,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 10,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8F8",
    marginRight: 9,
  },

  filterChipActive: {
    backgroundColor: "#3F8CFF",
    borderColor: "#3F8CFF",
  },

  filterChipText: {
    color: "#555555",
    fontWeight: "600",
    fontSize: 13,
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222222",
  },

  productCount: {
    fontSize: 13,
    color: "#888888",
  },

  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    color: "#777777",
  },

  emptyBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 20,
    marginTop: 10,
  },

  emptyEmoji: {
    fontSize: 45,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: "800",
    color: "#333333",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: "#777777",
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#3F8CFF",
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 14,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E4ECF7",

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  imageBox: {
    width: "100%",
    height: 220,
    backgroundColor: "#F2F7FF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  productImage: {
    width: "90%",
    height: "90%",
  },

  productEmoji: {
    fontSize: 80,
  },

  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#3F8CFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  discountText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  favoriteButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteText: {
    fontSize: 21,
  },

  productInfo: {
    padding: 17,
  },

  brand: {
    fontSize: 12,
    color: "#3F8CFF",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  productName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222222",
  },

  subcategory: {
    fontSize: 13,
    color: "#888888",
    marginTop: 3,
  },

  rating: {
    marginTop: 9,
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  price: {
    fontSize: 21,
    fontWeight: "800",
    color: "#3F8CFF",
  },

  oldPrice: {
    fontSize: 14,
    color: "#999999",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },

  stock: {
    marginTop: 7,
    color: "#2E9B57",
    fontSize: 13,
    fontWeight: "600",
  },

  outOfStock: {
    color: "#E53935",
  },

  description: {
    marginTop: 9,
    color: "#777777",
    fontSize: 13,
    lineHeight: 19,
  },

  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },

  detailsButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#3F8CFF",
    justifyContent: "center",
    alignItems: "center",
  },

  detailsButtonText: {
    color: "#3F8CFF",
    fontWeight: "700",
  },

  cartButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#3F8CFF",
    justifyContent: "center",
    alignItems: "center",
  },

  cartButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.45,
  },
});
import { API_URL } from "@/config/api";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function FashionScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // FETCH FASHION PRODUCTS
  // ================================

  const fetchProducts = useCallback(async () => {
    try {
      setError("");

      console.log("Fetching fashion products...");
      console.log("API URL:", API_URL);

      const response = await fetch(
        `${API_URL}/api/products?category=fashion`
      );

      const text = await response.text();

      console.log("Fashion status:", response.status);
      console.log("Fashion response:", text);

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned invalid data.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not load fashion products."
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

      const fashionProducts = list.filter((product) => {
        const category = String(product.category || "")
          .trim()
          .toLowerCase();

        const active =
          product.isActive === undefined
            ? true
            : product.isActive;

        return category === "fashion" && active;
      });

      fashionProducts.forEach((product) => {
        console.log(
          "FASHION PRODUCT:",
          product.name,
          "IMAGE:",
          product.image
        );
      });

      setProducts(fashionProducts);
      setFilteredProducts(fashionProducts);
    } catch (err: any) {
      console.log("Fashion fetch error:", err);

      setError(
        err?.message || "Could not connect to server."
      );

      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ================================
  // SEARCH
  // ================================

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const brand = String(product.brand || "").toLowerCase();
      const subcategory = String(
        product.subcategory || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        brand.includes(query) ||
        subcategory.includes(query)
      );
    });

    setFilteredProducts(filtered);
  }, [search, products]);

  // ================================
  // REFRESH
  // ================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // ================================
  // OPEN PRODUCT DETAILS
  // ================================

  const openProductDetails = (product: Product) => {
    console.log("Opening:", product.name);
    console.log("Sending image:", product.image);

    router.push({
      pathname: "/product-details",

      params: {
        id: product._id || "",

        name: product.name || "Product",

        brand: product.brand || "",

        price: String(product.price ?? 0),

        oldPrice: String(product.oldPrice ?? 0),

        category: product.category || "fashion",

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

  // ================================
  // DISCOUNT
  // ================================

  const getDiscount = (
    price: number,
    oldPrice?: number
  ) => {
    const current = Number(price || 0);
    const old = Number(oldPrice || 0);

    if (old <= current || old <= 0) {
      return 0;
    }

    return Math.round(((old - current) / old) * 100);
  };

  // ================================
  // PRODUCT CARD
  // ================================

  const renderProduct = ({
    item,
  }: {
    item: Product;
  }) => {
    const price = Number(item.price || 0);
    const oldPrice = Number(item.oldPrice || 0);
    const stock = Number(item.stock || 0);

    const discount = getDiscount(price, oldPrice);

    const validImage =
      typeof item.image === "string" &&
      item.image.trim().startsWith("http");

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => openProductDetails(item)}
      >
        {/* IMAGE */}

        <View style={styles.imageBox}>
          {validImage ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.emoji}>
              {item.emoji || "👗"}
            </Text>
          )}

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {discount}% OFF
              </Text>
            </View>
          )}

          {item.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>
                Featured
              </Text>
            </View>
          )}
        </View>

        {/* INFO */}

        <View style={styles.info}>
          <Text style={styles.category}>
            {item.subcategory || "Fashion"}
          </Text>

          <Text
            style={styles.name}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          {!!item.brand && (
            <Text
              style={styles.brand}
              numberOfLines={1}
            >
              {item.brand}
            </Text>
          )}

          {/* RATING */}

          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>

            <Text style={styles.rating}>
              {Number(item.rating || 0).toFixed(1)}
            </Text>

            <Text style={styles.reviews}>
              {" (" + String(item.reviewCount || 0) + ")"}
            </Text>
          </View>

          {/* PRICE */}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {"৳ " + price}
            </Text>

            {oldPrice > price && (
              <Text style={styles.oldPrice}>
                {"৳ " + oldPrice}
              </Text>
            )}
          </View>

          {/* STOCK */}

          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                stock <= 0 && styles.outDot,
              ]}
            />

            <Text
              style={[
                styles.stock,
                stock <= 0 && styles.outText,
              ]}
            >
              {stock <= 0
                ? "Out of Stock"
                : stock + " available"}
            </Text>
          </View>

          <View style={styles.detailsButton}>
            <Text style={styles.detailsText}>
              View Details
            </Text>

            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#FF4F72"
          />

          <Text style={styles.loadingText}>
            Loading fashion products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ================================
  // SCREEN
  // ================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Fashion</Text>

          <Text style={styles.subtitle}>
            Style, fashion & everyday essentials
          </Text>
        </View>
      </View>

      {/* SEARCH */}

      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search fashion products..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
            >
              <Text style={styles.clear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ERROR */}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>

          <Text style={styles.errorTitle}>
            Could not load products
          </Text>

          <Text style={styles.errorText}>
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
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) =>
            item._id
              ? String(item._id)
              : String(index)
          }
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#FF4F72"]}
              tintColor="#FF4F72"
            />
          }
          ListHeaderComponent={
            <Text style={styles.count}>
              {filteredProducts.length +
                (filteredProducts.length === 1
                  ? " product"
                  : " products")}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>
                👗
              </Text>

              <Text style={styles.emptyTitle}>
                No fashion products found
              </Text>

              <Text style={styles.emptyText}>
                Add products from your Admin page.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    paddingVertical: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF0F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  back: {
    fontSize: 32,
    color: "#FF4F72",
    lineHeight: 34,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#222",
  },

  subtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  searchArea: {
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    paddingBottom: 16,
  },

  searchBox: {
    height: 52,
    borderRadius: 17,
    backgroundColor: "#F7F7F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#222",
  },

  clear: {
    color: "#999",
    padding: 5,
  },

  list: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 50,
  },

  columns: {
    justifyContent: "space-between",
  },

  count: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777",
    marginBottom: 12,
  },

  card: {
    width: "48.5%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },

  imageBox: {
    height: 170,
    backgroundColor: "#FFF1EC",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  emoji: {
    fontSize: 65,
  },

  discountBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    backgroundColor: "#FF4F72",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  discountText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  },

  featuredBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  featuredText: {
    color: "#FF4F72",
    fontSize: 8,
    fontWeight: "900",
  },

  info: {
    padding: 13,
  },

  category: {
    color: "#FF4F72",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  name: {
    color: "#222",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    marginTop: 5,
    minHeight: 42,
  },

  brand: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  star: {
    color: "#FFB000",
    fontSize: 14,
    marginRight: 4,
  },

  rating: {
    fontSize: 11,
    fontWeight: "900",
    color: "#333",
  },

  reviews: {
    fontSize: 10,
    color: "#999",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  price: {
    color: "#FF4F45",
    fontSize: 18,
    fontWeight: "900",
  },

  oldPrice: {
    color: "#AAA",
    fontSize: 11,
    textDecorationLine: "line-through",
    marginLeft: 7,
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#28A745",
    marginRight: 5,
  },

  outDot: {
    backgroundColor: "#DC3545",
  },

  stock: {
    color: "#28A745",
    fontSize: 10,
    fontWeight: "700",
  },

  outText: {
    color: "#DC3545",
  },

  detailsButton: {
    height: 36,
    backgroundColor: "#FFF0F3",
    borderRadius: 11,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsText: {
    color: "#FF4F72",
    fontSize: 11,
    fontWeight: "900",
  },

  arrow: {
    color: "#FF4F72",
    fontSize: 19,
    marginLeft: 5,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
  },

  errorBox: {
    margin: 20,
    padding: 22,
    backgroundColor: "#FFF",
    borderRadius: 18,
    alignItems: "center",
  },

  errorIcon: {
    fontSize: 35,
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#333",
    marginTop: 8,
  },

  errorText: {
    color: "#888",
    textAlign: "center",
    marginTop: 7,
  },

  retryButton: {
    backgroundColor: "#FF4F72",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 15,
  },

  retryText: {
    color: "#FFF",
    fontWeight: "900",
  },

  empty: {
    alignItems: "center",
    paddingTop: 70,
  },

  emptyEmoji: {
    fontSize: 55,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#333",
    marginTop: 12,
  },

  emptyText: {
    color: "#888",
    marginTop: 6,
  },
});
import BottomNav from "@/components/BottomNav";
import { router } from "expo-router";
import { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const products = [
  {
    name: "Premium Rice",
    price: 80,
    emoji: "🍚",
    category: "Grocery",
    description: "Premium quality rice for your everyday meals.",
  },
  {
    name: "Fresh Milk",
    price: 100,
    emoji: "🥛",
    category: "Grocery",
    description: "Fresh and nutritious milk for your everyday needs.",
  },
  {
    name: "Farm Eggs",
    price: 150,
    emoji: "🥚",
    category: "Grocery",
    description: "Fresh farm eggs packed with nutrition for your family.",
  },
  {
    name: "Fresh Apples",
    price: 220,
    emoji: "🍎",
    category: "Grocery",
    description: "Fresh, juicy and delicious apples for a healthy snack.",
  },
  {
    name: "Potatoes",
    price: 60,
    emoji: "🥔",
    category: "Grocery",
    description: "Fresh potatoes perfect for everyday home cooking.",
  },
  {
    name: "Fresh Bread",
    price: 70,
    emoji: "🍞",
    category: "Grocery",
    description: "Soft and fresh bread perfect for breakfast and snacks.",
  },

  {
    name: "Gentle Cleanser",
    price: 450,
    emoji: "🫧",
    category: "Skincare",
    description:
      "A gentle cleanser designed to remove dirt and impurities while keeping your skin fresh and comfortable.",
  },
  {
    name: "Sunscreen SPF 50",
    price: 650,
    emoji: "☀️",
    category: "Skincare",
    description:
      "SPF 50 sunscreen that helps protect your skin from harmful sun exposure during everyday activities.",
  },
  {
    name: "Vitamin C Serum",
    price: 850,
    emoji: "💧",
    category: "Skincare",
    description:
      "A lightweight Vitamin C serum for a brighter and refreshed-looking skincare routine.",
  },
  {
    name: "Moisturizer",
    price: 550,
    emoji: "🧴",
    category: "Skincare",
    description:
      "A daily moisturizer that helps keep your skin feeling soft, smooth and hydrated.",
  },
  {
    name: "Face Wash",
    price: 350,
    emoji: "🧼",
    category: "Skincare",
    description:
      "A refreshing face wash for cleansing your skin as part of your daily skincare routine.",
  },
  {
    name: "Lip Balm",
    price: 220,
    emoji: "💄",
    category: "Skincare",
    description:
      "A convenient lip balm designed to help keep your lips feeling soft and moisturized.",
  },

  {
    name: "Paracetamol",
    price: 25,
    emoji: "💊",
    category: "Health",
    description:
      "Paracetamol tablets for common pain and fever relief. Follow the product label and medical guidance when using medicines.",
  },
  {
    name: "First Aid Kit",
    price: 450,
    emoji: "🩹",
    category: "Health",
    description:
      "A useful first aid kit containing basic essentials for minor everyday injuries.",
  },
  {
    name: "Thermometer",
    price: 350,
    emoji: "🌡️",
    category: "Health",
    description:
      "A convenient digital thermometer for measuring body temperature at home.",
  },
  {
    name: "Hand Sanitizer",
    price: 120,
    emoji: "🧴",
    category: "Health",
    description:
      "Portable hand sanitizer for convenient hand hygiene when soap and water are not available.",
  },
  {
    name: "Face Mask",
    price: 150,
    emoji: "😷",
    category: "Health",
    description:
      "A pack of convenient face masks for everyday personal protection and hygiene.",
  },
  {
    name: "Vitamin C",
    price: 300,
    emoji: "🍊",
    category: "Health",
    description:
      "Vitamin C tablets intended as a dietary supplement. Follow the product directions for use.",
  },
];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");

  const filteredProducts = products.filter((product) => {
    const search = searchText.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );
  });

  const openProductDetails = (
    name: string,
    price: number,
    emoji: string,
    category: string,
    description: string
  ) => {
    router.push({
      pathname: "/product-details",
      params: {
        name,
        price: String(price),
        emoji,
        category,
        description,
      },
    });
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Search</Text>

          <Text style={styles.subtitle}>
            Find grocery, skincare and health products.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.input}
            placeholder="Search products..."
            placeholderTextColor="#999999"
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              activeOpacity={0.8}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.resultText}>
          {searchText.length === 0
            ? "All Products"
            : `${filteredProducts.length} product${
                filteredProducts.length === 1 ? "" : "s"
              } found`}
        </Text>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔎</Text>

            <Text style={styles.emptyTitle}>
              No Product Found
            </Text>

            <Text style={styles.emptyText}>
              Try searching with another product name or category.
            </Text>
          </View>
        ) : (
          <View style={styles.products}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={`${product.category}-${product.name}`}
                style={styles.productCard}
                activeOpacity={0.8}
                onPress={() =>
                  openProductDetails(
                    product.name,
                    product.price,
                    product.emoji,
                    product.category,
                    product.description
                  )
                }
              >
                <View style={styles.imageBox}>
                  <Text style={styles.productEmoji}>
                    {product.emoji}
                  </Text>
                </View>

                <View style={styles.productContent}>
                  <Text style={styles.category}>
                    {product.category}
                  </Text>

                  <Text style={styles.productName}>
                    {product.name}
                  </Text>

                  <Text style={styles.price}>
                    ৳ {product.price}
                  </Text>

                  <Text style={styles.viewText}>
                    View Details ›
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 110,
  },

  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF4F72",
  },

  subtitle: {
    fontSize: 15,
    color: "#666666",
    marginTop: 7,
    lineHeight: 22,
  },

  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 15,
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    marginBottom: 22,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#222222",
  },

  clearIcon: {
    fontSize: 18,
    color: "#888888",
    fontWeight: "800",
    padding: 5,
  },

  resultText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#282828",
    marginBottom: 15,
  },

  products: {
    gap: 14,
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: "#FFF1EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  productEmoji: {
    fontSize: 46,
  },

  productContent: {
    flex: 1,
  },

  category: {
    fontSize: 12,
    color: "#FF4F72",
    fontWeight: "800",
    marginBottom: 3,
  },

  productName: {
    fontSize: 17,
    color: "#282828",
    fontWeight: "900",
  },

  price: {
    fontSize: 17,
    color: "#FF6548",
    fontWeight: "900",
    marginTop: 6,
  },

  viewText: {
    fontSize: 13,
    color: "#FF4F72",
    fontWeight: "800",
    marginTop: 7,
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
    fontSize: 50,
    marginBottom: 14,
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
});
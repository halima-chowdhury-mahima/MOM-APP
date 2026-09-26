import BottomNav from "@/components/BottomNav";
import { API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoriteContext";

import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// ======================================================
// TYPES
// ======================================================

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

// ======================================================
// CATEGORIES
// ======================================================

const categories = [
  {
    name: "Grocery",
    subtitle: "Daily needs",
    emoji: "🛒",
    route: "/grocery",
    background: "#ECF8EF",
  },
  {
    name: "Skincare",
    subtitle: "Beauty care",
    emoji: "🧴",
    route: "/skincare",
    background: "#FFF0F5",
  },
  {
    name: "Health",
    subtitle: "Stay well",
    emoji: "💊",
    route: "/health",
    background: "#EEF5FF",
  },
  {
    name: "Fashion",
    subtitle: "New styles",
    emoji: "👗",
    route: "/fashion",
    background: "#FFF2F6",
  },
];

// ======================================================
// HOME
// ======================================================
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BANNER_MARGIN = 18;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_MARGIN * 2;

const banners = [
  {
    id: "grocery",
    image: require("../../assets/images/mom-home-banner.png"),
    route: "/grocery",
    buttonText: "Shop Now",
  },
  {
    id: "skincare",
    image: require("../../assets/images/skincare-banner.png"),
    route: "/skincare",
    buttonText: "Shop Skincare",
  },
  {
    id: "health",
    image: require("../../assets/images/health-banner.png"),
    route: "/health",
    buttonText: "Shop Health",
  },
  {
    id: "fashion",
    image: require("../../assets/images/fashion-banner.png"),
    route: "/fashion",
    buttonText: "Shop Fashion",
  },
];




export default function HomeScreen() {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn, isLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");

  const [productLoading, setProductLoading] =
    useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");



  const bannerRef = useRef<ScrollView>(null);

const [activeBanner, setActiveBanner] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setActiveBanner((current) => {
      const next = (current + 1) % banners.length;

      bannerRef.current?.scrollTo({
        x: next * BANNER_WIDTH,
        animated: true,
      });

      return next;
    });
  }, 4000);

  return () => clearInterval(interval);
}, []);

const handleBannerScrollEnd = (
  event: NativeSyntheticEvent<NativeScrollEvent>
) => {
  const offsetX = event.nativeEvent.contentOffset.x;

  const index = Math.round(
    offsetX / BANNER_WIDTH
  );

  setActiveBanner(index);
};

  // ====================================================
  // AUTH
  // ====================================================

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn]);

  // ====================================================
  // FETCH PRODUCTS
  // ====================================================

  const fetchProducts = useCallback(async () => {
    try {
      setError("");

      console.log("HOME: Fetching products...");
      console.log("API URL:", API_URL);

      const response = await fetch(
        `${API_URL}/api/products`
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned invalid product data."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not load products."
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

      const activeProducts = list.filter(
        (product) =>
          product.isActive === undefined ||
          product.isActive === true
      );

      setProducts(activeProducts);
    } catch (err: any) {
      console.log("HOME FETCH ERROR:", err);

      setError(
        err?.message ||
          "Could not connect to server."
      );

      setProducts([]);
    } finally {
      setProductLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // ====================================================
  // DISCOUNT
  // ====================================================

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

  // ====================================================
  // SPECIAL OFFERS
  // ====================================================

  const specialOffers = useMemo(() => {
    return products
      .filter((product) => {
        const price = Number(product.price || 0);
        const oldPrice = Number(
          product.oldPrice || 0
        );

        return price > 0 && oldPrice > price;
      })
      .slice(0, 10);
  }, [products]);

  // ====================================================
  // FEATURED
  // ====================================================

  const featuredProducts = useMemo(() => {
    return products
      .filter(
        (product) => product.featured === true
      )
      .slice(0, 10);
  }, [products]);

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredProducts = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    if (!query) {
      return [];
    }

    return products.filter((product) => {
      const name = String(
        product.name || ""
      ).toLowerCase();

      const brand = String(
        product.brand || ""
      ).toLowerCase();

      const category = String(
        product.category || ""
      ).toLowerCase();

      const subcategory = String(
        product.subcategory || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        brand.includes(query) ||
        category.includes(query) ||
        subcategory.includes(query)
      );
    });
  }, [products, searchText]);

  // ====================================================
  // OPEN PRODUCT
  // ====================================================

  const openProductDetails = (
    product: Product
  ) => {
    router.push({
      pathname: "/product-details",

      params: {
        id: product._id || "",
        name: product.name || "Product",
        brand: product.brand || "",
        price: String(product.price ?? 0),
        oldPrice: String(
          product.oldPrice ?? 0
        ),
        category: product.category || "",
        subcategory:
          product.subcategory || "",
        image: product.image || "",
        emoji: product.emoji || "",
        description:
          product.description || "",
        stock: String(product.stock ?? 0),
        rating: String(
          product.rating ?? 0
        ),
        reviewCount: String(
          product.reviewCount ?? 0
        ),
      },
    });
  };

  // ====================================================
  // PRODUCT IMAGE
  // ====================================================

  const ProductImage = ({
    product,
    style,
  }: {
    product: Product;
    style: any;
  }) => {
    const validImage =
      typeof product.image === "string" &&
      product.image
        .trim()
        .startsWith("http");

    if (validImage) {
      return (
        <Image
          source={{
            uri: product.image,
          }}
          style={style}
          resizeMode="contain"
        />
      );
    }

    return (
      <View
        style={[
          style,
          styles.imageFallback,
        ]}
      >
        <Text style={styles.fallbackEmoji}>
          {product.emoji || "🛍️"}
        </Text>
      </View>
    );
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogoCircle}>
          <Text style={styles.loadingLogo}>
            M
          </Text>
        </View>

        <Text style={styles.loadingBrand}>
          MOM
        </Text>

        <ActivityIndicator
          size="large"
          color="#FF4F72"
          style={{ marginTop: 18 }}
        />
      </View>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      style={styles.page}
      edges={["top"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF4F72"]}
            tintColor="#FF4F72"
          />
        }
      >
        {/* =========================================
            PREMIUM HEADER
        ========================================= */}

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>
                M
              </Text>
            </View>

            <View>
              <Text style={styles.logo}>
                MOM
              </Text>

              <Text style={styles.logoSubtitle}>
                Made with care
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() =>
                router.push("/favorites")
              }
            >
              <Text
                style={styles.headerHeart}
              >
                ♡
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() =>
                router.push("/profile")
              }
            >
              <Text
                style={styles.headerProfile}
              >
                👤
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================
            DELIVERY
        ========================================= */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.deliveryRow}
          onPress={() =>
            router.push(
              "/delivery-address"
            )
          }
        >
          <View
            style={styles.locationIconBox}
          >
            <Text
              style={styles.locationEmoji}
            >
              📍
            </Text>
          </View>

          <View
            style={styles.deliveryContent}
          >
            <Text
              style={styles.deliveryLabel}
            >
              DELIVERY LOCATION
            </Text>

            <Text
              style={styles.deliveryAddress}
              numberOfLines={1}
            >
              Select your delivery address
            </Text>
          </View>

          <Text
            style={styles.deliveryArrow}
          >
            ›
          </Text>
        </TouchableOpacity>

        {/* =========================================
            SEARCH
        ========================================= */}

        <View style={styles.searchOuter}>
          <View style={styles.searchBox}>
            <Text
              style={styles.searchIcon}
            >
              ⌕
            </Text>

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search your daily essentials..."
              placeholderTextColor="#9B9B9B"
              style={styles.searchInput}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() =>
                  setSearchText("")
                }
              >
                <Text
                  style={styles.clearText}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* =========================================
            SEARCH RESULTS
        ========================================= */}

        {searchText.trim() !== "" && (
          <View
            style={
              styles.searchResultsBox
            }
          >
            <View
              style={styles.sectionHeader}
            >
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Search Results
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  {filteredProducts.length}{" "}
                  products found
                </Text>
              </View>
            </View>

            {filteredProducts.length >
            0 ? (
              filteredProducts
                .slice(0, 8)
                .map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    style={
                      styles.searchProduct
                    }
                    activeOpacity={0.85}
                    onPress={() =>
                      openProductDetails(
                        product
                      )
                    }
                  >
                    <ProductImage
                      product={product}
                      style={
                        styles.searchProductImage
                      }
                    />

                    <View
                      style={
                        styles.searchProductInfo
                      }
                    >
                      <Text
                        style={
                          styles.searchProductBrand
                        }
                      >
                        {product.brand ||
                          product.category ||
                          "MOM"}
                      </Text>

                      <Text
                        style={
                          styles.searchProductName
                        }
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>

                      <Text
                        style={
                          styles.searchProductPrice
                        }
                      >
                        ৳{" "}
                        {Number(
                          product.price || 0
                        )}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.searchArrow
                      }
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                ))
            ) : (
              <View
                style={styles.emptySearch}
              >
                <Text
                  style={
                    styles.emptySearchEmoji
                  }
                >
                  🔎
                </Text>

                <Text
                  style={
                    styles.emptySearchTitle
                  }
                >
                  No products found
                </Text>

                <Text
                  style={
                    styles.emptySearchText
                  }
                >
                  Try another product name
                  or category.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* =========================================
            PREMIUM IMAGE BANNER
        ========================================= */}

        {/* =========================================
    PREMIUM BANNER CAROUSEL
========================================= */}

<View style={styles.bannerSection}>
  <ScrollView
    ref={bannerRef}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    decelerationRate="fast"
    snapToInterval={BANNER_WIDTH}
    onMomentumScrollEnd={handleBannerScrollEnd}
  >
    {banners.map((banner) => (
  <TouchableOpacity
    key={banner.id}
    activeOpacity={0.92}
    style={styles.bannerSlide}
    onPress={() => router.push(banner.route as any)}
  >
    <Image
      source={banner.image}
      style={styles.bannerImage}
      resizeMode="cover"
    />
  </TouchableOpacity>
))}
  </ScrollView>

  <View style={styles.bannerDots}>
    {banners.map((banner, index) => (
      <TouchableOpacity
        key={banner.id}
        activeOpacity={0.8}
        onPress={() => {
          bannerRef.current?.scrollTo({
            x: index * BANNER_WIDTH,
            animated: true,
          });

          setActiveBanner(index);
        }}
        style={[
          styles.bannerDot,
          activeBanner === index &&
            styles.bannerDotActive,
        ]}
      />
    ))}
  </View>
</View>

        {/* =========================================
            CATEGORIES
        ========================================= */}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Shop by Category
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Everything your family needs
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryScroll
          }
        >
          {categories.map(
            (category) => (
              <TouchableOpacity
                key={category.name}
                activeOpacity={0.8}
                style={styles.categoryCard}
                onPress={() =>
                  router.push(
                    category.route as any
                  )
                }
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        category.background,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.categoryEmoji
                    }
                  >
                    {category.emoji}
                  </Text>
                </View>

                <Text
                  style={
                    styles.categoryName
                  }
                >
                  {category.name}
                </Text>

                <Text
                  style={
                    styles.categorySubtitle
                  }
                >
                  {category.subtitle}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* =========================================
            ERROR
        ========================================= */}

        {error ? (
          <View style={styles.errorBox}>
            <Text
              style={styles.errorEmoji}
            >
              🛍️
            </Text>

            <Text
              style={styles.errorTitle}
            >
              Products couldn't load
            </Text>

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setProductLoading(true);
                fetchProducts();
              }}
            >
              <Text
                style={styles.retryText}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =========================================
            SPECIAL OFFERS
        ========================================= */}

        {!error && (
          <>
            <View
              style={styles.sectionHeader}
            >
              <View>
                <View
                  style={
                    styles.titleWithBadge
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Special Offers
                  </Text>

                  <View
                    style={
                      styles.hotBadge
                    }
                  >
                    <Text
                      style={
                        styles.hotBadgeText
                      }
                    >
                      HOT
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Save more on your favorites
                </Text>
              </View>
            </View>

            {productLoading ? (
              <View
                style={
                  styles.productLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color="#FF4F72"
                />
              </View>
            ) : specialOffers.length >
              0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.productScroll
                }
              >
                {specialOffers.map(
                  (product) => {
                    const price = Number(
                      product.price || 0
                    );

                    const oldPrice =
                      Number(
                        product.oldPrice ||
                          0
                      );

                    const discount =
                      getDiscount(
                        price,
                        oldPrice
                      );

                    return (
                      <TouchableOpacity
                        key={`offer-${product._id}`}
                        activeOpacity={0.9}
                        style={
                          styles.productCard
                        }
                        onPress={() =>
                          openProductDetails(
                            product
                          )
                        }
                      >
                        <View
                          style={
                            styles.productImageContainer
                          }
                        >
                          <ProductImage
                            product={
                              product
                            }
                            style={
                              styles.productImage
                            }
                          />

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
                              {discount}%
                              OFF
                            </Text>
                          </View>

                          <TouchableOpacity
  style={styles.favoriteButton}
  activeOpacity={0.8}
  onPress={(event) => {
    event.stopPropagation();

    toggleFavorite({
      productId: product._id,
      name: product.name,
      brand: product.brand || "",
      price: Number(product.price || 0),
      oldPrice: Number(product.oldPrice || 0),
      image: product.image || "",
      emoji: product.emoji || "📦",
      category: product.category || "",
      subcategory: product.subcategory || "",
      description: product.description || "",
      stock: Number(product.stock || 0),
      rating: Number(product.rating || 0),
      reviewCount: Number(product.reviewCount || 0),
    });
  }}
>
  <Text style={styles.favoriteIcon}>
    {isFavorite(product._id) ? "❤️" : "♡"}
  </Text>
</TouchableOpacity>
                        </View>

                        <View
                          style={
                            styles.productDetails
                          }
                        >
                          <Text
                            style={
                              styles.productBrand
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {product.brand ||
                              product.subcategory ||
                              product.category ||
                              "MOM"}
                          </Text>

                          <Text
                            style={
                              styles.productName
                            }
                            numberOfLines={
                              2
                            }
                          >
                            {product.name}
                          </Text>

                          <View
                            style={
                              styles.ratingRow
                            }
                          >
                            <Text
                              style={
                                styles.star
                              }
                            >
                              ★
                            </Text>

                            <Text
                              style={
                                styles.rating
                              }
                            >
                              {Number(
                                product.rating ||
                                  0
                              ).toFixed(
                                1
                              )}
                            </Text>

                            <Text
                              style={
                                styles.review
                              }
                            >
                              (
                              {Number(
                                product.reviewCount ||
                                  0
                              )}
                              )
                            </Text>
                          </View>

                          <View
                            style={
                              styles.priceRow
                            }
                          >
                            <Text
                              style={
                                styles.price
                              }
                            >
                              ৳ {price}
                            </Text>

                            <Text
                              style={
                                styles.oldPrice
                              }
                            >
                              ৳{" "}
                              {oldPrice}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.productBottom
                            }
                          >
                            <Text
                              style={[
                                styles.stock,
                                Number(
                                  product.stock ||
                                    0
                                ) <= 0 &&
                                  styles.outOfStock,
                              ]}
                            >
                              {Number(
                                product.stock ||
                                  0
                              ) > 0
                                ? "● In stock"
                                : "Out of stock"}
                            </Text>

                            <View
                              style={
                                styles.openButton
                              }
                            >
                              <Text
                                style={
                                  styles.openButtonText
                                }
                              >
                                ›
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )}
              </ScrollView>
            ) : (
              <View
                style={
                  styles.emptySection
                }
              >
                <Text
                  style={
                    styles.emptySectionEmoji
                  }
                >
                  🏷️
                </Text>

                <Text
                  style={
                    styles.emptySectionTitle
                  }
                >
                  Offers coming soon
                </Text>

                <Text
                  style={
                    styles.emptySectionText
                  }
                >
                  Add an Old Price higher
                  than Price from Admin to
                  show an offer here.
                </Text>
              </View>
            )}

            {/* =====================================
                FEATURED PRODUCTS
            ===================================== */}

            <View
              style={styles.sectionHeader}
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Featured Products
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Carefully selected for you
                </Text>
              </View>

              <View
                style={
                  styles.featuredBadge
                }
              >
                <Text
                  style={
                    styles.featuredBadgeText
                  }
                >
                  MOM PICKS
                </Text>
              </View>
            </View>

            {productLoading ? (
              <View
                style={
                  styles.productLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color="#FF4F72"
                />
              </View>
            ) : featuredProducts.length >
              0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.productScroll
                }
              >
                {featuredProducts.map(
                  (product) => {
                    const price = Number(
                      product.price || 0
                    );

                    const oldPrice =
                      Number(
                        product.oldPrice ||
                          0
                      );

                    const discount =
                      getDiscount(
                        price,
                        oldPrice
                      );

                    return (
                      <TouchableOpacity
                        key={`featured-${product._id}`}
                        activeOpacity={0.9}
                        style={
                          styles.productCard
                        }
                        onPress={() =>
                          openProductDetails(
                            product
                          )
                        }
                      >
                        <View
                          style={
                            styles.productImageContainer
                          }
                        >
                          <ProductImage
                            product={
                              product
                            }
                            style={
                              styles.productImage
                            }
                          />

                          {discount >
                            0 && (
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
                                -
                                {
                                  discount
                                }
                                %
                              </Text>
                            </View>
                          )}

                          <TouchableOpacity
                            style={
                              styles.favoriteButton
                            }
                            onPress={() =>
                              router.push(
                                "/favorites"
                              )
                            }
                          >
                            <Text
                              style={
                                styles.favoriteIcon
                              }
                            >
                              ♡
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View
                          style={
                            styles.productDetails
                          }
                        >
                          <Text
                            style={
                              styles.productBrand
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {product.brand ||
                              product.subcategory ||
                              product.category ||
                              "MOM"}
                          </Text>

                          <Text
                            style={
                              styles.productName
                            }
                            numberOfLines={
                              2
                            }
                          >
                            {product.name}
                          </Text>

                          <View
                            style={
                              styles.ratingRow
                            }
                          >
                            <Text
                              style={
                                styles.star
                              }
                            >
                              ★
                            </Text>

                            <Text
                              style={
                                styles.rating
                              }
                            >
                              {Number(
                                product.rating ||
                                  0
                              ).toFixed(
                                1
                              )}
                            </Text>

                            <Text
                              style={
                                styles.review
                              }
                            >
                              (
                              {Number(
                                product.reviewCount ||
                                  0
                              )}
                              )
                            </Text>
                          </View>

                          <View
                            style={
                              styles.priceRow
                            }
                          >
                            <Text
                              style={
                                styles.price
                              }
                            >
                              ৳ {price}
                            </Text>

                            {oldPrice >
                              price && (
                              <Text
                                style={
                                  styles.oldPrice
                                }
                              >
                                ৳{" "}
                                {
                                  oldPrice
                                }
                              </Text>
                            )}
                          </View>

                          <View
                            style={
                              styles.productBottom
                            }
                          >
                            <Text
                              style={[
                                styles.stock,
                                Number(
                                  product.stock ||
                                    0
                                ) <= 0 &&
                                  styles.outOfStock,
                              ]}
                            >
                              {Number(
                                product.stock ||
                                  0
                              ) > 0
                                ? "● In stock"
                                : "Out of stock"}
                            </Text>

                            <View
                              style={
                                styles.openButton
                              }
                            >
                              <Text
                                style={
                                  styles.openButtonText
                                }
                              >
                                ›
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )}
              </ScrollView>
            ) : (
              <View
                style={
                  styles.emptySection
                }
              >
                <Text
                  style={
                    styles.emptySectionEmoji
                  }
                >
                  ⭐
                </Text>

                <Text
                  style={
                    styles.emptySectionTitle
                  }
                >
                  Featured products coming
                  soon
                </Text>

                <Text
                  style={
                    styles.emptySectionText
                  }
                >
                  Turn Featured ON from
                  Admin to show products
                  here.
                </Text>
              </View>
            )}
          </>
        )}

        {/* =========================================
            PREMIUM TRUST CARD
        ========================================= */}

        <View style={styles.trustCard}>
          <View style={styles.trustItem}>
            <View
              style={styles.trustIcon}
            >
              <Text>🚚</Text>
            </View>

            <Text
              style={styles.trustTitle}
            >
              Fast Delivery
            </Text>

            <Text
              style={styles.trustText}
            >
              At your door
            </Text>
          </View>

          <View
            style={styles.trustDivider}
          />

          <View style={styles.trustItem}>
            <View
              style={styles.trustIcon}
            >
              <Text>✓</Text>
            </View>

            <Text
              style={styles.trustTitle}
            >
              Quality
            </Text>

            <Text
              style={styles.trustText}
            >
              Trusted items
            </Text>
          </View>

          <View
            style={styles.trustDivider}
          />

          <View style={styles.trustItem}>
            <View
              style={styles.trustIcon}
            >
              <Text>♡</Text>
            </View>

            <Text
              style={styles.trustTitle}
            >
              With Care
            </Text>

            <Text
              style={styles.trustText}
            >
              From MOM
            </Text>
          </View>
        </View>

        <View style={{ height: 25 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

// ======================================================
// PREMIUM STYLES
// ======================================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },

  content: {
    paddingBottom: 110,
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF7F9",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogoCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#FF4F72",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "900",
  },

  loadingBrand: {
    marginTop: 12,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#202124",
  },

  // HEADER

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FF4F72",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  brandIconText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  logo: {
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "900",
    color: "#202124",
    letterSpacing: 1,
  },

  logoSubtitle: {
    color: "#A0A0A5",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },

  headerActions: {
    flexDirection: "row",
    gap: 9,
  },

  headerButton: {
    width: 41,
    height: 41,
    borderRadius: 14,
    backgroundColor: "#FFF4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  headerHeart: {
    color: "#FF4F72",
    fontSize: 24,
  },

  headerProfile: {
    fontSize: 18,
  },

  // DELIVERY

  deliveryRow: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    padding: 11,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F2",
  },

  locationIconBox: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#FFF1F4",
    alignItems: "center",
    justifyContent: "center",
  },

  locationEmoji: {
    fontSize: 17,
  },

  deliveryContent: {
    flex: 1,
    marginLeft: 10,
  },

  deliveryLabel: {
    color: "#A0A0A5",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  deliveryAddress: {
    marginTop: 2,
    color: "#33343A",
    fontSize: 12,
    fontWeight: "800",
  },

  deliveryArrow: {
    color: "#A7A7AD",
    fontSize: 25,
  },

  // SEARCH

  searchOuter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
  },

  searchBox: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EBEBEF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  searchIcon: {
    fontSize: 24,
    color: "#55565C",
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    color: "#222329",
    fontSize: 13,
  },

  clearButton: {
    padding: 7,
  },

  clearText: {
    color: "#999AA0",
    fontSize: 13,
  },

  // BANNER

  // ======================================================
// BANNER CAROUSEL
// ======================================================

bannerSection: {
  marginHorizontal: 18,
  marginTop: 2,
  marginBottom: 5,
  overflow: "hidden",
},

bannerSlide: {
  width: BANNER_WIDTH,
  aspectRatio: 2048 / 768,
  borderRadius: 24,
  overflow: "hidden",
  backgroundColor: "#FFF0F4",
  position: "relative",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 6,
  },

  
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 6,
},

bannerImage: {
  width: "100%",
  height: "100%",
},

bannerShopButton: {
  position: "absolute",
  left: 20,
  bottom: 18,

  minWidth: 110,
  height: 42,
  paddingHorizontal: 17,

  backgroundColor: "#FF4F72",
  borderRadius: 14,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.16,
  shadowRadius: 5,
  elevation: 5,
},

bannerShopText: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "900",
},

bannerShopArrow: {
  marginLeft: 7,
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "900",
},

bannerDots: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 11,
  height: 10,
},

bannerDot: {
  width: 7,
  height: 7,
  borderRadius: 10,
  backgroundColor: "#D7D7DB",
  marginHorizontal: 3,
},

bannerDotActive: {
  width: 22,
  backgroundColor: "#FF4F72",
},

  // SECTION

  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 27,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#202126",
    fontSize: 19,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#96969D",
    fontSize: 10,
    marginTop: 3,
  },

  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  hotBadge: {
    backgroundColor: "#FFF0F3",
    marginLeft: 8,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  hotBadgeText: {
    color: "#FF4F72",
    fontSize: 8,
    fontWeight: "900",
  },

  featuredBadge: {
    backgroundColor: "#FFF0F3",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  featuredBadgeText: {
    color: "#FF4F72",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // CATEGORY

  categoryScroll: {
    paddingHorizontal: 18,
    paddingRight: 6,
  },

  categoryCard: {
    width: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 10,
    marginRight: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFF2",
  },

  categoryIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryEmoji: {
    fontSize: 30,
  },

  categoryName: {
    marginTop: 9,
    color: "#292A30",
    fontSize: 11,
    fontWeight: "900",
  },

  categorySubtitle: {
    marginTop: 2,
    color: "#A1A1A7",
    fontSize: 8,
  },

  // PRODUCT

  productScroll: {
    paddingHorizontal: 18,
    paddingRight: 6,
  },

  productLoading: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },

  productCard: {
    width: 174,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEF1",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  productImageContainer: {
    height: 158,
    position: "relative",
    backgroundColor: "#F7F7F9",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2F5",
  },

  fallbackEmoji: {
    fontSize: 50,
  },

  discountBadge: {
    position: "absolute",
    left: 9,
    top: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#FF4F72",
    borderRadius: 8,
  },

  discountText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  favoriteButton: {
    position: "absolute",
    right: 9,
    top: 9,
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteIcon: {
    color: "#FF4F72",
    fontSize: 20,
  },

  productDetails: {
    padding: 12,
  },

  productBrand: {
    color: "#FF4F72",
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  productName: {
    marginTop: 5,
    minHeight: 38,
    color: "#25262B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  star: {
    color: "#FFB000",
    fontSize: 12,
  },

  rating: {
    color: "#4B4C51",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 3,
  },

  review: {
    color: "#AAAAAF",
    fontSize: 8,
    marginLeft: 2,
  },

  priceRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  price: {
    color: "#FF4F72",
    fontSize: 16,
    fontWeight: "900",
  },

  oldPrice: {
    marginLeft: 7,
    color: "#AAAAAF",
    fontSize: 9,
    textDecorationLine: "line-through",
  },

  productBottom: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stock: {
    color: "#2A9B57",
    fontSize: 8,
    fontWeight: "800",
  },

  outOfStock: {
    color: "#D94A4A",
  },

  openButton: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "#FF4F72",
    alignItems: "center",
    justifyContent: "center",
  },

  openButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 21,
  },

  // SEARCH RESULT

  searchResultsBox: {
    marginHorizontal: 18,
    marginBottom: 10,
  },

  searchProduct: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 9,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFF2",
  },

  searchProductImage: {
    width: 66,
    height: 66,
    borderRadius: 13,
  },

  searchProductInfo: {
    flex: 1,
    marginLeft: 11,
  },

  searchProductBrand: {
    color: "#FF4F72",
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  searchProductName: {
    marginTop: 3,
    color: "#292A30",
    fontSize: 13,
    fontWeight: "800",
  },

  searchProductPrice: {
    marginTop: 5,
    color: "#FF4F72",
    fontSize: 14,
    fontWeight: "900",
  },

  searchArrow: {
    paddingHorizontal: 8,
    color: "#AAAAB0",
    fontSize: 24,
  },

  // EMPTY

  emptySearch: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  emptySearchEmoji: {
    fontSize: 30,
  },

  emptySearchTitle: {
    marginTop: 8,
    color: "#292A30",
    fontSize: 14,
    fontWeight: "900",
  },

  emptySearchText: {
    marginTop: 4,
    color: "#96969D",
    fontSize: 10,
  },

  emptySection: {
    marginHorizontal: 18,
    padding: 23,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEF1",
  },

  emptySectionEmoji: {
    fontSize: 30,
  },

  emptySectionTitle: {
    marginTop: 7,
    color: "#292A30",
    fontSize: 14,
    fontWeight: "900",
  },

  emptySectionText: {
    marginTop: 5,
    color: "#96969D",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
  },

  // ERROR

  errorBox: {
    marginHorizontal: 18,
    marginTop: 25,
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEF1",
  },

  errorEmoji: {
    fontSize: 30,
  },

  errorTitle: {
    marginTop: 8,
    color: "#292A30",
    fontSize: 14,
    fontWeight: "900",
  },

  errorText: {
    marginTop: 5,
    color: "#96969D",
    fontSize: 10,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 12,
    backgroundColor: "#FF4F72",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  // TRUST

  trustCard: {
    marginHorizontal: 18,
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEF1",
  },

  trustItem: {
    flex: 1,
    alignItems: "center",
  },

  trustIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFF1F4",
    alignItems: "center",
    justifyContent: "center",
  },

  trustTitle: {
    marginTop: 6,
    color: "#33343A",
    fontSize: 9,
    fontWeight: "900",
  },

  trustText: {
    marginTop: 2,
    color: "#A0A0A5",
    fontSize: 7,
  },

  trustDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#EEEEF1",
  },
});
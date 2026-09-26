import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Switch,
} from "react-native";

import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { API_URL } from "../config/api";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config/cloudinary";

import { useAuth } from "../context/AuthContext";

// ======================================================
// TYPES
// ======================================================

type Category =
  | "grocery"
  | "skincare"
  | "health"
  | "fashion";

type Product = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  category: Category;
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

type ProductForm = {
  name: string;
  brand: string;
  price: string;
  oldPrice: string;
  category: Category;
  subcategory: string;

  // Image preview URI / existing Cloudinary URL
  image: string;

  // New selected image data
  imageBase64: string;
  imageMimeType: string;

  emoji: string;
  description: string;
  stock: string;
  rating: string;
  reviewCount: string;
  featured: boolean;
  isActive: boolean;
};

// ======================================================
// EMPTY FORM
// ======================================================

const createEmptyForm = (): ProductForm => ({
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  category: "grocery",
  subcategory: "",

  image: "",
  imageBase64: "",
  imageMimeType: "image/jpeg",

  emoji: "",
  description: "",
  stock: "",
  rating: "",
  reviewCount: "",
  featured: false,
  isActive: true,
});

// ======================================================
// ADMIN SCREEN
// ======================================================

export default function AdminScreen() {
  const { user, token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<ProductForm>(createEmptyForm());

  // ====================================================
  // ADMIN CHECK
  // ====================================================

  useEffect(() => {
    if (user && user.role !== "admin") {
      Alert.alert(
        "Access Denied",
        "Admin access required."
      );

      router.replace("/");
    }
  }, [user]);

  // ====================================================
  // LOAD PRODUCTS
  // ====================================================

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      console.log(
        "Loading products from:",
        `${API_URL}/api/products`
      );

      const response = await fetch(
        `${API_URL}/api/products`
      );

      const responseText = await response.text();

      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not load products."
        );
      }

      setProducts(data.products || []);
    } catch (error: any) {
      console.log(
        "LOAD PRODUCTS ERROR =",
        error
      );

      Alert.alert(
        "Connection Error",
        error?.message ||
          "Could not connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ====================================================
  // UPDATE FORM
  // ====================================================

  const updateForm = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  // ====================================================
  // CHOOSE IMAGE
  // ====================================================

  const chooseImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo access to choose a product image."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,

          // IMPORTANT:
          // ImagePicker directly gives us Base64.
          // No file:// -> Blob conversion.
          base64: true,
        });

      if (result.canceled) {
        return;
      }

      if (
        !result.assets ||
        result.assets.length === 0
      ) {
        Alert.alert(
          "Image Error",
          "No image was selected."
        );

        return;
      }

      const selectedImage = result.assets[0];

      console.log("IMAGE SELECTED ✅");

      console.log(
        "Image URI =",
        selectedImage.uri
      );

      console.log(
        "MIME TYPE =",
        selectedImage.mimeType || "image/jpeg"
      );

      console.log(
        "BASE64 AVAILABLE =",
        Boolean(selectedImage.base64)
      );

      console.log(
        "BASE64 LENGTH =",
        selectedImage.base64?.length || 0
      );

      if (!selectedImage.base64) {
        Alert.alert(
          "Image Error",
          "Could not read the selected image. Please choose another image."
        );

        return;
      }

      setForm((previous) => ({
        ...previous,

        image: selectedImage.uri,

        imageBase64:
          selectedImage.base64 || "",

        imageMimeType:
          selectedImage.mimeType ||
          "image/jpeg",
      }));
    } catch (error: any) {
      console.log(
        "IMAGE PICKER ERROR =",
        error
      );

      Alert.alert(
        "Image Error",
        error?.message ||
          "Could not select image."
      );
    }
  };

  // ====================================================
  // REMOVE IMAGE
  // ====================================================

  const removeImage = () => {
    setForm((previous) => ({
      ...previous,
      image: "",
      imageBase64: "",
      imageMimeType: "image/jpeg",
    }));
  };

  // ====================================================
  // CLOUDINARY UPLOAD
  // ====================================================

  const uploadToCloudinary = async (
    base64: string,
    mimeType: string
  ): Promise<string | null> => {
    try {
      setUploadingImage(true);

      console.log(
        "================================"
      );

      console.log(
        "CLOUDINARY UPLOAD START"
      );

      console.log(
        "CLOUD NAME =",
        CLOUDINARY_CLOUD_NAME
      );

      console.log(
        "UPLOAD PRESET =",
        CLOUDINARY_UPLOAD_PRESET
      );

      console.log(
        "BASE64 LENGTH =",
        base64?.length || 0
      );

      console.log(
        "================================"
      );

      // ----------------------------
      // CONFIG CHECK
      // ----------------------------

      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error(
          "Cloudinary cloud name is missing."
        );
      }

      if (!CLOUDINARY_UPLOAD_PRESET) {
        throw new Error(
          "Cloudinary upload preset is missing."
        );
      }

      if (!base64) {
        throw new Error(
          "Selected image data is missing."
        );
      }

      // ----------------------------
      // CREATE DATA URI
      // ----------------------------

      const finalMimeType =
        mimeType || "image/jpeg";

      const dataUri =
        `data:${finalMimeType};base64,${base64}`;

      // ----------------------------
      // CREATE FORMDATA
      // ----------------------------

      const formData = new FormData();

      formData.append(
        "file",
        dataUri
      );

      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );

      // ----------------------------
      // CLOUDINARY URL
      // ----------------------------

      const uploadUrl =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      console.log(
        "UPLOAD URL =",
        uploadUrl
      );

      console.log(
        "Sending image to Cloudinary..."
      );

      // ----------------------------
      // SEND IMAGE
      // ----------------------------

      const response = await fetch(
        uploadUrl,
        {
          method: "POST",

          // Do not manually add Content-Type.
          // React Native FormData handles it.
          body: formData,
        }
      );

      const responseText =
        await response.text();

      console.log(
        "CLOUDINARY STATUS =",
        response.status
      );

      console.log(
        "CLOUDINARY RESPONSE =",
        responseText
      );

      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Cloudinary returned an invalid response."
        );
      }

      // ----------------------------
      // CLOUDINARY ERROR
      // ----------------------------

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            `Cloudinary upload failed. Status: ${response.status}`
        );
      }

      // ----------------------------
      // URL CHECK
      // ----------------------------

      if (!data.secure_url) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      console.log(
        "IMAGE UPLOAD SUCCESS ✅"
      );

      console.log(
        "IMAGE URL =",
        data.secure_url
      );

      return data.secure_url;
    } catch (error: any) {
      console.log(
        "CLOUDINARY UPLOAD ERROR =",
        error
      );

      Alert.alert(
        "Image Upload Failed",
        error?.message ||
          "Could not upload image."
      );

      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // ====================================================
  // VALIDATE FORM
  // ====================================================

  const validateForm = () => {
    if (!form.image) {
      Alert.alert(
        "Image Required",
        "Please choose a product image."
      );

      return false;
    }

    if (!form.name.trim()) {
      Alert.alert(
        "Product Name Required",
        "Please enter product name."
      );

      return false;
    }

    if (!form.price.trim()) {
      Alert.alert(
        "Price Required",
        "Please enter product price."
      );

      return false;
    }

    const price = Number(form.price);

    if (
      Number.isNaN(price) ||
      price <= 0
    ) {
      Alert.alert(
        "Invalid Price",
        "Price must be greater than 0."
      );

      return false;
    }

    if (form.oldPrice) {
      const oldPrice =
        Number(form.oldPrice);

      if (
        Number.isNaN(oldPrice) ||
        oldPrice < 0
      ) {
        Alert.alert(
          "Invalid Old Price",
          "Old price cannot be negative."
        );

        return false;
      }
    }

    if (form.stock) {
      const stock =
        Number(form.stock);

      if (
        Number.isNaN(stock) ||
        stock < 0
      ) {
        Alert.alert(
          "Invalid Stock",
          "Stock cannot be negative."
        );

        return false;
      }
    }

    if (form.rating) {
      const rating =
        Number(form.rating);

      if (
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 5
      ) {
        Alert.alert(
          "Invalid Rating",
          "Rating must be between 0 and 5."
        );

        return false;
      }
    }

    return true;
  };

  // ====================================================
  // SAVE / UPDATE PRODUCT
  // ====================================================

  const saveProduct = async () => {
    if (!validateForm()) {
      return;
    }

    if (!token) {
      Alert.alert(
        "Login Error",
        "Admin token not found. Please login again."
      );

      return;
    }

    try {
      setSaving(true);

      let finalImageUrl =
        form.image;

      // ==================================================
      // NEW LOCAL IMAGE
      // ==================================================

      const isLocalImage =
        !form.image.startsWith("http://") &&
        !form.image.startsWith("https://");

      if (isLocalImage) {
        console.log(
          "NEW LOCAL IMAGE DETECTED"
        );

        if (!form.imageBase64) {
          Alert.alert(
            "Image Error",
            "Image data is missing. Please choose the product image again."
          );

          return;
        }

        const uploadedUrl =
          await uploadToCloudinary(
            form.imageBase64,
            form.imageMimeType
          );

        if (!uploadedUrl) {
          console.log(
            "Image upload stopped product save."
          );

          return;
        }

        finalImageUrl =
          uploadedUrl;
      } else {
        console.log(
          "Existing online image detected."
        );
      }

      console.log(
        "FINAL PRODUCT IMAGE URL =",
        finalImageUrl
      );

      // ==================================================
      // PRODUCT PAYLOAD
      // ==================================================

      const payload = {
        name:
          form.name.trim(),

        brand:
          form.brand.trim(),

        price:
          Number(form.price),

        oldPrice:
          form.oldPrice
            ? Number(form.oldPrice)
            : 0,

        category:
          form.category,

        subcategory:
          form.subcategory.trim(),

        image:
          finalImageUrl,

        emoji:
          form.emoji.trim(),

        description:
          form.description.trim(),

        stock:
          form.stock
            ? Number(form.stock)
            : 0,

        rating:
          form.rating
            ? Number(form.rating)
            : 0,

        reviewCount:
          form.reviewCount
            ? Number(form.reviewCount)
            : 0,

        featured:
          form.featured,

        isActive:
          form.isActive,
      };

      console.log(
        "PRODUCT PAYLOAD =",
        payload
      );

      // ==================================================
      // CREATE / UPDATE
      // ==================================================

      const isEditing =
        Boolean(editingId);

      const url =
        isEditing
          ? `${API_URL}/api/products/${editingId}`
          : `${API_URL}/api/products`;

      const method =
        isEditing
          ? "PUT"
          : "POST";

      console.log(
        "PRODUCT API URL =",
        url
      );

      console.log(
        "PRODUCT METHOD =",
        method
      );

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify(payload),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "PRODUCT API STATUS =",
        response.status
      );

      console.log(
        "PRODUCT API RESPONSE =",
        responseText
      );

      let data: any = {};

      try {
        data =
          JSON.parse(responseText);
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Product request failed. Status: ${response.status}`
        );
      }

      Alert.alert(
        "Success ✅",
        isEditing
          ? "Product updated successfully."
          : "Product added successfully."
      );

      resetForm();

      await loadProducts();
    } catch (error: any) {
      console.log(
        "SAVE PRODUCT ERROR =",
        error
      );

      Alert.alert(
        "Product Save Error",
        error?.message ||
          "Could not save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // EDIT PRODUCT
  // ====================================================

  const editProduct = (
    product: Product
  ) => {
    setEditingId(product._id);

    setForm({
      name:
        product.name || "",

      brand:
        product.brand || "",

      price:
        String(product.price ?? ""),

      oldPrice:
        product.oldPrice
          ? String(product.oldPrice)
          : "",

      category:
        product.category ||
        "grocery",

      subcategory:
        product.subcategory || "",

      // Existing Cloudinary URL
      image:
        product.image || "",

      // Empty because user has not selected
      // a new image yet.
      imageBase64: "",

      imageMimeType:
        "image/jpeg",

      emoji:
        product.emoji || "",

      description:
        product.description || "",

      stock:
        String(product.stock ?? ""),

      rating:
        String(product.rating ?? ""),

      reviewCount:
        String(
          product.reviewCount ?? ""
        ),

      featured:
        product.featured || false,

      isActive:
        product.isActive !== false,
    });

    Alert.alert(
      "Edit Product",
      "Product information loaded into the form."
    );
  };

  // ====================================================
  // DELETE PRODUCT
  // ====================================================

  const deleteProduct = (
    product: Product
  ) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            if (!token) {
              Alert.alert(
                "Error",
                "Admin token not found."
              );

              return;
            }

            try {
              const response =
                await fetch(
                  `${API_URL}/api/products/${product._id}`,
                  {
                    method: "DELETE",

                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );

              const responseText =
                await response.text();

              let data: any = {};

              try {
                data =
                  JSON.parse(
                    responseText
                  );
              } catch {
                throw new Error(
                  "Backend returned an invalid response."
                );
              }

              if (!response.ok) {
                throw new Error(
                  data?.message ||
                    "Could not delete product."
                );
              }

              Alert.alert(
                "Success ✅",
                "Product deleted successfully."
              );

              if (
                editingId ===
                product._id
              ) {
                resetForm();
              }

              await loadProducts();
            } catch (error: any) {
              console.log(
                "DELETE ERROR =",
                error
              );

              Alert.alert(
                "Delete Error",
                error?.message ||
                  "Could not delete product."
              );
            }
          },
        },
      ]
    );
  };

  // ====================================================
  // ADMIN ACCESS
  // ====================================================

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text
          style={{
            marginTop: 10,
          }}
        >
          Checking admin access...
        </Text>
      </View>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        MOM Admin
      </Text>

      <Text style={styles.subtitle}>
        Product Management
      </Text>

      {/* MANAGE ORDERS */}

      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() =>
          router.push(
            "/admin-orders" as any
          )
        }
      >
        <Text
          style={
            styles.ordersButtonText
          }
        >
          📦 Manage Orders
        </Text>
      </TouchableOpacity>

      {/* FORM */}

      <View style={styles.formCard}>
        <Text
          style={styles.sectionTitle}
        >
          {editingId
            ? "Edit Product"
            : "Add New Product"}
        </Text>

        {/* IMAGE */}

        <Text style={styles.label}>
          Product Image *
        </Text>

        <TouchableOpacity
          style={
            styles.imagePickerButton
          }
          onPress={chooseImage}
          disabled={
            saving ||
            uploadingImage
          }
        >
          <Text
            style={
              styles.imagePickerText
            }
          >
            📷 Choose Product Image
          </Text>
        </TouchableOpacity>

        {form.image ? (
          <View
            style={
              styles.imagePreviewContainer
            }
          >
            <Image
              source={{
                uri: form.image,
              }}
              style={
                styles.imagePreview
              }
              resizeMode="contain"
            />

            <Text
              style={
                styles.imageSelected
              }
            >
              ✓ Image selected
            </Text>

            <TouchableOpacity
              onPress={removeImage}
            >
              <Text
                style={
                  styles.removeImage
                }
              >
                Remove Image
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* PRODUCT NAME */}

        <Text style={styles.label}>
          Product Name *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Dove Beauty Cream Bar"
          value={form.name}
          onChangeText={(text) =>
            updateForm(
              "name",
              text
            )
          }
        />

        {/* BRAND */}

        <Text style={styles.label}>
          Brand
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Dove"
          value={form.brand}
          onChangeText={(text) =>
            updateForm(
              "brand",
              text
            )
          }
        />

        {/* PRICE */}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>
              Price *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="180"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(text) =>
                updateForm(
                  "price",
                  text
                )
              }
            />
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>
              Old Price
            </Text>

            <TextInput
              style={styles.input}
              placeholder="200"
              keyboardType="numeric"
              value={form.oldPrice}
              onChangeText={(text) =>
                updateForm(
                  "oldPrice",
                  text
                )
              }
            />
          </View>
        </View>

        {/* CATEGORY */}

        <Text style={styles.label}>
          Category *
        </Text>

        <View
          style={styles.categoryRow}
        >
          {(
            [
              "grocery",
              "skincare",
              "health",
              "fashion",
            ] as Category[]
          ).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,

                form.category ===
                  category &&
                  styles.categoryButtonActive,
              ]}
              onPress={() =>
                updateForm(
                  "category",
                  category
                )
              }
            >
              <Text
                style={[
                  styles.categoryText,

                  form.category ===
                    category &&
                    styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUBCATEGORY */}

        <Text style={styles.label}>
          Subcategory
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Soap"
          value={form.subcategory}
          onChangeText={(text) =>
            updateForm(
              "subcategory",
              text
            )
          }
        />

        {/* EMOJI */}

        <Text style={styles.label}>
          Emoji
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 🧼"
          value={form.emoji}
          onChangeText={(text) =>
            updateForm(
              "emoji",
              text
            )
          }
        />

        {/* DESCRIPTION */}

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.descriptionInput,
          ]}
          placeholder="Write product description..."
          multiline
          value={form.description}
          onChangeText={(text) =>
            updateForm(
              "description",
              text
            )
          }
        />

        {/* STOCK + RATING */}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>
              Stock
            </Text>

            <TextInput
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={form.stock}
              onChangeText={(text) =>
                updateForm(
                  "stock",
                  text
                )
              }
            />
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>
              Rating
            </Text>

            <TextInput
              style={styles.input}
              placeholder="4.8"
              keyboardType="decimal-pad"
              value={form.rating}
              onChangeText={(text) =>
                updateForm(
                  "rating",
                  text
                )
              }
            />
          </View>
        </View>

        {/* REVIEW COUNT */}

        <Text style={styles.label}>
          Review Count
        </Text>

        <TextInput
          style={styles.input}
          placeholder="120"
          keyboardType="numeric"
          value={form.reviewCount}
          onChangeText={(text) =>
            updateForm(
              "reviewCount",
              text
            )
          }
        />

        {/* FEATURED */}

        <View
          style={styles.switchRow}
        >
          <View>
            <Text
              style={
                styles.switchTitle
              }
            >
              Featured Product
            </Text>

            <Text
              style={
                styles.switchDescription
              }
            >
              Show in featured section
            </Text>
          </View>

          <Switch
            value={form.featured}
            onValueChange={(value) =>
              updateForm(
                "featured",
                value
              )
            }
          />
        </View>

        {/* ACTIVE */}

        <View
          style={styles.switchRow}
        >
          <View>
            <Text
              style={
                styles.switchTitle
              }
            >
              Active Product
            </Text>

            <Text
              style={
                styles.switchDescription
              }
            >
              Customers can see this product
            </Text>
          </View>

          <Switch
            value={form.isActive}
            onValueChange={(value) =>
              updateForm(
                "isActive",
                value
              )
            }
          />
        </View>

        {/* SAVE BUTTON */}

        <TouchableOpacity
          style={[
            styles.saveButton,

            (saving ||
              uploadingImage) &&
              styles.disabledButton,
          ]}
          onPress={saveProduct}
          disabled={
            saving ||
            uploadingImage
          }
        >
          {saving ||
          uploadingImage ? (
            <View
              style={
                styles.loadingRow
              }
            >
              <ActivityIndicator
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveButtonText
                }
              >
                {uploadingImage
                  ? "Uploading Image..."
                  : "Saving..."}
              </Text>
            </View>
          ) : (
            <Text
              style={
                styles.saveButtonText
              }
            >
              {editingId
                ? "Update Product"
                : "Add Product"}
            </Text>
          )}
        </TouchableOpacity>

        {/* CANCEL EDIT */}

        {editingId ? (
          <TouchableOpacity
            style={
              styles.cancelButton
            }
            onPress={resetForm}
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancel Editing
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* PRODUCT LIST */}

      <Text
        style={
          styles.sectionHeading
        }
      >
        Products
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
        />
      ) : products.length === 0 ? (
        <Text
          style={styles.emptyText}
        >
          No products found.
        </Text>
      ) : (
        products.map((product) => (
          <View
            key={product._id}
            style={styles.productCard}
          >
            {product.image ? (
              <Image
                source={{
                  uri: product.image,
                }}
                style={
                  styles.productImage
                }
                resizeMode="contain"
              />
            ) : (
              <View
                style={styles.noImage}
              >
                <Text
                  style={
                    styles.noImageText
                  }
                >
                  {product.emoji ||
                    "📦"}
                </Text>
              </View>
            )}

            <View
              style={
                styles.productInfo
              }
            >
              <Text
                style={
                  styles.productName
                }
              >
                {product.name}
              </Text>

              <Text
                style={styles.brand}
              >
                {product.brand ||
                  "No brand"}
              </Text>

              <View
                style={styles.priceRow}
              >
                <Text
                  style={styles.price}
                >
                  ৳{product.price}
                </Text>

                {product.oldPrice &&
                product.oldPrice >
                  product.price ? (
                  <Text
                    style={
                      styles.oldPrice
                    }
                  >
                    ৳{product.oldPrice}
                  </Text>
                ) : null}
              </View>

              <Text
                style={styles.meta}
              >
                {product.category} •
                Stock:{" "}
                {product.stock ?? 0}
              </Text>

              <Text
                style={styles.meta}
              >
                ⭐{" "}
                {product.rating ?? 0} •{" "}
                {product.reviewCount ??
                  0}{" "}
                reviews
              </Text>

              {product.featured ? (
                <Text
                  style={
                    styles.featured
                  }
                >
                  ⭐ Featured
                </Text>
              ) : null}

              <View
                style={styles.actionRow}
              >
                <TouchableOpacity
                  style={
                    styles.editButton
                  }
                  onPress={() =>
                    editProduct(
                      product
                    )
                  }
                >
                  <Text
                    style={
                      styles.actionText
                    }
                  >
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    deleteProduct(
                      product
                    )
                  }
                >
                  <Text
                    style={
                      styles.actionText
                    }
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FA",
    },

    content: {
      padding: 18,
      paddingBottom: 60,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: "#111827",
      marginTop: 10,
    },

    subtitle: {
      fontSize: 14,
      color: "#6B7280",
      marginTop: 4,
      marginBottom: 18,
    },

    ordersButton: {
      backgroundColor:
        "#111827",
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 18,
    },

    ordersButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },

    formCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 16,
      marginBottom: 28,
      elevation: 2,
    },

    sectionTitle: {
      fontSize: 21,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 18,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      marginBottom: 7,
    },

    input: {
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 12,
      paddingHorizontal: 14,
      minHeight: 50,
      marginBottom: 15,
      backgroundColor:
        "#FAFAFA",
      color: "#111827",
    },

    descriptionInput: {
      minHeight: 110,
      textAlignVertical:
        "top",
      paddingTop: 12,
    },

    imagePickerButton: {
      borderWidth: 1.5,
      borderColor: "#FF5C7A",
      borderStyle: "dashed",
      backgroundColor:
        "#FFF5F7",
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 15,
    },

    imagePickerText: {
      color: "#FF5C7A",
      fontWeight: "700",
    },

    imagePreviewContainer: {
      alignItems: "center",
      backgroundColor:
        "#F9FAFB",
      padding: 12,
      borderRadius: 14,
      marginBottom: 20,
    },

    imagePreview: {
      width: 200,
      height: 200,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
    },

    imageSelected: {
      color: "#16A34A",
      fontWeight: "700",
      marginTop: 8,
    },

    removeImage: {
      color: "#DC2626",
      fontWeight: "600",
      marginTop: 8,
    },

    row: {
      flexDirection: "row",
      gap: 12,
    },

    half: {
      flex: 1,
    },

    categoryRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },

    categoryButton: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
      paddingVertical: 11,
      borderRadius: 20,
      alignItems: "center",
    },

    categoryButtonActive: {
      backgroundColor:
        "#FF5C7A",
    },

    categoryText: {
      color: "#374151",
      fontWeight: "600",
      textTransform:
        "capitalize",
      fontSize: 13,
    },

    categoryTextActive: {
      color: "#FFFFFF",
    },

    switchRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F3F4F6",
    },

    switchTitle: {
      color: "#111827",
      fontWeight: "700",
    },

    switchDescription: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 3,
    },

    saveButton: {
      backgroundColor:
        "#FF5C7A",
      borderRadius: 14,
      minHeight: 52,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 20,
    },

    disabledButton: {
      opacity: 0.7,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },

    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    cancelButton: {
      alignItems: "center",
      paddingVertical: 14,
    },

    cancelButtonText: {
      color: "#6B7280",
      fontWeight: "700",
    },

    sectionHeading: {
      fontSize: 23,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 15,
    },

    emptyText: {
      textAlign: "center",
      color: "#6B7280",
      marginVertical: 30,
    },

    productCard: {
      flexDirection: "row",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 12,
      marginBottom: 14,
      elevation: 2,
    },

    productImage: {
      width: 105,
      height: 115,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor:
        "#F9FAFB",
    },

    noImage: {
      width: 105,
      height: 115,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor:
        "#F3F4F6",
      alignItems: "center",
      justifyContent:
        "center",
    },

    noImageText: {
      fontSize: 40,
    },

    productInfo: {
      flex: 1,
    },

    productName: {
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
    },

    brand: {
      color: "#6B7280",
      fontSize: 13,
      marginTop: 2,
    },

    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 7,
    },

    price: {
      color: "#FF5C7A",
      fontSize: 17,
      fontWeight: "800",
    },

    oldPrice: {
      color: "#9CA3AF",
      fontSize: 13,
      textDecorationLine:
        "line-through",
    },

    meta: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 5,
    },

    featured: {
      color: "#D97706",
      fontSize: 12,
      fontWeight: "700",
      marginTop: 5,
    },

    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },

    editButton: {
      flex: 1,
      backgroundColor:
        "#2563EB",
      paddingVertical: 9,
      borderRadius: 9,
      alignItems: "center",
    },

    deleteButton: {
      flex: 1,
      backgroundColor:
        "#DC2626",
      paddingVertical: 9,
      borderRadius: 9,
      alignItems: "center",
    },

    actionText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
  });
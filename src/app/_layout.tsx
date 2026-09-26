import {
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

import { AddressProvider } from "@/context/AddressContext";
import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoriteProvider } from "@/context/FavoriteContext";
import { OrderProvider } from "@/context/OrderContext";
import { UserProvider } from "@/context/UserContext";

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const {
    isLoggedIn,
    isLoading,
  } = useAuth();

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentRoute =
      segments[0];

    const isAuthScreen =
      currentRoute === "login" ||
      currentRoute === "signup" ||
      currentRoute ===
        "forgot-password";

    if (
      !isLoggedIn &&
      !isAuthScreen
    ) {
      router.replace("/login");
      return;
    }

    if (
      isLoggedIn &&
      isAuthScreen
    ) {
      router.replace("/");
    }
  }, [
    isLoggedIn,
    isLoading,
    segments,
    router,
  ]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <AnimatedSplashOverlay />

      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="grocery"
          options={{
            title: "Grocery",
          }}
        />

        <Stack.Screen
          name="skincare"
          options={{
            title: "Skincare",
          }}
        />

        <Stack.Screen
          name="health"
          options={{
            title: "Health & Wellness",
          }}
        />

        <Stack.Screen
          name="cart"
          options={{
            title: "My Cart",
          }}
        />

        <Stack.Screen
          name="checkout"
          options={{
            title: "Checkout",
          }}
        />

        <Stack.Screen
          name="order-success"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="order-details"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="search"
          options={{
            title: "Search",
          }}
        />

        <Stack.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />

        <Stack.Screen
          name="my-orders"
          options={{
            title: "My Orders",
          }}
        />

        <Stack.Screen
          name="delivery-address"
          options={{
            title: "Delivery Address",
          }}
        />

        <Stack.Screen
          name="edit-profile"
          options={{
            title: "Edit Profile",
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />

        <Stack.Screen
          name="help-support"
          options={{
            title: "Help & Support",
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            title: "Explore",
          }}
        />

        <Stack.Screen
          name="favorites"
          options={{
            title: "My Favorites",
          }}
        />

        <Stack.Screen
          name="product-details"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider
      value={DefaultTheme}
    >
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <AddressProvider>
              <UserProvider>
                <FavoriteProvider>
                  <AppNavigator />
                </FavoriteProvider>
              </UserProvider>
            </AddressProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
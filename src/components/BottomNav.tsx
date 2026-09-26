import { useCart } from "@/context/CartContext";
import { router, usePathname } from "expo-router";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BottomNav() {
  const pathname = usePathname();

  const { cartItems } = useCart();

  const isActive = (route: string) => {
    return pathname === route;
  };

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      {/* Home */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => router.push("/")}
      >
        <Text style={styles.icon}>🏠</Text>

        <Text
          style={[
            styles.label,
            isActive("/") && styles.activeText,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Search */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => router.push("/search")}
      >
        <Text style={styles.icon}>🔍</Text>

        <Text
          style={[
            styles.label,
            isActive("/search") && styles.activeText,
          ]}
        >
          Search
        </Text>
      </TouchableOpacity>

      {/* Cart */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => router.push("/cart")}
      >
        <View style={styles.cartIconWrapper}>
          <Text style={styles.icon}>🛒</Text>

          {totalCartItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {totalCartItems > 99
                  ? "99+"
                  : totalCartItems}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.label,
            isActive("/cart") && styles.activeText,
          ]}
        >
          Cart
        </Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.icon}>👤</Text>

        <Text
          style={[
            styles.label,
            isActive("/profile") && styles.activeText,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",

    elevation: 12,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: -2,
    },
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 22,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777777",
    marginTop: 4,
  },

  activeText: {
    color: "#FF4F72",
  },

  cartIconWrapper: {
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -13,

    minWidth: 20,
    height: 20,

    paddingHorizontal: 5,

    borderRadius: 10,

    backgroundColor: "#FF4F72",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
});
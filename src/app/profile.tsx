import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const { savedName, savedPhone } = useUser();

  const displayName =
    savedName || user?.name || "MOM User";

  const displayPhone =
    savedPhone || user?.phone || "No phone added";

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();

            router.replace(
              "/login"
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Profile Header */}
        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={styles.avatar}
          >
            <Text
              style={
                styles.avatarText
              }
            >
              👩
            </Text>
          </View>

          <Text
            style={styles.name}
          >
            {displayName}
          </Text>

          <Text
            style={styles.phone}
          >
            {displayPhone}
          </Text>

          {user?.email ? (
            <Text
              style={styles.email}
            >
              {user.email}
            </Text>
          ) : null}

          {user?.role ===
            "admin" && (
            <View
              style={
                styles.adminBadge
              }
            >
              <Text
                style={
                  styles.adminBadgeText
                }
              >
                ADMIN
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={
              styles.editButton
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/edit-profile"
              )
            }
          >
            <Text
              style={
                styles.editButtonText
              }
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View
          style={styles.menuCard}
        >
          {/* My Orders */}
          <TouchableOpacity
            style={
              styles.menuItem
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/my-orders"
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <Text
                style={
                  styles.menuIcon
                }
              >
                📦
              </Text>

              <Text
                style={
                  styles.menuText
                }
              >
                My Orders
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* Admin Panel */}
          {user?.role ===
            "admin" && (
            <>
              <View
                style={
                  styles.divider
                }
              />

              <TouchableOpacity
                style={
                  styles.menuItem
                }
                activeOpacity={
                  0.8
                }
                onPress={() =>
                  router.push(
                    "/admin"
                  )
                }
              >
                <View
                  style={
                    styles.menuLeft
                  }
                >
                  <Text
                    style={
                      styles.menuIcon
                    }
                  >
                    🛠️
                  </Text>

                  <Text
                    style={
                      styles.adminMenuText
                    }
                  >
                    Admin Panel
                  </Text>
                </View>

                <Text
                  style={
                    styles.arrow
                  }
                >
                  ›
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View
            style={styles.divider}
          />

          {/* Favorites */}
          <TouchableOpacity
            style={
              styles.menuItem
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/favorites"
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <Text
                style={
                  styles.menuIcon
                }
              >
                ❤️
              </Text>

              <Text
                style={
                  styles.menuText
                }
              >
                My Favorites
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </TouchableOpacity>

          <View
            style={styles.divider}
          />

          {/* Delivery Address */}
          <TouchableOpacity
            style={
              styles.menuItem
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/delivery-address"
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <Text
                style={
                  styles.menuIcon
                }
              >
                📍
              </Text>

              <Text
                style={
                  styles.menuText
                }
              >
                Delivery Address
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </TouchableOpacity>

          <View
            style={styles.divider}
          />

          {/* Settings */}
          <TouchableOpacity
            style={
              styles.menuItem
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/settings"
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <Text
                style={
                  styles.menuIcon
                }
              >
                ⚙️
              </Text>

              <Text
                style={
                  styles.menuText
                }
              >
                Settings
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </TouchableOpacity>

          <View
            style={styles.divider}
          />

          {/* Help & Support */}
          <TouchableOpacity
            style={
              styles.menuItem
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/help-support"
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <Text
                style={
                  styles.menuIcon
                }
              >
                💬
              </Text>

              <Text
                style={
                  styles.menuText
                }
              >
                Help & Support
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={
            styles.logoutButton
          }
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text
            style={
              styles.logoutButtonText
            }
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles =
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor:
        "#FFF8F5",
    },

    container: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 25,
      paddingBottom: 110,
    },

    profileCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 26,

      padding: 22,

      alignItems: "center",

      elevation: 3,

      marginBottom: 20,

      shadowColor:
        "#000000",

      shadowOpacity: 0.05,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    avatar: {
      width: 85,
      height: 85,

      borderRadius: 43,

      backgroundColor:
        "#FFF0F4",

      justifyContent:
        "center",

      alignItems: "center",

      marginBottom: 14,
    },

    avatarText: {
      fontSize: 44,
    },

    name: {
      fontSize: 23,

      fontWeight: "900",

      color: "#282828",

      textAlign: "center",
    },

    phone: {
      fontSize: 14,

      color: "#777777",

      marginTop: 5,
    },

    email: {
      fontSize: 13,

      color: "#999999",

      marginTop: 4,
    },

    adminBadge: {
      backgroundColor:
        "#FFF0F4",

      borderWidth: 1,

      borderColor:
        "#FFB7C5",

      paddingHorizontal: 13,

      paddingVertical: 5,

      borderRadius: 20,

      marginTop: 10,
    },

    adminBadgeText: {
      color: "#FF4F72",

      fontSize: 11,

      fontWeight: "900",

      letterSpacing: 1,
    },

    editButton: {
      backgroundColor:
        "#FFF0F4",

      paddingHorizontal: 22,

      paddingVertical: 10,

      borderRadius: 20,

      marginTop: 16,
    },

    editButtonText: {
      fontSize: 14,

      fontWeight: "900",

      color: "#FF4F72",
    },

    menuCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      paddingHorizontal: 18,

      elevation: 2,
    },

    menuItem: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      paddingVertical: 17,
    },

    menuLeft: {
      flexDirection: "row",

      alignItems: "center",
    },

    menuIcon: {
      fontSize: 22,

      marginRight: 13,
    },

    menuText: {
      fontSize: 15,

      fontWeight: "800",

      color: "#282828",
    },

    adminMenuText: {
      fontSize: 15,

      fontWeight: "900",

      color: "#FF4F72",
    },

    arrow: {
      fontSize: 25,

      fontWeight: "900",

      color: "#BBBBBB",
    },

    divider: {
      height: 1,

      backgroundColor:
        "#F1E8E5",
    },

    logoutButton: {
      backgroundColor:
        "#FFFFFF",

      borderWidth: 1.5,

      borderColor:
        "#FFB7C5",

      borderRadius: 16,

      paddingVertical: 15,

      alignItems: "center",

      marginTop: 20,
    },

    logoutButtonText: {
      fontSize: 16,

      fontWeight: "900",

      color: "#FF4F72",
    },
  });
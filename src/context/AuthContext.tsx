import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config/api";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type AuthContextType = {
  user: User | null;

  token: string | null;

  isLoggedIn: boolean;

  isLoading: boolean;

  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<boolean>;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  logout: () => Promise<void>;

  resetPassword: (
    email: string,
    newPassword: string
  ) => Promise<boolean>;
};

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

const USER_KEY =
  "mom_auth_user";

const TOKEN_KEY =
  "mom_auth_token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    token,
    setToken,
  ] = useState<string | null>(
    null
  );

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession =
    async () => {
      try {
        const savedUser =
          await AsyncStorage.getItem(
            USER_KEY
          );

        const savedToken =
          await AsyncStorage.getItem(
            TOKEN_KEY
          );

        if (
          savedUser &&
          savedToken
        ) {
          const parsedUser:
            User =
            JSON.parse(
              savedUser
            );

          setUser(
            parsedUser
          );

          setToken(
            savedToken
          );

          setIsLoggedIn(
            true
          );
        }
      } catch (error) {
        console.log(
          "Error loading auth session:",
          error
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  const signup =
    async (
      name: string,
      email: string,
      phone: string,
      password: string
    ) => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    name.trim(),

                  email:
                    email
                      .trim()
                      .toLowerCase(),

                  phone:
                    phone.trim(),

                  password,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.log(
            "Signup error:",
            data.message
          );

          return false;
        }

        return await login(
          email,
          password
        );
      } catch (error) {
        console.log(
          "Signup request error:",
          error
        );

        return false;
      }
    };

  const login =
    async (
      email: string,
      password: string
    ) => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email:
                    email
                      .trim()
                      .toLowerCase(),

                  password,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.log(
            "Login error:",
            data.message
          );

          return false;
        }

        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(
            data.user
          )
        );

        await AsyncStorage.setItem(
          TOKEN_KEY,
          data.token
        );

        setUser(
          data.user
        );

        setToken(
          data.token
        );

        setIsLoggedIn(
          true
        );

        return true;
      } catch (error) {
        console.log(
          "Login request error:",
          error
        );

        return false;
      }
    };

  const logout =
    async () => {
      try {
        await AsyncStorage.removeItem(
          USER_KEY
        );

        await AsyncStorage.removeItem(
          TOKEN_KEY
        );

        setUser(null);

        setToken(null);

        setIsLoggedIn(
          false
        );
      } catch (error) {
        console.log(
          "Logout error:",
          error
        );
      }
    };

  const resetPassword =
    async (
      email: string,
      newPassword: string
    ) => {
      console.log(
        "Reset password backend API is not created yet.",
        email,
        newPassword
      );

      return false;
    };

  return (
    <AuthContext.Provider
      value={{
        user,

        token,

        isLoggedIn,

        isLoading,

        signup,

        login,

        logout,

        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (
    context === undefined
  ) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
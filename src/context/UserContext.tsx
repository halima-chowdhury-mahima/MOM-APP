import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type UserContextType = {
  savedName: string;
  savedPhone: string;

  saveUserInfo: (
    name: string,
    phone: string
  ) => Promise<void>;

  clearUserInfo: () => Promise<void>;
};

const UserContext = createContext<
  UserContextType | undefined
>(undefined);

const NAME_STORAGE_KEY = "mom_user_name";
const PHONE_STORAGE_KEY = "mom_user_phone";

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedName, setSavedName] = useState("");
  const [savedPhone, setSavedPhone] = useState("");

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const name = await AsyncStorage.getItem(
        NAME_STORAGE_KEY
      );

      const phone = await AsyncStorage.getItem(
        PHONE_STORAGE_KEY
      );

      if (name) {
        setSavedName(name);
      }

      if (phone) {
        setSavedPhone(phone);
      }
    } catch (error) {
      console.log(
        "Error loading user info:",
        error
      );
    }
  };

  const saveUserInfo = async (
    name: string,
    phone: string
  ) => {
    try {
      await AsyncStorage.setItem(
        NAME_STORAGE_KEY,
        name
      );

      await AsyncStorage.setItem(
        PHONE_STORAGE_KEY,
        phone
      );

      setSavedName(name);
      setSavedPhone(phone);
    } catch (error) {
      console.log(
        "Error saving user info:",
        error
      );
    }
  };

  const clearUserInfo = async () => {
    try {
      await AsyncStorage.removeItem(
        NAME_STORAGE_KEY
      );

      await AsyncStorage.removeItem(
        PHONE_STORAGE_KEY
      );

      setSavedName("");
      setSavedPhone("");
    } catch (error) {
      console.log(
        "Error clearing user info:",
        error
      );
    }
  };

  return (
    <UserContext.Provider
      value={{
        savedName,
        savedPhone,
        saveUserInfo,
        clearUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error(
      "useUser must be used inside UserProvider"
    );
  }

  return context;
}
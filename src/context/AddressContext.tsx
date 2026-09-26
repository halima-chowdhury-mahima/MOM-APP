import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AddressContextType = {
  savedAddress: string;
  saveAddress: (address: string) => Promise<void>;
  clearAddress: () => Promise<void>;
};

const AddressContext = createContext<
  AddressContextType | undefined
>(undefined);

const ADDRESS_STORAGE_KEY = "mom_delivery_address";

export function AddressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedAddress, setSavedAddress] = useState("");

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const address = await AsyncStorage.getItem(
        ADDRESS_STORAGE_KEY
      );

      if (address) {
        setSavedAddress(address);
      }
    } catch (error) {
      console.log(
        "Error loading address:",
        error
      );
    }
  };

  const saveAddress = async (
    address: string
  ) => {
    try {
      await AsyncStorage.setItem(
        ADDRESS_STORAGE_KEY,
        address
      );

      setSavedAddress(address);
    } catch (error) {
      console.log(
        "Error saving address:",
        error
      );
    }
  };

  const clearAddress = async () => {
    try {
      await AsyncStorage.removeItem(
        ADDRESS_STORAGE_KEY
      );

      setSavedAddress("");
    } catch (error) {
      console.log(
        "Error clearing address:",
        error
      );
    }
  };

  return (
    <AddressContext.Provider
      value={{
        savedAddress,
        saveAddress,
        clearAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);

  if (context === undefined) {
    throw new Error(
      "useAddress must be used inside AddressProvider"
    );
  }

  return context;
}
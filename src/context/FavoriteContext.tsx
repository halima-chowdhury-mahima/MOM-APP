import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type FavoriteItem = {
  productId: string;
  name: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  emoji?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
};

type FavoriteContextType = {
  favorites: FavoriteItem[];
  isLoaded: boolean;

  addFavorite: (item: FavoriteItem) => void;

  removeFavorite: (
    productId: string
  ) => void;

  toggleFavorite: (
    item: FavoriteItem
  ) => void;

  isFavorite: (
    productId: string
  ) => boolean;

  clearFavorites: () => void;
};

const FavoriteContext = createContext<
  FavoriteContextType | undefined
>(undefined);

const FAVORITE_STORAGE_KEY =
  "mom_favorites_v2";

export function FavoriteProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [favorites, setFavorites] =
    useState<FavoriteItem[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  // ==============================
  // LOAD FAVORITES
  // ==============================

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites =
          await AsyncStorage.getItem(
            FAVORITE_STORAGE_KEY
          );

        if (savedFavorites) {
          const parsed =
            JSON.parse(savedFavorites);

          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        }
      } catch (error) {
        console.log(
          "Favorite load error:",
          error
        );
      } finally {
        setIsLoaded(true);
      }
    };

    loadFavorites();
  }, []);

  // ==============================
  // SAVE FAVORITES
  // ==============================

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(
          FAVORITE_STORAGE_KEY,
          JSON.stringify(favorites)
        );
      } catch (error) {
        console.log(
          "Favorite save error:",
          error
        );
      }
    };

    saveFavorites();
  }, [favorites, isLoaded]);

  // ==============================
  // ADD
  // ==============================

  const addFavorite = (
    item: FavoriteItem
  ) => {
    if (!item.productId) {
      console.log(
        "Favorite product ID missing"
      );
      return;
    }

    setFavorites((previous) => {
      const exists = previous.some(
        (product) =>
          product.productId ===
          item.productId
      );

      if (exists) {
        return previous;
      }

      return [...previous, item];
    });
  };

  // ==============================
  // REMOVE
  // ==============================

  const removeFavorite = (
    productId: string
  ) => {
    setFavorites((previous) =>
      previous.filter(
        (product) =>
          product.productId !== productId
      )
    );
  };

  // ==============================
  // TOGGLE
  // ==============================

  const toggleFavorite = (
    item: FavoriteItem
  ) => {
    if (!item.productId) {
      console.log(
        "Favorite product ID missing"
      );
      return;
    }

    setFavorites((previous) => {
      const exists = previous.some(
        (product) =>
          product.productId ===
          item.productId
      );

      if (exists) {
        return previous.filter(
          (product) =>
            product.productId !==
            item.productId
        );
      }

      return [...previous, item];
    });
  };

  // ==============================
  // CHECK
  // ==============================

  const isFavorite = (
    productId: string
  ) => {
    return favorites.some(
      (product) =>
        product.productId === productId
    );
  };

  // ==============================
  // CLEAR
  // ==============================

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        isLoaded,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context =
    useContext(FavoriteContext);

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoriteProvider"
    );
  }

  return context;
}
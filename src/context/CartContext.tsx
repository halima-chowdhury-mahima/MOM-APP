import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  productId?: string;
  name: string;
  price: number;
  emoji?: string;
  image?: string;
  brand?: string;
  quantity: number;
  stock?: number;
};

export type AddToCartItem = {
  productId: string;
  name: string;
  price: number;

  image?: string;
  emoji?: string;

  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;

  oldPrice?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
};
type CartContextType = {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;

  addToCart: (
    product: AddToCartItem,
    quantity?: number
  ) => void;

  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const CART_KEY = "mom_cart_items";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // =========================
  // LOAD CART
  // =========================

  useEffect(() => {
    loadCart();
  }, []);

  // =========================
  // SAVE CART
  // =========================

  useEffect(() => {
    if (isLoaded) {
      saveCart(cartItems);
    }
  }, [cartItems, isLoaded]);

  const loadCart = async () => {
    try {
      const savedCart =
        await AsyncStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        setCartItems(parsedCart);
      }
    } catch (error) {
      console.log(
        "Cart loading error:",
        error
      );
    } finally {
      setIsLoaded(true);
    }
  };

  const saveCart = async (
    items: CartItem[]
  ) => {
    try {
      await AsyncStorage.setItem(
        CART_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.log(
        "Cart saving error:",
        error
      );
    }
  };

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (
    product: AddToCartItem,
    quantity = 1
  ) => {
    setCartItems((currentItems) => {
      const existingItem =
        currentItems.find((item) =>
          product.productId
            ? item.productId ===
              product.productId
            : item.name === product.name
        );

      if (existingItem) {
        return currentItems.map(
          (item) => {
            const isSameProduct =
              product.productId
                ? item.productId ===
                  product.productId
                : item.name ===
                  product.name;

            if (!isSameProduct) {
              return item;
            }

            let newQuantity =
              item.quantity + quantity;

            // Don't exceed stock
            if (
              product.stock !==
                undefined &&
              newQuantity >
                product.stock
            ) {
              newQuantity =
                product.stock;
            }

            return {
              ...item,
              price: product.price,
              image:
                product.image ||
                item.image,
              brand:
                product.brand ||
                item.brand,
              emoji:
                product.emoji ||
                item.emoji,
              stock:
                product.stock ??
                item.stock,
              quantity:
                newQuantity,
            };
          }
        );
      }

      let initialQuantity =
        quantity;

      if (
        product.stock !==
          undefined &&
        initialQuantity >
          product.stock
      ) {
        initialQuantity =
          product.stock;
      }

      const newItem: CartItem = {
        productId:
          product.productId,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        image: product.image,
        brand: product.brand,
        stock: product.stock,
        quantity:
          initialQuantity,
      };

      return [
        ...currentItems,
        newItem,
      ];
    });
  };

  // =========================
  // INCREASE
  // =========================

  const increaseQuantity = (
    productId: string
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              item.productId !==
              productId
            ) {
              return item;
            }

            if (
              item.stock !==
                undefined &&
              item.quantity >=
                item.stock
            ) {
              return item;
            }

            return {
              ...item,
              quantity:
                item.quantity + 1,
            };
          }
        )
    );
  };

  // =========================
  // DECREASE
  // =========================

  const decreaseQuantity = (
    productId: string
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems
          .map((item) =>
            item.productId ===
            productId
              ? {
                  ...item,
                  quantity:
                    item.quantity -
                    1,
                }
              : item
          )
          .filter(
            (item) =>
              item.quantity > 0
          )
    );
  };

  // =========================
  // REMOVE
  // =========================

  const removeFromCart = (
    productId: string
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.productId !==
            productId
        )
    );
  };

  // =========================
  // CLEAR
  // =========================

  const clearCart = () => {
    setCartItems([]);
  };

  // =========================
  // TOTALS
  // =========================

  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const totalPrice =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
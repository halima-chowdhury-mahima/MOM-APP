import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type OrderItem = {
  name: string;
  price: number;
  emoji: string;
  quantity: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  grandTotal: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  date: string;
  status: string;
};

type OrderContextType = {
  orders: Order[];
  addOrder: (order: Order) => void;
};

const OrderContext = createContext<
  OrderContextType | undefined
>(undefined);

const ORDER_STORAGE_KEY = "mom_orders";

export function OrderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveOrders();
    }
  }, [orders, isLoaded]);

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem(
        ORDER_STORAGE_KEY
      );

      if (savedOrders) {
        const parsedOrders: Order[] =
          JSON.parse(savedOrders);

        setOrders(parsedOrders);
      }
    } catch (error) {
      console.log(
        "Error loading orders:",
        error
      );
    } finally {
      setIsLoaded(true);
    }
  };

  const saveOrders = async () => {
    try {
      await AsyncStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (error) {
      console.log(
        "Error saving orders:",
        error
      );
    }
  };

  const addOrder = (order: Order) => {
    setOrders((previousOrders) => [
      order,
      ...previousOrders,
    ]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (context === undefined) {
    throw new Error(
      "useOrders must be used inside OrderProvider"
    );
  }

  return context;
}
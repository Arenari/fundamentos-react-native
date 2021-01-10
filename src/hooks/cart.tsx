import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productList = await AsyncStorage.getItem('products');
      if (productList) setProducts(JSON.parse(productList));
    }

    loadProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const index = products.findIndex(item => item.id === product.id);
      let productList = [];
      if (index === -1) {
        productList = [...products, { ...product, quantity: 1 }];
      } else {
        let selectedProduct = { ...products[index] };
        selectedProduct.quantity++;
        productList = [
          ...products.slice(0, index),
          selectedProduct,
          ...products.slice(index + 1, products.length),
        ];
      }
      setProducts(productList);
      await AsyncStorage.setItem('products', JSON.stringify(productList));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(item => item.id === id);
      let selectedProduct = { ...products[index] };
      selectedProduct.quantity++;
      const productList = [
        ...products.slice(0, index),
        selectedProduct,
        ...products.slice(index + 1, products.length),
      ];
      setProducts(productList);
      await AsyncStorage.setItem('products', JSON.stringify(productList));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(item => item.id === id);
      let selectedProduct = { ...products[index] };
      selectedProduct.quantity--;
      let productList = [];
      if (selectedProduct.quantity <= 0) {
        productList = [
          ...products.slice(0, index),
          ...products.slice(index + 1, products.length),
        ];
      } else {
        productList = [
          ...products.slice(0, index),
          selectedProduct,
          ...products.slice(index + 1, products.length),
        ];
      }
      setProducts(productList);
      await AsyncStorage.setItem('products', JSON.stringify(productList));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

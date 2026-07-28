import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import CustomerOrdersScreen from '../screens/customer/CustomerOrdersScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';
import CustomerFoodDetailScreen from '../screens/customer/CustomerFoodDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home stack with nested detail screens
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
    <Stack.Screen name="FoodDetail" component={CustomerFoodDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CustomerOrders" component={CustomerOrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

const CustomerStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
};

export default CustomerStack;

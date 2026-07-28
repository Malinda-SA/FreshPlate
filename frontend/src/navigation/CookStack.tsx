import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import CookDashboardScreen from '../screens/cook/CookDashboardScreen';
import CookMenuScreen from '../screens/cook/CookMenuScreen';
import CookOrdersScreen from '../screens/cook/CookOrdersScreen';
import CookProfileScreen from '../screens/cook/CookProfileScreen';
import AddFoodScreen from '../screens/cook/AddFoodScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CookDashboard" component={CookDashboardScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

const MenuStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MenuList" component={CookMenuScreen} />
    <Stack.Screen name="AddFood" component={AddFoodScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CookOrders" component={CookOrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

const CookStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'MyMenu') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="MyMenu" component={MenuStack} options={{ tabBarLabel: 'My Menu' }} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={CookProfileScreen} />
    </Tab.Navigator>
  );
};

export default CookStack;

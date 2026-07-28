import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ApprovalsScreen from '../screens/admin/ApprovalsScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

const ApprovalsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ApprovalsList" component={ApprovalsScreen} />
  </Stack.Navigator>
);

const UsersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UsersList" component={ManageUsersScreen} />
  </Stack.Navigator>
);

const AdminStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Approvals') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7C3AED',
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
      <Tab.Screen name="Approvals" component={ApprovalsStack} />
      <Tab.Screen name="Users" component={UsersStack} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
};

export default AdminStack;

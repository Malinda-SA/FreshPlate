import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import AuthStack from './AuthStack';
import CustomerStack from './CustomerStack';
import CookStack from './CookStack';
import DriverStack from './DriverStack';
import AdminStack from './AdminStack';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';

const RootNavigator = () => {
  const { user, token, isLoading } = useAuth();

  // Show loading screen while restoring token
  if (isLoading) {
    return <LoadingScreen message="Loading FreshPlate..." />;
  }

  // Not authenticated — show login/register
  if (!token || !user) {
    return <AuthStack />;
  }

  // Authenticated but not approved (cooks and drivers)
  if (
    (user.role === 'cook' || user.role === 'driver') &&
    !user.isApproved
  ) {
    return <PendingApprovalScreen />;
  }

  // Authenticated and approved — show role-specific dashboard
  switch (user.role) {
    case 'admin':
      return <AdminStack />;
    case 'cook':
      return <CookStack />;
    case 'driver':
      return <DriverStack />;
    case 'customer':
    default:
      return <CustomerStack />;
  }
};

export default RootNavigator;

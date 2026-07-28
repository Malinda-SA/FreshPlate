import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../api/services/orderService';
import foodService from '../../api/services/foodService';
import Card from '../../components/Card';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const CookDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFoods: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    completedToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [foodsRes, ordersRes] = await Promise.all([
        foodService.getMyFoods(),
        orderService.getOrders(),
      ]);

      const orders = ordersRes.data || [];
      const today = new Date().toDateString();

      setStats({
        totalFoods: foodsRes.count || 0,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        preparingOrders: orders.filter((o: any) =>
          ['confirmed', 'preparing'].includes(o.status)
        ).length,
        completedToday: orders.filter(
          (o: any) =>
            o.status === 'delivered' &&
            new Date(o.createdAt).toDateString() === today
        ).length,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.log('Error fetching cook data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  const statCards = [
    {
      icon: 'restaurant-outline',
      label: 'My Dishes',
      value: stats.totalFoods,
      color: Colors.secondary,
      bg: '#FFF7ED',
    },
    {
      icon: 'time-outline',
      label: 'Pending',
      value: stats.pendingOrders,
      color: Colors.warning,
      bg: '#FEF3C7',
    },
    {
      icon: 'flame-outline',
      label: 'Preparing',
      value: stats.preparingOrders,
      color: Colors.info,
      bg: '#DBEAFE',
    },
    {
      icon: 'checkmark-circle-outline',
      label: 'Delivered Today',
      value: stats.completedToday,
      color: Colors.success,
      bg: '#D1FAE5',
    },
  ];

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: Colors.warning,
      confirmed: Colors.info,
      preparing: '#7C3AED',
      ready: Colors.success,
    };
    return colorMap[status] || Colors.textSecondary;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          colors={[Colors.secondary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, Chef {user?.name?.split(' ')[0]}! 👨‍🍳
          </Text>
          <Text style={styles.kitchenName}>
            {user?.kitchenName || 'Your Kitchen'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: stat.bg }]}>
            <Ionicons name={stat.icon as any} size={26} color={stat.color} />
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyMenu')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.actionText}>Add Food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="list-outline" size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="settings-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No orders yet. Add food items to get started!</Text>
          </Card>
        ) : (
          recentOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderItem}
              onPress={() => navigation.navigate('Orders')}
            >
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderCustomer}>
                  {order.customer?.name} • {order.items?.length} items
                </Text>
              </View>
              <Text style={styles.orderAmount}>
                Rs. {order.totalAmount?.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: Fonts.sizes['2xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  kitchenName: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    width: '47.5%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Fonts.sizes['3xl'],
    fontWeight: Fonts.weights.extrabold,
    marginTop: 6,
  },
  statLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: Fonts.weights.medium,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: Fonts.sizes.md,
    color: Colors.secondary,
    fontWeight: Fonts.weights.semibold,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  orderInfo: { flex: 1 },
  orderNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  orderCustomer: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  orderAmount: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.secondary,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default CookDashboardScreen;

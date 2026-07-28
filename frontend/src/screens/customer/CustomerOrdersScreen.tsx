import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import orderService, { Order } from '../../api/services/orderService';
import StatusBadge from '../../components/StatusBadge';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';
import { Config } from '../../constants/config';

const CustomerOrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  );

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>

      <View style={styles.orderBody}>
        <View style={styles.cookRow}>
          <Ionicons name="restaurant-outline" size={16} color={Colors.secondary} />
          <Text style={styles.cookName}>
            {item.cook?.kitchenName || item.cook?.name}
          </Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.slice(0, 3).map((orderItem, index) => (
            <Text key={index} style={styles.itemText}>
              {orderItem.quantity}x {orderItem.name}
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 3} more items
            </Text>
          )}
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.orderTotal}>Rs. {item.totalAmount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen message="Loading orders..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}
          >
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.tabTextActive,
            ]}
          >
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={activeTab === 'active' ? 'No Active Orders' : 'No Orders Yet'}
            message={
              activeTab === 'active'
                ? 'Browse our menu and place your first order!'
                : 'Your completed orders will appear here.'
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: Fonts.sizes['2xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  orderBody: {
    marginBottom: 12,
  },
  cookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cookName: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: Fonts.weights.medium,
  },
  itemsList: {
    paddingLeft: 22,
  },
  itemText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  orderDate: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  orderTotal: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
});

export default CustomerOrdersScreen;

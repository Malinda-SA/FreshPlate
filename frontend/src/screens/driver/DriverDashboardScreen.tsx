import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList, Alert } from 'react-native';
import { showAlert, showConfirmAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import orderService, { Order } from '../../api/services/orderService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const DriverDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');

  const fetchData = useCallback(async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        orderService.getAvailableOrders(),
        orderService.getOrders(),
      ]);
      setAvailableOrders(availableRes.data || []);
      setMyDeliveries(myRes.data || []);
    } catch (error) { console.log('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchData);
    return unsub;
  }, [navigation, fetchData]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await orderService.assignDriver(orderId);
      showAlert('Success', 'Delivery accepted!');
      fetchData();
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to accept');
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      fetchData();
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update');
    }
  };

  const activeDeliveries = myDeliveries.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const completedCount = myDeliveries.filter((o) => o.status === 'delivered').length;

  const renderAvailableOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNum}>{item.orderNumber}</Text>
        <Text style={styles.amount}>Rs. {item.totalAmount.toFixed(2)}</Text>
      </View>
      <View style={styles.addressRow}>
        <View style={styles.addressPoint}>
          <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressText}>{item.cook?.name} ({item.cook?.kitchenName})</Text>
          </View>
        </View>
        <View style={styles.addressLine} />
        <View style={styles.addressPoint}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>Deliver to</Text>
            <Text style={styles.addressText}>{item.customer?.name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemsSummary}>
        <Ionicons name="restaurant-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.itemsText}>{item.items?.length} items</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(item._id)}>
        <Text style={styles.acceptBtnText}>Accept Delivery</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMyDelivery = ({ item }: { item: Order }) => {
    const isPickedUp = item.status === 'picked_up';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNum}>{item.orderNumber}</Text>
          <StatusBadge status={item.status} size="sm" />
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.infoLabel}>Customer: <Text style={styles.infoValue}>{item.customer?.name} • {item.customer?.phone}</Text></Text>
          <Text style={styles.infoLabel}>Cook: <Text style={styles.infoValue}>{item.cook?.kitchenName || item.cook?.name}</Text></Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.amount}>Rs. {item.totalAmount.toFixed(2)}</Text>
          {item.status === 'ready' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.info }]} onPress={() => handleStatusUpdate(item._id, 'picked_up')}>
              <Text style={styles.actionBtnText}>Picked Up</Text>
            </TouchableOpacity>
          )}
          {isPickedUp && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleStatusUpdate(item._id, 'delivered')}>
              <Text style={styles.actionBtnText}>Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}! 🚗</Text>
          <Text style={styles.subtitle}>{activeDeliveries.length} active • {completedCount} delivered</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'available' && styles.tabActive]} onPress={() => setActiveTab('available')}>
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>Available ({availableOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'mine' && styles.tabActive]} onPress={() => setActiveTab('mine')}>
          <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>My Deliveries ({myDeliveries.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'available' ? availableOrders : myDeliveries}
        renderItem={activeTab === 'available' ? renderAvailableOrder : renderMyDelivery}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[Colors.info]} />}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'available' ? 'car-outline' : 'receipt-outline'}
            title={activeTab === 'available' ? 'No Available Deliveries' : 'No Deliveries Yet'}
            message={activeTab === 'available' ? 'New delivery orders will appear here' : 'Accept deliveries from the Available tab'}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.info, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.white },
  subtitle: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.info },
  tabText: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.medium, color: Colors.textSecondary },
  tabTextActive: { color: Colors.info, fontWeight: Fonts.weights.bold },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNum: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text },
  amount: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.info },
  addressRow: { marginBottom: 12 },
  addressPoint: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: Fonts.sizes.xs, color: Colors.textLight, fontWeight: Fonts.weights.medium },
  addressText: { fontSize: Fonts.sizes.md, color: Colors.text },
  addressLine: { width: 2, height: 16, backgroundColor: Colors.border, marginLeft: 4, marginVertical: 2 },
  itemsSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemsText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginLeft: 6 },
  acceptBtn: { backgroundColor: Colors.info, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  acceptBtnText: { color: Colors.white, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },
  deliveryInfo: { marginBottom: 12 },
  infoLabel: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: 4 },
  infoValue: { color: Colors.text, fontWeight: Fonts.weights.medium },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginLeft: 'auto' },
  actionBtnText: { color: Colors.white, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },
});

export default DriverDashboardScreen;

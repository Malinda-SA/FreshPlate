import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { showAlert, showConfirmAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import orderService, { Order } from '../../api/services/orderService';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const CookOrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data);
    } catch (error) { console.log('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchOrders);
    return unsub;
  }, [navigation, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update order');
    }
  };

  const getNextAction = (status: string) => {
    const actions: Record<string, { label: string; next: string; color: string }> = {
      pending: { label: 'Accept Order', next: 'confirmed', color: Colors.info },
      confirmed: { label: 'Start Preparing', next: 'preparing', color: '#7C3AED' },
      preparing: { label: 'Mark Ready', next: 'ready', color: Colors.success },
    };
    return actions[status];
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const action = getNextAction(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNum}>{item.orderNumber}</Text>
          <StatusBadge status={item.status} size="sm" />
        </View>
        <View style={styles.customerRow}>
          <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.customerName}>{item.customer?.name}</Text>
          <Ionicons name="call-outline" size={14} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
          <Text style={styles.customerPhone}>{item.customer?.phone}</Text>
        </View>
        <View style={styles.itemsContainer}>
          {item.items.map((orderItem, idx) => (
            <Text key={idx} style={styles.itemText}>• {orderItem.quantity}x {orderItem.name} — Rs. {(orderItem.price * orderItem.quantity).toFixed(2)}</Text>
          ))}
        </View>
        {item.specialInstructions ? (
          <View style={styles.notesRow}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.warning} />
            <Text style={styles.notesText}>{item.specialInstructions}</Text>
          </View>
        ) : null}
        <View style={styles.cardFooter}>
          <Text style={styles.total}>Rs. {item.totalAmount.toFixed(2)}</Text>
          {action && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: action.color }]}
              onPress={() => handleStatusUpdate(item._id, action.next)}
            >
              <Text style={styles.actionBtnText}>{action.label}</Text>
            </TouchableOpacity>
          )}
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => {
                showAlert('Cancel Order', 'Are you sure?', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', style: 'destructive', onPress: () => handleStatusUpdate(item._id, 'cancelled') },
                ]);
              }}
            >
              <Ionicons name="close" size={18} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Orders</Text></View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[Colors.secondary]} />}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No Orders Yet" message="Orders from customers will appear here" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: Colors.surface },
  title: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.text },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderNum: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  customerName: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginLeft: 6 },
  customerPhone: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginLeft: 4 },
  itemsContainer: { backgroundColor: Colors.borderLight, borderRadius: 10, padding: 10, marginBottom: 10 },
  itemText: { fontSize: Fonts.sizes.sm, color: Colors.text, marginBottom: 3 },
  notesRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginBottom: 10 },
  notesText: { fontSize: Fonts.sizes.sm, color: Colors.warning, marginLeft: 6, flex: 1, fontStyle: 'italic' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 },
  total: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.secondary, flex: 1 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: Colors.white, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },
  rejectBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});

export default CookOrdersScreen;

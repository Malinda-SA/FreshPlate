import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import orderService, { Order } from '../../api/services/orderService';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';

const DriverEarningsScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const response = await orderService.getOrders();
      // Filter only delivered orders for earnings
      const delivered = response.data.filter((o: Order) => o.status === 'delivered');
      setOrders(delivered);
    } catch (error) {
      console.log('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // Assuming a flat delivery fee per order for now (e.g. Rs 150)
  const deliveryFee = 150;
  const totalEarnings = orders.length * deliveryFee;

  const renderEarningItem = ({ item }: { item: Order }) => (
    <View style={styles.earningCard}>
      <View style={styles.earningHeader}>
        <Text style={styles.orderNum}>{item.orderNumber}</Text>
        <Text style={styles.earningAmount}>+ Rs. {deliveryFee.toFixed(2)}</Text>
      </View>
      <View style={styles.earningBody}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{item.customer?.address?.city || 'City'}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (loading) return <LoadingScreen message="Loading earnings..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Earnings</Text>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>Rs. {totalEarnings.toFixed(2)}</Text>
          <Text style={styles.totalDeliveries}>{orders.length} deliveries completed</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        renderItem={renderEarningItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEarnings(); }} colors={[Colors.info]} />
        }
        ListEmptyComponent={
          <EmptyState 
            icon="wallet-outline" 
            title="No Earnings Yet" 
            message="Complete your first delivery to start earning!"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, 
    backgroundColor: Colors.info, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 
  },
  title: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.white, marginBottom: 16 },
  totalCard: { 
    backgroundColor: 'rgba(255,255,255,0.15)', padding: 20, borderRadius: 16, 
    alignItems: 'center' 
  },
  totalLabel: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  totalAmount: { fontSize: Fonts.sizes['3xl'], fontWeight: Fonts.weights.extrabold, color: Colors.white, marginBottom: 4 },
  totalDeliveries: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  list: { padding: 16, paddingBottom: 100 },
  earningCard: { 
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, 
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 
  },
  earningHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNum: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold, color: Colors.text },
  earningAmount: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.success },
  earningBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginLeft: 6 },
  dateText: { fontSize: Fonts.sizes.sm, color: Colors.textLight },
});

export default DriverEarningsScreen;

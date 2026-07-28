import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { showAlert, showConfirmAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import orderService, { Order } from '../../api/services/orderService';
import StatusBadge from '../../components/StatusBadge';
import LoadingScreen from '../../components/LoadingScreen';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const OrderDetailScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrder(orderId);
        setOrder(response.data);
      } catch (error: any) {
        showAlert('Error', error.message || 'Failed to load order details');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigation]);

  if (loading || !order) return <LoadingScreen message="Loading order details..." />;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const getPrimaryColor = () => {
    switch (user?.role) {
      case 'cook': return Colors.secondary;
      case 'driver': return Colors.info;
      case 'admin': return '#7C3AED';
      default: return Colors.primary;
    }
  };

  const primaryColor = getPrimaryColor();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Order Status</Text>
          <StatusBadge status={order.status} size="md" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemQuantity}>
                  <Text style={styles.quantityText}>{item.quantity}x</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rs. {item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.itemTotal}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: primaryColor }]}>Rs. {order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Order Date</Text>
                <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>

            {order.specialInstructions && (
              <View style={styles.detailRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.warning} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Special Instructions</Text>
                  <Text style={styles.detailValue}>{order.specialInstructions}</Text>
                </View>
              </View>
            )}

            {(user?.role === 'customer' || user?.role === 'admin' || user?.role === 'driver') && (
              <View style={styles.detailRow}>
                <Ionicons name="restaurant-outline" size={20} color={Colors.secondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Cook</Text>
                  <Text style={styles.detailValue}>{order.cook?.kitchenName || order.cook?.name}</Text>
                  <Text style={styles.detailSubtext}>{order.cook?.phone}</Text>
                </View>
              </View>
            )}

            {(user?.role === 'cook' || user?.role === 'admin' || user?.role === 'driver') && (
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{order.customer?.name}</Text>
                  <Text style={styles.detailSubtext}>{order.customer?.phone}</Text>
                  {order.customer?.address && (
                    <Text style={styles.detailSubtext}>{order.customer?.address.street}, {order.customer?.address.city}</Text>
                  )}
                </View>
              </View>
            )}

            {order.driver && (
              <View style={styles.detailRow}>
                <Ionicons name="car-outline" size={20} color={Colors.info} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Delivery Driver</Text>
                  <Text style={styles.detailValue}>{order.driver.name}</Text>
                  <Text style={styles.detailSubtext}>{order.driver.phone}</Text>
                  <Text style={styles.detailSubtext}>{order.driver.vehicleType} - {order.driver.vehicleNumber}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.white },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: 16, borderRadius: 16, marginBottom: 20, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statusLabel: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.text },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.text, marginBottom: 12 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemQuantity: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  quantityText: { fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold, color: Colors.text },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.medium, color: Colors.text, marginBottom: 2 },
  itemPrice: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  itemTotal: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.medium, color: Colors.textSecondary },
  totalValue: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold },
  detailRow: { flexDirection: 'row', marginBottom: 20 },
  detailContent: { flex: 1, marginLeft: 16 },
  detailLabel: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: 4 },
  detailValue: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.medium, color: Colors.text, marginBottom: 2 },
  detailSubtext: { fontSize: Fonts.sizes.sm, color: Colors.textLight },
});

export default OrderDetailScreen;

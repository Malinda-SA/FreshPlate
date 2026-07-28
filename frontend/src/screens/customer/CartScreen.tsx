import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import orderService from '../../api/services/orderService';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';
import Input from '../../components/Input';

const CartScreen = ({ navigation }: any) => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleCheckout = async () => {
    if (state.items.length === 0) return;
    
    // Check if items are from different cooks
    const cookIds = new Set(state.items.map(item => item.cook?._id || item.cook));
    if (cookIds.size > 1) {
      showAlert('Multiple Cooks', 'You can only order from one cook at a time. Please adjust your cart.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: state.items.map(item => ({
          food: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        specialInstructions,
        deliveryAddress: {
          street: "123 Main St", // Hardcoded for demo since we don't have an address form yet
          city: "Colombo",
        }
      };

      const response = await orderService.createOrder(orderData);
      clearCart();
      showAlert('Order Placed!', `Your order #${response.data.orderNumber} has been placed successfully.`, [
        { text: 'View Orders', onPress: () => navigation.navigate('Orders') }
      ]);
    } catch (error: any) {
      showAlert('Checkout Failed', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant-outline" size={24} color={Colors.disabled} />
          </View>
        )}
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rs. {item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.quantityControl}>
        <TouchableOpacity 
          style={styles.qtyBtn} 
          onPress={() => updateQuantity(item._id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.qtyBtn} 
          onPress={() => updateQuantity(item._id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={clearCart} disabled={state.items.length === 0}>
          <Text style={[styles.clearText, state.items.length === 0 && styles.disabledText]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {state.items.length === 0 ? (
        <EmptyState 
          icon="cart-outline" 
          title="Your Cart is Empty" 
          message="Looks like you haven't added anything to your cart yet."
          action={<Button title="Browse Food" onPress={() => navigation.goBack()} size="sm" fullWidth={false} />}
        />
      ) : (
        <>
          <FlatList
            data={state.items}
            renderItem={renderCartItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.footerComponent}>
                <Input 
                  label="Special Instructions" 
                  placeholder="Any allergies or preferences?" 
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                  numberOfLines={2}
                />
              </View>
            }
          />

          <View style={styles.checkoutContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rs. {state.total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>Rs. 0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {state.total.toFixed(2)}</Text>
            </View>
            <Button 
              title={`Checkout — Rs. ${state.total.toFixed(2)}`} 
              onPress={handleCheckout} 
              loading={loading}
              style={styles.checkoutBtn}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  title: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },
  clearText: { fontSize: Fonts.sizes.base, color: Colors.error, fontWeight: Fonts.weights.medium },
  disabledText: { color: Colors.textLight },
  list: { padding: 16, paddingBottom: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  itemImageContainer: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  itemImage: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold, color: Colors.text, marginBottom: 4 },
  itemPrice: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: Fonts.weights.bold },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  qtyText: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text, marginHorizontal: 12 },
  footerComponent: { marginTop: 16, marginBottom: 30 },
  checkoutContainer: { backgroundColor: Colors.surface, padding: 20, paddingBottom: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
  summaryValue: { fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: Fonts.weights.medium },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 16, marginTop: 4, marginBottom: 20 },
  totalLabel: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.text },
  totalValue: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.primary },
  checkoutBtn: { marginVertical: 0 },
});

export default CartScreen;

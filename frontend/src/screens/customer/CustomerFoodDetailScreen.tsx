import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import foodService, { Food } from '../../api/services/foodService';
import { useCart } from '../../context/CartContext';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import LoadingScreen from '../../components/LoadingScreen';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const CustomerFoodDetailScreen = ({ route, navigation }: any) => {
  const { foodId } = route.params;
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await foodService.getFood(foodId);
        setFood(response.data);
      } catch (error: any) {
        showAlert('Error', error.message || 'Failed to load food details', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [foodId, navigation]);

  const handleAddToCart = () => {
    if (food) {
      addItem(food, quantity);
      showAlert('Added to Cart', `${quantity}x ${food.name} added to your cart!`, [
        { text: 'Keep Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]);
    }
  };

  if (loading || !food) return <LoadingScreen message="Loading delicious details..." />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          {food.image ? (
            <Image source={{ uri: food.image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant-outline" size={80} color={Colors.disabled} />
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{food.name}</Text>
            {food.isVegetarian && (
              <View style={styles.vegBadge}>
                <Ionicons name="leaf" size={14} color={Colors.white} />
              </View>
            )}
          </View>

          <Text style={styles.price}>Rs. {food.price.toFixed(2)}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{food.preparationTime} mins</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{food.spiceLevel} spice</Text>
            </View>
            {food.rating > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={18} color={Colors.accent} />
                <Text style={styles.metaText}>{food.rating.toFixed(1)} Rating</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{food.description}</Text>
          </View>

          {food.ingredients && food.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.description}>{food.ingredients.join(', ')}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cooked By</Text>
            <View style={styles.cookInfo}>
              <View style={styles.cookAvatar}>
                <Ionicons name="person" size={24} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.cookName}>{food.cook?.kitchenName || food.cook?.name}</Text>
                <Text style={styles.cookRole}>Home Cook</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityBtn} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityBtn} 
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <Button 
          title={`Add to Cart - Rs. ${(food.price * quantity).toFixed(2)}`} 
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
          fullWidth={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageContainer: { height: 250, position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { padding: 20, backgroundColor: Colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.text, flex: 1, marginRight: 10 },
  vegBadge: { backgroundColor: Colors.success, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  price: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.primary, marginBottom: 16 },
  metaRow: { flexDirection: 'row', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginLeft: 6, fontWeight: Fonts.weights.medium },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.text, marginBottom: 8 },
  description: { fontSize: Fonts.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
  cookInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cookAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cookName: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text },
  cookRole: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: Colors.surface, padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: Colors.borderLight, alignItems: 'center', justifyContent: 'space-between' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 30, paddingHorizontal: 4, paddingVertical: 4 },
  quantityBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  quantityText: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.text, marginHorizontal: 16 },
  addToCartBtn: { flex: 1, marginLeft: 20, marginVertical: 0 },
});

export default CustomerFoodDetailScreen;

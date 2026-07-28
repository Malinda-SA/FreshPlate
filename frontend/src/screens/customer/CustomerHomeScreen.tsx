import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import foodService, { Food } from '../../api/services/foodService';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';
import { Config } from '../../constants/config';

const CustomerHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      const response = await foodService.getFoods(params);
      setFoods(response.data);
    } catch (error) {
      console.log('Error fetching foods:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFoods();
  };

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === category ? null : category)
      }
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const { state: cartState } = useCart();
  const totalCartItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);

  const renderFoodCard = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('FoodDetail', { foodId: item._id })}
    >
      <View style={styles.foodImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.foodImage} />
        ) : (
          <View style={styles.foodImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color={Colors.disabled} />
          </View>
        )}
        {item.isVegetarian && (
          <View style={styles.vegBadge}>
            <Ionicons name="leaf" size={12} color={Colors.white} />
          </View>
        )}
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.foodMeta}>
          <View style={styles.cookInfo}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.cookName} numberOfLines={1}>
              {item.cook?.kitchenName || item.cook?.name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.prepTime}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.prepTimeText}>{item.preparationTime}min</Text>
          </View>
        </View>
        <View style={styles.foodFooter}>
          <Text style={styles.foodPrice}>Rs. {item.price.toFixed(2)}</Text>
          {item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={Colors.accent} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen message="Finding delicious meals..." />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'there'}! 👋
            </Text>
            <Text style={styles.subGreeting}>What would you like to eat?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={36} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor={Colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchFoods}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {Config.FOOD_CATEGORIES.map(renderCategoryChip)}
        </ScrollView>
      </View>

      {/* Food List */}
      <FlatList
        data={foods}
        renderItem={renderFoodCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.foodList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.foodRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="fast-food-outline"
            title="No Food Available"
            message="Check back later for delicious home cooked meals!"
          />
        }
      />

      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <TouchableOpacity 
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart" size={24} color={Colors.white} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: Fonts.sizes['2xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  subGreeting: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: Fonts.sizes.base,
    color: Colors.text,
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  foodList: {
    padding: 12,
    paddingBottom: 100,
  },
  foodRow: {
    justifyContent: 'space-between',
  },
  foodCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  foodImageContainer: {
    height: 130,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  foodImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  foodMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cookName: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepTimeText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginLeft: 3,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default CustomerHomeScreen;

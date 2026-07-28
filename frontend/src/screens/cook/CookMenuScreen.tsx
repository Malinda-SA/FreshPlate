import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import foodService, { Food } from '../../api/services/foodService';
import { showAlert } from '../../utils/alert';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const CookMenuScreen = ({ navigation }: any) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFoods = useCallback(async () => {
    try {
      const response = await foodService.getMyFoods();
      setFoods(response.data);
    } catch (error) {
      console.log('Error fetching foods:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchFoods);
    return unsubscribe;
  }, [navigation, fetchFoods]);

  const toggleAvailability = async (food: Food) => {
    try {
      await foodService.updateFood(food._id, { isAvailable: !food.isAvailable });
      setFoods(
        foods.map((f) =>
          f._id === food._id ? { ...f, isAvailable: !f.isAvailable } : f
        )
      );
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update availability');
    }
  };

  const handleDelete = (food: Food) => {
    showAlert(
      'Delete Food',
      `Are you sure you want to delete "${food.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await foodService.deleteFood(food._id);
              setFoods(foods.filter((f) => f._id !== food._id));
            } catch (error: any) {
              showAlert('Error', error.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodHeader}>
        <View style={styles.foodTitleRow}>
          <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.foodPrice}>Rs. {item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.foodCategory}>{item.category}</Text>
      </View>
      <Text style={styles.foodDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.foodFooter}>
        <View style={styles.foodMeta}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{item.preparationTime} min</Text>
          {item.isVegetarian && (
            <View style={styles.vegTag}>
              <Ionicons name="leaf" size={10} color={Colors.success} />
              <Text style={styles.vegText}>Veg</Text>
            </View>
          )}
        </View>
        <View style={styles.foodActions}>
          <View style={styles.availabilityToggle}>
            <Text style={styles.toggleLabel}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <Switch
              value={item.isAvailable}
              onValueChange={() => toggleAvailability(item)}
              trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
              thumbColor={item.isAvailable ? Colors.primary : Colors.textLight}
            />
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Menu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFood')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={foods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchFoods(); }}
            colors={[Colors.secondary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-outline"
            title="No Food Items Yet"
            message="Start adding your delicious home cooked dishes!"
            action={
              <Button
                title="Add First Dish"
                onPress={() => navigation.navigate('AddFood')}
                variant="secondary"
                size="sm"
                fullWidth={false}
              />
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: 16, paddingBottom: 100 },
  foodCard: {
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
  foodHeader: { marginBottom: 8 },
  foodTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  foodPrice: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.secondary,
  },
  foodCategory: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  foodDescription: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  foodFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginRight: 12,
  },
  vegTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vegText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.success,
    marginLeft: 3,
    fontWeight: Fonts.weights.medium,
  },
  foodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CookMenuScreen;

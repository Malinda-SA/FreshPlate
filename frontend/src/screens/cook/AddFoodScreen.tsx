import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import foodService from '../../api/services/foodService';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';
import { Config } from '../../constants/config';

const AddFoodScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Food name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!price.trim() || isNaN(Number(price))) newErrors.price = 'Valid price is required';
    if (!category) newErrors.category = 'Category is required';
    if (!preparationTime.trim() || isNaN(Number(preparationTime)))
      newErrors.preparationTime = 'Valid preparation time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await foodService.createFood({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        preparationTime: parseInt(preparationTime),
        ingredients: ingredients.split(',').map((i) => i.trim()).filter(Boolean),
        isVegetarian,
        spiceLevel,
      });
      showAlert('Success', 'Food item added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to add food item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Dish</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Input label="Food Name" placeholder="e.g., Chicken Rice" icon="restaurant-outline" value={name} onChangeText={setName} error={errors.name} required />
        <Input label="Description" placeholder="Describe your dish..." icon="document-text-outline" value={description} onChangeText={setDescription} error={errors.description} multiline numberOfLines={3} required />
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input label="Price (Rs.)" placeholder="0.00" icon="cash-outline" value={price} onChangeText={setPrice} error={errors.price} keyboardType="decimal-pad" required />
          </View>
          <View style={styles.halfInput}>
            <Input label="Prep Time (min)" placeholder="30" icon="time-outline" value={preparationTime} onChangeText={setPreparationTime} error={errors.preparationTime} keyboardType="number-pad" required />
          </View>
        </View>

        {/* Category Selection */}
        <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {Config.FOOD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => { setCategory(cat); if (errors.category) setErrors({ ...errors, category: '' }); }}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Spice Level */}
        <Text style={styles.label}>Spice Level</Text>
        <View style={styles.spiceRow}>
          {Config.SPICE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.spiceChip, spiceLevel === level.value && styles.spiceChipActive]}
              onPress={() => setSpiceLevel(level.value)}
            >
              <Text style={[styles.spiceText, spiceLevel === level.value && styles.spiceTextActive]}>{level.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Ingredients" placeholder="Comma separated: rice, chicken, spices" icon="nutrition-outline" value={ingredients} onChangeText={setIngredients} />

        {/* Vegetarian Toggle */}
        <TouchableOpacity style={styles.vegToggle} onPress={() => setIsVegetarian(!isVegetarian)}>
          <Ionicons name={isVegetarian ? 'checkbox' : 'square-outline'} size={24} color={isVegetarian ? Colors.success : Colors.textLight} />
          <Text style={styles.vegLabel}>This is a vegetarian dish</Text>
        </TouchableOpacity>

        <Button title="Add Dish" onPress={handleSubmit} loading={loading} variant="secondary" style={styles.submitBtn} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },
  form: { padding: 20 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  label: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.medium, color: Colors.text, marginBottom: 8 },
  required: { color: Colors.error },
  errorText: { fontSize: Fonts.sizes.sm, color: Colors.error, marginBottom: 4 },
  categoryScroll: { marginBottom: 16 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  catChipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  catChipText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: Fonts.weights.medium },
  catChipTextActive: { color: Colors.white },
  spiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  spiceChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  spiceChipActive: { backgroundColor: '#FEF3C7', borderColor: Colors.warning },
  spiceText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  spiceTextActive: { color: Colors.warning, fontWeight: Fonts.weights.semibold },
  vegToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  vegLabel: { fontSize: Fonts.sizes.base, color: Colors.text, marginLeft: 10 },
  submitBtn: { marginTop: 8 },
});

export default AddFoodScreen;

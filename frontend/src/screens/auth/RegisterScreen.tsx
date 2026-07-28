import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

type Role = 'customer' | 'cook' | 'driver';

interface RoleOption {
  value: Role;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

const roles: RoleOption[] = [
  {
    value: 'customer',
    label: 'Customer',
    icon: 'person-outline',
    description: 'Order home cooked meals',
    color: Colors.customerAccent,
  },
  {
    value: 'cook',
    label: 'Home Cook',
    icon: 'restaurant-outline',
    description: 'Sell your home cooked food',
    color: Colors.cookAccent,
  },
  {
    value: 'driver',
    label: 'Delivery Driver',
    icon: 'bicycle-outline',
    description: 'Deliver food to customers',
    color: Colors.driverAccent,
  },
];

const RegisterScreen = ({ navigation }: any) => {
  const { signUp, clearError } = useAuth();
  const [step, setStep] = useState(1); // 1: Role, 2: Details
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Cook-specific
  const [kitchenName, setKitchenName] = useState('');

  // Driver-specific
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    if (selectedRole === 'cook' && !kitchenName.trim()) {
      newErrors.kitchenName = 'Kitchen name is required';
    }
    if (selectedRole === 'driver') {
      if (!vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
      if (!vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    clearError();

    try {
      await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role: selectedRole,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: '',
          zip: '',
        },
        ...(selectedRole === 'cook' ? { kitchenName: kitchenName.trim() } : {}),
        ...(selectedRole === 'driver'
          ? {
              vehicleType: vehicleType.trim(),
              vehicleNumber: vehicleNumber.trim(),
            }
          : {}),
      });
    } catch (err: any) {
      showAlert('Registration Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>I want to join as a...</Text>
      <Text style={styles.stepSubtitle}>Select your role to get started</Text>

      {roles.map((role) => (
        <TouchableOpacity
          key={role.value}
          style={[
            styles.roleCard,
            selectedRole === role.value && {
              borderColor: role.color,
              backgroundColor: `${role.color}08`,
            },
          ]}
          onPress={() => setSelectedRole(role.value)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.roleIconContainer,
              {
                backgroundColor:
                  selectedRole === role.value ? role.color : Colors.borderLight,
              },
            ]}
          >
            <Ionicons
              name={role.icon}
              size={28}
              color={selectedRole === role.value ? Colors.white : Colors.textLight}
            />
          </View>
          <View style={styles.roleInfo}>
            <Text
              style={[
                styles.roleLabel,
                selectedRole === role.value && { color: role.color },
              ]}
            >
              {role.label}
            </Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedRole === role.value && { borderColor: role.color },
            ]}
          >
            {selectedRole === role.value && (
              <View style={[styles.radioInner, { backgroundColor: role.color }]} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      {(selectedRole === 'cook' || selectedRole === 'driver') && (
        <View style={styles.approvalNotice}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
          <Text style={styles.approvalText}>
            {selectedRole === 'cook'
              ? 'Cook accounts require admin approval before you can start selling.'
              : 'Driver accounts require admin approval before you can start delivering.'}
          </Text>
        </View>
      )}

      <Button
        title="Continue"
        onPress={() => setStep(2)}
        style={styles.continueButton}
      />
    </View>
  );

  const renderDetailsForm = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Create Your Account</Text>
      <Text style={styles.stepSubtitle}>
        Registering as{' '}
        <Text style={styles.roleHighlight}>
          {roles.find((r) => r.value === selectedRole)?.label}
        </Text>
      </Text>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        icon="person-outline"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors({ ...errors, name: '' });
        }}
        error={errors.name}
        required
      />

      <Input
        label="Email"
        placeholder="Enter your email"
        icon="mail-outline"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        icon="call-outline"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          if (errors.phone) setErrors({ ...errors, phone: '' });
        }}
        error={errors.phone}
        keyboardType="phone-pad"
        required
      />

      <Input
        label="Password"
        placeholder="Create a password (min 6 characters)"
        icon="lock-closed-outline"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: '' });
        }}
        error={errors.password}
        secureTextEntry
        required
      />

      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        icon="lock-closed-outline"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
        }}
        error={errors.confirmPassword}
        secureTextEntry
        required
      />

      {/* Address fields */}
      <Input
        label="Street Address"
        placeholder="Enter your street address"
        icon="location-outline"
        value={street}
        onChangeText={setStreet}
      />

      <Input
        label="City"
        placeholder="Enter your city"
        icon="business-outline"
        value={city}
        onChangeText={setCity}
      />

      {/* Cook-specific fields */}
      {selectedRole === 'cook' && (
        <Input
          label="Kitchen Name"
          placeholder="Name of your kitchen / brand"
          icon="storefront-outline"
          value={kitchenName}
          onChangeText={(text) => {
            setKitchenName(text);
            if (errors.kitchenName) setErrors({ ...errors, kitchenName: '' });
          }}
          error={errors.kitchenName}
          required
        />
      )}

      {/* Driver-specific fields */}
      {selectedRole === 'driver' && (
        <>
          <Input
            label="Vehicle Type"
            placeholder="e.g., Motorcycle, Car, Bicycle"
            icon="car-outline"
            value={vehicleType}
            onChangeText={(text) => {
              setVehicleType(text);
              if (errors.vehicleType) setErrors({ ...errors, vehicleType: '' });
            }}
            error={errors.vehicleType}
            required
          />
          <Input
            label="Vehicle Number"
            placeholder="Enter vehicle registration number"
            icon="document-text-outline"
            value={vehicleNumber}
            onChangeText={(text) => {
              setVehicleNumber(text);
              if (errors.vehicleNumber) setErrors({ ...errors, vehicleNumber: '' });
            }}
            error={errors.vehicleNumber}
            required
          />
        </>
      )}

      <Button
        title="Create Account"
        onPress={handleRegister}
        loading={loading}
        style={styles.registerButton}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FreshPlate</Text>
          <Text style={styles.headerSubtitle}>Join our community</Text>
        </View>

        {step === 1 ? renderRoleSelection() : renderDetailsForm()}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: Fonts.sizes['3xl'],
    fontWeight: Fonts.weights.extrabold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: Fonts.sizes['2xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  roleHighlight: {
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  roleDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  approvalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  approvalText: {
    flex: 1,
    marginLeft: 10,
    fontSize: Fonts.sizes.sm,
    color: Colors.info,
    lineHeight: 20,
  },
  continueButton: {
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: Fonts.sizes.base,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: Fonts.weights.medium,
  },
  registerButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  loginText: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
});

export default RegisterScreen;

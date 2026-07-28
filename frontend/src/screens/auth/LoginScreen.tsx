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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const LoginScreen = ({ navigation }: any) => {
  const { signIn, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    clearError();
    setLoginError(null);

    try {
      await signIn({ email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password';
      setLoginError(msg);
      if (Platform.OS !== 'web') {
        showAlert('Login Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.logoContainer}>
            <Ionicons name="restaurant" size={48} color={Colors.white} />
          </View>
          <Text style={styles.appName}>FreshPlate</Text>
          <Text style={styles.tagline}>Home cooked meals, delivered fresh</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitleText}>Sign in to your account</Text>

          {(loginError || error) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
              <Text style={styles.errorBannerText}>{loginError || error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            icon="mail-outline"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            secureTextEntry
            required
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 80,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: Fonts.sizes['4xl'],
    fontWeight: Fonts.weights.extrabold,
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: Fonts.sizes['2xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
});

export default LoginScreen;

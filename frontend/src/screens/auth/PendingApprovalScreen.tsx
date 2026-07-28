import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const PendingApprovalScreen = () => {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Clock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="hourglass-outline" size={56} color={Colors.warning} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Pending Approval</Text>
        <Text style={styles.message}>
          Hi {user?.name || 'there'}! Your{' '}
          <Text style={styles.roleText}>{user?.role}</Text> account has been
          created successfully.
        </Text>
        <Text style={styles.message}>
          An admin will review and approve your account shortly. You'll be able
          to access all features once approved.
        </Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            <Text style={styles.statusText}>Account Created</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusRow}>
            <Ionicons name="time-outline" size={22} color={Colors.warning} />
            <Text style={styles.statusText}>Awaiting Admin Approval</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusRow}>
            <Ionicons name="ellipse-outline" size={22} color={Colors.disabled} />
            <Text style={[styles.statusText, { color: Colors.disabled }]}>
              Access Granted
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            This usually takes 24-48 hours. You'll receive a notification once
            your account is approved.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Sign Out"
          onPress={signOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Fonts.sizes['3xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  roleText: {
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  statusCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    marginLeft: 12,
    fontWeight: Fonts.weights.medium,
  },
  statusDivider: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 10,
    marginVertical: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: Fonts.sizes.sm,
    color: Colors.info,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  signOutButton: {
    marginTop: 16,
  },
});

export default PendingApprovalScreen;

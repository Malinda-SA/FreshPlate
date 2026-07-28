import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { showConfirmAlert } from '../../utils/alert';
import Card from '../../components/Card';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const DriverProfileScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    showConfirmAlert('Sign Out', 'Are you sure you want to sign out?', signOut);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="car" size={40} color={Colors.white} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.vehicle}>{user?.vehicleType || 'Vehicle'} • {user?.vehicleNumber || 'N/A'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Delivery Driver</Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>{user?.phone || 'Not set'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            {user?.address?.street ? `${user.address.street}, ${user.address.city}` : 'No address set'}
          </Text>
        </View>
      </Card>

      <View style={styles.menuContainer}>
        {[
          { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => {} },
          { icon: 'car-outline' as const, label: 'Vehicle Details', onPress: () => {} },
          { icon: 'wallet-outline' as const, label: 'Earnings History', onPress: () => navigation.navigate('Earnings') },
          { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => {} },
          { icon: 'help-circle-outline' as const, label: 'Help & Support', onPress: () => {} },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={Colors.info} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>FreshPlate v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.info, paddingTop: 60, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.white },
  vehicle: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  roleText: { color: Colors.white, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold },
  infoCard: { marginHorizontal: 20, marginTop: -16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  infoText: { fontSize: Fonts.sizes.md, color: Colors.text, marginLeft: 12, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
  menuContainer: { marginTop: 16, marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: Fonts.sizes.base, color: Colors.text, fontWeight: Fonts.weights.medium },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.error, backgroundColor: '#FEF2F2' },
  logoutText: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold, color: Colors.error, marginLeft: 8 },
  version: { textAlign: 'center', fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 20, marginBottom: 100 },
});

export default DriverProfileScreen;

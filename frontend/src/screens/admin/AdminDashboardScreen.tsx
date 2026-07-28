import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminService from '../../api/services/adminService';
import Card from '../../components/Card';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const AdminDashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) { console.log('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchStats);
    return unsub;
  }, [navigation, fetchStats]);

  const statItems = [
    { icon: 'people-outline', label: 'Total Users', value: stats?.totalUsers || 0, color: '#3B82F6', bg: '#DBEAFE' },
    { icon: 'person-outline', label: 'Customers', value: stats?.totalCustomers || 0, color: Colors.primary, bg: Colors.primarySoft },
    { icon: 'restaurant-outline', label: 'Cooks', value: stats?.totalCooks || 0, color: Colors.secondary, bg: '#FFF7ED' },
    { icon: 'car-outline', label: 'Drivers', value: stats?.totalDrivers || 0, color: '#3B82F6', bg: '#DBEAFE' },
    { icon: 'receipt-outline', label: 'Total Orders', value: stats?.totalOrders || 0, color: '#7C3AED', bg: '#EDE9FE' },
    { icon: 'flame-outline', label: 'Active Orders', value: stats?.activeOrders || 0, color: Colors.warning, bg: '#FEF3C7' },
    { icon: 'fast-food-outline', label: 'Food Items', value: stats?.totalFoods || 0, color: '#EC4899', bg: '#FCE7F3' },
    { icon: 'cash-outline', label: 'Revenue', value: `Rs. ${(stats?.totalRevenue || 0).toFixed(0)}`, color: Colors.success, bg: '#D1FAE5' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} colors={['#7C3AED']} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>FreshPlate Management</Text>
      </View>

      {/* Pending Approvals Alert */}
      {stats?.pendingApprovals > 0 && (
        <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Approvals')}>
          <View style={styles.alertIcon}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{stats.pendingApprovals} Pending Approvals</Text>
            <Text style={styles.alertText}>Cooks and drivers awaiting your approval</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            <Text style={[styles.statValue, { color: item.color }]}>
              {typeof item.value === 'number' ? item.value : item.value}
            </Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        {[
          { icon: 'checkmark-circle-outline', label: 'Approve Users', screen: 'Approvals', color: Colors.success },
          { icon: 'people-outline', label: 'Manage Users', screen: 'Users', color: '#3B82F6' },
          { icon: 'receipt-outline', label: 'All Orders', screen: 'AdminOrders', color: '#7C3AED' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.quickItem} onPress={() => navigation.navigate(item.screen)}>
            <View style={[styles.quickIcon, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={styles.quickLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#7C3AED', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.white },
  subtitle: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FDE68A' },
  alertIcon: { marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold, color: Colors.text },
  alertText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 10 },
  statCard: { width: '47%', padding: 16, borderRadius: 16, alignItems: 'center' },
  statValue: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.extrabold, marginTop: 6 },
  statLabel: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2, fontWeight: Fonts.weights.medium },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.text, marginBottom: 12 },
  quickItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 14, borderRadius: 12, marginBottom: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  quickIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  quickLabel: { flex: 1, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.medium, color: Colors.text },
});

export default AdminDashboardScreen;

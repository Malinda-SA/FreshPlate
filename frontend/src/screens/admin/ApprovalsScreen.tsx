import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { showAlert, showConfirmAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import adminService from '../../api/services/adminService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const ApprovalsScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const response = await adminService.getPendingUsers();
      setUsers(response.data || []);
    } catch (error) { console.log('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchPending);
    return unsub;
  }, [navigation, fetchPending]);

  const handleApprove = (user: any) => {
    showAlert('Approve User', `Approve ${user.name} as ${user.role}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', onPress: async () => {
          try {
            await adminService.approveUser(user._id);
            showAlert('Success', `${user.name} has been approved!`);
            fetchPending();
          } catch (error: any) { showAlert('Error', error.message); }
        },
      },
    ]);
  };

  const handleReject = (user: any) => {
    showAlert('Reject User', `Reject ${user.name}'s registration?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive', onPress: async () => {
          try {
            await adminService.rejectUser(user._id);
            showAlert('Done', `${user.name}'s registration has been rejected.`);
            fetchPending();
          } catch (error: any) { showAlert('Error', error.message); }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: item.role === 'cook' ? '#FFF7ED' : '#DBEAFE' }]}>
          <Ionicons
            name={item.role === 'cook' ? 'restaurant-outline' : 'car-outline'}
            size={24}
            color={item.role === 'cook' ? Colors.secondary : Colors.info}
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <StatusBadge status={item.role} size="sm" />
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>Applied: {formatDate(item.createdAt)}</Text>
        </View>
        {item.role === 'cook' && item.kitchenName && (
          <View style={styles.detailItem}>
            <Ionicons name="storefront-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Kitchen: {item.kitchenName}</Text>
          </View>
        )}
        {item.role === 'driver' && (
          <>
            {item.vehicleType && (
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{item.vehicleType} — {item.vehicleNumber}</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
          <Ionicons name="close" size={18} color={Colors.error} />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item)}>
          <Ionicons name="checkmark" size={18} color={Colors.white} />
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Pending Approvals</Text></View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPending(); }} colors={['#7C3AED']} />}
        ListEmptyComponent={<EmptyState icon="checkmark-done-circle-outline" title="All Caught Up!" message="No pending approvals at the moment" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: Colors.surface },
  title: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.text },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text },
  userEmail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  detailsGrid: { backgroundColor: Colors.borderLight, borderRadius: 10, padding: 10, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginLeft: 8 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  rejectText: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semibold, color: Colors.error, marginLeft: 6 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.success },
  approveText: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semibold, color: Colors.white, marginLeft: 6 },
});

export default ApprovalsScreen;

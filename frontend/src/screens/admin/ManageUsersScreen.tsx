import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { showAlert, showConfirmAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import adminService from '../../api/services/adminService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';

const ManageUsersScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedRole) params.role = selectedRole;
      const response = await adminService.getAllUsers(params);
      setUsers(response.data || []);
    } catch (error) { console.log('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, selectedRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (user: any) => {
    try {
      await adminService.deactivateUser(user._id);
      fetchUsers();
    } catch (error: any) { showAlert('Error', error.message); }
  };

  const roles = [
    { value: null, label: 'All' },
    { value: 'customer', label: 'Customers' },
    { value: 'cook', label: 'Cooks' },
    { value: 'driver', label: 'Drivers' },
  ];

  const renderUser = ({ item }: { item: any }) => (
    <View style={[styles.card, !item.isActive && styles.cardInactive]}>
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
        </View>
        <View style={styles.userMeta}>
          <StatusBadge status={item.role} size="sm" />
          <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.error }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      {item.role !== 'admin' && (
        <TouchableOpacity
          style={[styles.toggleBtn, item.isActive ? styles.deactivateBtn : styles.activateBtn]}
          onPress={() => handleToggle(item)}
        >
          <Text style={[styles.toggleText, { color: item.isActive ? Colors.error : Colors.success }]}>
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Manage Users</Text></View>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textLight} />
        <TextInput style={styles.searchInput} placeholder="Search users..." placeholderTextColor={Colors.placeholder} value={search} onChangeText={setSearch} onSubmitEditing={fetchUsers} returnKeyType="search" />
      </View>
      <View style={styles.filters}>
        {roles.map((r) => (
          <TouchableOpacity key={r.label} style={[styles.filterChip, selectedRole === r.value && styles.filterChipActive]} onPress={() => setSelectedRole(r.value)}>
            <Text style={[styles.filterText, selectedRole === r.value && styles.filterTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={['#7C3AED']} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No Users Found" message="Try a different search or filter" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: Colors.surface },
  title: { fontSize: Fonts.sizes['2xl'], fontWeight: Fonts.weights.bold, color: Colors.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: 8, borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, marginLeft: 10, fontSize: Fonts.sizes.md, color: Colors.text },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: Fonts.weights.medium },
  filterTextActive: { color: Colors.white },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  cardInactive: { opacity: 0.6 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between' },
  userInfo: { flex: 1 },
  userName: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text },
  userEmail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 1 },
  userPhone: { fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 1 },
  userMeta: { alignItems: 'flex-end' },
  statusText: { fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.medium, marginTop: 4 },
  toggleBtn: { marginTop: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  deactivateBtn: { backgroundColor: '#FEF2F2' },
  activateBtn: { backgroundColor: '#D1FAE5' },
  toggleText: { fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold },
});

export default ManageUsersScreen;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import Fonts from '../constants/fonts';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const getStatusStyle = (status: string) => {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    // Order statuses
    pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
    confirmed: { bg: '#DBEAFE', text: '#2563EB', label: 'Confirmed' },
    preparing: { bg: '#EDE9FE', text: '#7C3AED', label: 'Preparing' },
    ready: { bg: '#D1FAE5', text: '#059669', label: 'Ready' },
    picked_up: { bg: '#CFFAFE', text: '#0891B2', label: 'On the Way' },
    delivered: { bg: '#D1FAE5', text: '#047857', label: 'Delivered' },
    cancelled: { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' },
    // Payment statuses
    paid: { bg: '#D1FAE5', text: '#047857', label: 'Paid' },
    refunded: { bg: '#FEF3C7', text: '#D97706', label: 'Refunded' },
    // Approval statuses
    approved: { bg: '#D1FAE5', text: '#047857', label: 'Approved' },
    rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' },
    // Availability
    available: { bg: '#D1FAE5', text: '#047857', label: 'Available' },
    unavailable: { bg: '#F3F4F6', text: '#6B7280', label: 'Unavailable' },
    // User roles
    customer: { bg: '#D1FAE5', text: '#047857', label: 'Customer' },
    cook: { bg: '#FFF7ED', text: '#EA580C', label: 'Cook' },
    driver: { bg: '#DBEAFE', text: '#2563EB', label: 'Driver' },
    admin: { bg: '#EDE9FE', text: '#7C3AED', label: 'Admin' },
  };

  return statusMap[status] || { bg: '#F3F4F6', text: '#6B7280', label: status };
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusStyle = getStatusStyle(status);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: statusStyle.bg },
        size === 'sm' ? styles.badgeSm : {},
      ]}
    >
      <View style={[styles.dot, { backgroundColor: statusStyle.text }]} />
      <Text
        style={[
          styles.text,
          { color: statusStyle.text },
          size === 'sm' ? styles.textSm : {},
        ]}
      >
        {statusStyle.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
  },
  textSm: {
    fontSize: Fonts.sizes.xs,
  },
});

export default StatusBadge;

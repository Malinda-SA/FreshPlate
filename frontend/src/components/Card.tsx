import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../constants/colors';
import Fonts from '../constants/fonts';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ children, style, title, subtitle }) => {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default Card;

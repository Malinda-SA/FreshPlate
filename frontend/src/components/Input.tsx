import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Fonts from '../constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  containerStyle,
  required = false,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}{required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? Colors.primary : Colors.textLight}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon ? { paddingLeft: 0 } : {}]}
          placeholderTextColor={Colors.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.error,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: Fonts.sizes.base,
    color: Colors.text,
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    fontSize: Fonts.sizes.sm,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;

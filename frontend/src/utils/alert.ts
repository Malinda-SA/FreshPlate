import { Platform, Alert } from 'react-native';

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
};

export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const msg = `${title}${message ? '\n\n' + message : ''}`;
      const primaryBtn = buttons.find(b => b.style !== 'cancel') || buttons[1];
      if (window.confirm(`${msg}\n\nPress OK to: ${primaryBtn.text}`)) {
        if (primaryBtn.onPress) primaryBtn.onPress();
      } else {
        const cancelBtn = buttons.find(b => b.style === 'cancel');
        if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
      }
    } else {
      window.alert(`${title}${message ? '\n\n' + message : ''}`);
      if (buttons && buttons[0] && buttons[0].onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

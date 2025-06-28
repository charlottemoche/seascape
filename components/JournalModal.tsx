import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useColorScheme,
} from 'react-native';
import { Button } from './Themed';
import { JournalModalProps } from '@/types/Journal';
import Colors from '@/constants/Colors';

const { height: screenHeight } = Dimensions.get('window');

export default function JournalModal({ visible, onClose, text, onChangeText }: JournalModalProps) {
  const colorScheme = useColorScheme();
  
  const containerColor = colorScheme === 'dark' ? Colors.custom.dark : Colors.light.background;
  const inputColor = colorScheme === 'dark' ? Colors.dark.input : Colors.light.input;
  const modalOverlayColor = colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)';
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        onClose();
      }}>
        <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.modalContent, { backgroundColor: containerColor }]}>
          <Text style={[styles.title, { color: textColor }]}>Write Your Journal Entry</Text>
          <TextInput
            testID="journal-modal-input"
            style={[styles.textInput, { backgroundColor: inputColor, borderColor: greyBorder, color: textColor }]}
            multiline
            placeholder="Write your thoughts here..."
            placeholderTextColor="#888"
            value={text}
            onChangeText={onChangeText}
            autoFocus
          />
          <Button onPress={onClose} title="Save & close" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  modalContent: {
    height: screenHeight / 3,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
    minHeight: 100,
    width: '100%',
  },
});
import React from 'react';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  Image,
  useColorScheme,
} from 'react-native';
import { Button, Input, Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import fishImages, { FishColor } from '@/constants/fishMap';

type Props = {
  visible: boolean;
  initialText: string;
  initialColor: FishColor;
  availableColors: FishColor[];
  saving: boolean;
  onSave: (name: string, color: FishColor) => void;
  onCancel: () => void;
};

export default function FishModal({
  visible,
  initialText,
  initialColor,
  availableColors,
  saving,
  onSave,
  onCancel,
}: Props) {
  const colorScheme = useColorScheme();
  const containerColor =
    colorScheme === 'dark' ? Colors.custom.dark : Colors.custom.white;
  const modalOverlayColor =
    colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.3)';
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  const [localName, setLocalName] = useState(initialText);
  const [localColor, setLocalColor] = useState<FishColor>(initialColor);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>

      <Pressable
        style={[styles.backdrop, { backgroundColor: modalOverlayColor }]}
        onPress={() => {
          onCancel();
          Keyboard.dismiss();
        }}
      >

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modalContent, { backgroundColor: containerColor }]}>

              <Text style={[styles.title, { color: textColor }]}>Customize Your Fish</Text>

              <View style={styles.colorRow}>
                {availableColors.map(c => (
                  <Pressable key={c} onPress={() => setLocalColor(c)}>
                    <Image
                      source={fishImages[c]}
                      style={[
                        styles.smallFish,
                        localColor === c && styles.selectedFish,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>

              <Input
                value={localName}
                onChangeText={setLocalName}
                placeholder="Fin"
                placeholderTextColor="#888"
                autoFocus
                style={{
                  backgroundColor: containerColor,
                  borderColor: greyBorder,
                  color: textColor,
                }}
              />

              <View style={styles.btnRow}>
                <Button title="Cancel" onPress={onCancel} variant="secondary" />
                <Button
                  title={saving ? 'Saving…' : 'Save'}
                  onPress={() => onSave(localName, localColor)}
                  loading={saving}
                  disabled={saving}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    top: '20%',
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 18,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 500,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  smallFish: {
    width: 32,
    height: 32,
  },
  selectedFish: {
    borderBottomColor: '#808080',
    borderBottomWidth: 2,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
});
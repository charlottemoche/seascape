import React from 'react';
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
  text: string;
  onChangeText: (s: string) => void;
  fishColor: FishColor;
  setFishColor: (c: FishColor) => void;
  availableColors: FishColor[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export default function FishModal({
  visible,
  text,
  onChangeText,
  fishColor,
  setFishColor,
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
  const greyBorder = colorScheme === 'dark' ? '#292828' : Colors.custom.grey;
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>

      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onCancel();
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.modalContent, { backgroundColor: containerColor }]}>

          <Text style={[styles.title, { color: textColor }]}>Customize Your Fish</Text>

          <View style={styles.colorRow}>
            {availableColors.map(c => (
              <Pressable key={c} onPress={() => setFishColor(c)}>
                <Image
                  source={fishImages[c]}
                  style={[
                    styles.smallFish,
                    fishColor === c && styles.selectedFish,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <Input
            value={text}
            onChangeText={onChangeText}
            placeholder="Finny"
            placeholderTextColor="#888"
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
              onPress={onSave}
              loading={saving}
              disabled={saving}
            />
          </View>
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
    top: '20%',
    width: '100%',
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
    flex: 1,
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
    fontWeight: '600',
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
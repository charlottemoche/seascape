import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-get-random-values';
import Constants from 'expo-constants';

// As Expo's SecureStore does not support values larger than 2048
// bytes, an AES-256 key is generated and stored in SecureStore, while
// it is used to encrypt/decrypt values stored in AsyncStorage.
class LargeSecureStore {
  private encryptionKeyPromise: Promise<Uint8Array> | null = null;

  private async getEncryptionKey(): Promise<Uint8Array> {
    if (this.encryptionKeyPromise) return this.encryptionKeyPromise;

    this.encryptionKeyPromise = (async () => {
      const savedKeyHex = await SecureStore.getItemAsync('supabase_encryption_key');
      if (savedKeyHex) {
        return aesjs.utils.hex.toBytes(savedKeyHex);
      } else {
        const newKey = crypto.getRandomValues(new Uint8Array(256 / 8));
        await SecureStore.setItemAsync('supabase_encryption_key', aesjs.utils.hex.fromBytes(newKey));
        return newKey;
      }
    })();

    return this.encryptionKeyPromise;
  }

  private async _encrypt(_key: string, value: string) {
    const encryptionKey = await this.getEncryptionKey();

    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(_key: string, value: string) {
    const encryptionKey = await this.getEncryptionKey();

    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) { return encrypted; }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    // don't delete the encryption key here! Keep it persistent.
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl!;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { supabase }
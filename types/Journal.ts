export type JournalEntryRaw = {
  created_at: string;
  feeling: string;
};

export type JournalEntryDecrypted = {
  created_at: string;
  feeling: string[];
};

export type JournalModalProps = {
  visible: boolean;
  onClose: () => void;
  text: string;
  onChangeText: (text: string) => void;
};
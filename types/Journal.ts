export type JournalEntryRaw = {
  created_at: string;
  feeling: string;
};

export type JournalEntryDecrypted = {
  created_at: string;
  feeling: string[];
};

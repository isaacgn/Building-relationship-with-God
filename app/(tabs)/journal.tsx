import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type JournalEntry = {
  id: string;
  date: string;
  gratitude: string;
  prayer: string;
  verse: string;
  reflection: string;
  answeredPrayer: string;
};

const JOURNAL_ENTRIES_KEY = "@relationship_with_god/journal_entries";

function getLocalDateKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function JournalScreen() {
  const [gratitude, setGratitude] = useState("");
  const [prayer, setPrayer] = useState("");
  const [verse, setVerse] = useState("");
  const [reflection, setReflection] = useState("");
  const [answeredPrayer, setAnsweredPrayer] = useState("");

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const savedValue = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);

      if (!savedValue) {
        setEntries([]);
        return;
      }

      setEntries(JSON.parse(savedValue) as JournalEntry[]);
    } catch (error) {
      console.error("Could not load journal entries:", error);
      Alert.alert(
        "Could not load journal",
        "Your saved journal entries could not be loaded."
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  function clearForm() {
    setGratitude("");
    setPrayer("");
    setVerse("");
    setReflection("");
    setAnsweredPrayer("");
  }

  async function handleSaveEntry() {
    const hasContent =
      gratitude.trim() ||
      prayer.trim() ||
      verse.trim() ||
      reflection.trim() ||
      answeredPrayer.trim();

    if (!hasContent) {
      Alert.alert(
        "Add a journal entry",
        "Write something in at least one field before saving."
      );
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: getLocalDateKey(),
      gratitude: gratitude.trim(),
      prayer: prayer.trim(),
      verse: verse.trim(),
      reflection: reflection.trim(),
      answeredPrayer: answeredPrayer.trim(),
    };

    try {
      setIsSaving(true);

      const updatedEntries = [entry, ...entries];

      await AsyncStorage.setItem(
        JOURNAL_ENTRIES_KEY,
        JSON.stringify(updatedEntries)
      );

      setEntries(updatedEntries);
      clearForm();

      Alert.alert("Saved", "Your journal entry has been saved.");
    } catch (error) {
      console.error("Could not save journal entry:", error);

      Alert.alert(
        "Could not save entry",
        "Please try again. Your entry has not been saved yet."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Journal</Text>

        <Text style={styles.subtitle}>
          Record gratitude, prayer, Scripture, and reflections from your day.
        </Text>

        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{getLocalDateKey()}</Text>
        </View>

        <Text style={styles.label}>Gratitude</Text>
        <TextInput
          value={gratitude}
          onChangeText={setGratitude}
          placeholder="What are you thankful for today?"
          placeholderTextColor="#7A877B"
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={styles.label}>Prayer</Text>
        <TextInput
          value={prayer}
          onChangeText={setPrayer}
          placeholder="What would you like to pray about?"
          placeholderTextColor="#7A877B"
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={styles.label}>Scripture or verse</Text>
        <TextInput
          value={verse}
          onChangeText={setVerse}
          placeholder="Example: Psalm 23:1"
          placeholderTextColor="#7A877B"
          style={styles.input}
          autoCapitalize="sentences"
        />

        <Text style={styles.label}>Reflection</Text>
        <TextInput
          value={reflection}
          onChangeText={setReflection}
          placeholder="What did you learn, notice, or want to remember?"
          placeholderTextColor="#7A877B"
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={styles.label}>Answered prayer (optional)</Text>
        <TextInput
          value={answeredPrayer}
          onChangeText={setAnsweredPrayer}
          placeholder="Record an answered prayer or encouragement."
          placeholderTextColor="#7A877B"
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Pressable
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSaveEntry}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Journal Entry"}
          </Text>
        </Pressable>

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent Entries</Text>
          <Text style={styles.entryCount}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No journal entries yet. Your saved entries will appear here.
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <Text style={styles.entryDate}>{entry.date}</Text>

              {entry.gratitude ? (
                <View style={styles.entrySection}>
                  <Text style={styles.entryLabel}>Gratitude</Text>
                  <Text style={styles.entryText}>{entry.gratitude}</Text>
                </View>
              ) : null}

              {entry.prayer ? (
                <View style={styles.entrySection}>
                  <Text style={styles.entryLabel}>Prayer</Text>
                  <Text style={styles.entryText}>{entry.prayer}</Text>
                </View>
              ) : null}

              {entry.verse ? (
                <View style={styles.entrySection}>
                  <Text style={styles.entryLabel}>Scripture</Text>
                  <Text style={styles.entryText}>{entry.verse}</Text>
                </View>
              ) : null}

              {entry.reflection ? (
                <View style={styles.entrySection}>
                  <Text style={styles.entryLabel}>Reflection</Text>
                  <Text style={styles.entryText}>{entry.reflection}</Text>
                </View>
              ) : null}

              {entry.answeredPrayer ? (
                <View style={styles.entrySection}>
                  <Text style={styles.entryLabel}>Answered Prayer</Text>
                  <Text style={styles.entryText}>
                    {entry.answeredPrayer}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F3B2C",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5A6757",
    marginBottom: 4,
  },
  dateBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E5F0E6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  dateBadgeText: {
    color: "#2F6B45",
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    color: "#1F3B2C",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  input: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD7CD",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1F3B2C",
    fontSize: 16,
  },
  textArea: {
    minHeight: 104,
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD7CD",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1F3B2C",
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#2F6B45",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
  },
  historyTitle: {
    color: "#1F3B2C",
    fontSize: 21,
    fontWeight: "700",
  },
  entryCount: {
    color: "#667368",
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 18,
  },
  emptyText: {
    color: "#5A6757",
    fontSize: 15,
    lineHeight: 22,
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  entryDate: {
    color: "#2F6B45",
    fontSize: 13,
    fontWeight: "700",
  },
  entrySection: {
    gap: 4,
  },
  entryLabel: {
    color: "#3D5943",
    fontSize: 13,
    fontWeight: "700",
  },
  entryText: {
    color: "#3F4D42",
    fontSize: 15,
    lineHeight: 22,
  },
});
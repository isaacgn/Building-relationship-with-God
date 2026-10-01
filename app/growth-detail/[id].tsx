import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { growthAreas } from "@/data/growthAreas";
import {
  getTodayKey,
  isCompletedToday,
  toggleCompletion,
} from "@/services/storage";

export default function GrowthDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const area = growthAreas.find((item) => item.id === id);

  useEffect(() => {
    async function loadCompletionStatus() {
      if (!area) {
        return;
      }

      try {
        const savedStatus = await isCompletedToday(area.id);
        setCompleted(savedStatus);
      } catch (error) {
        console.error("Could not load completion status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompletionStatus();
  }, [area]);

  async function handleCompletionPress() {
    if (!area || isLoading) {
      return;
    }

    try {
      const updatedCompletions = await toggleCompletion(area.id);

      const today = getTodayKey();
      const completedToday = updatedCompletions[today] ?? [];

      setCompleted(completedToday.includes(area.id));
    } catch (error) {
      console.error("Could not update completion status:", error);
    }
  }

  if (!area) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Growth area not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.category}>{area.category.toUpperCase()}</Text>

      <Text style={styles.title}>{area.title}</Text>

      <Text style={styles.description}>{area.description}</Text>

      <View style={styles.promptBox}>
        <Text style={styles.promptTitle}>Today’s reflection</Text>
        <Text style={styles.prompt}>{area.prompt}</Text>
      </View>

      <Pressable
        style={[styles.button, completed && styles.completedButton]}
        onPress={handleCompletionPress}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading
            ? "Loading..."
            : completed
              ? "Completed today — tap to undo"
              : "Complete for today"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    backgroundColor: "#F7F8F5",
  },
  category: {
    color: "#4E7454",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F3B2C",
  },
  description: {
    fontSize: 16,
    color: "#4E5B50",
    lineHeight: 24,
  },
  promptBox: {
    backgroundColor: "#E5F0E6",
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  promptTitle: {
    fontWeight: "700",
    color: "#1F3B2C",
  },
  prompt: {
    fontSize: 16,
    lineHeight: 24,
    color: "#304936",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2F6B45",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  completedButton: {
    backgroundColor: "#6B7C70",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
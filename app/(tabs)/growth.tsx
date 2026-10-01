import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import GrowthCard from "@/components/GrowthCard";
import { growthAreas } from "@/data/growthAreas";
import { CompletionMap, getCompletions, getTodayKey } from "@/services/storage";

export default function GrowthScreen() {
  const router = useRouter();

  const [completions, setCompletions] = useState<CompletionMap>({});

  useFocusEffect(
    useCallback(() => {
      async function loadCompletions() {
        const savedCompletions = await getCompletions();
        setCompletions(savedCompletions);
      }

      loadCompletions();
    }, [])
  );

  const completedToday = completions[getTodayKey()] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Growth Areas</Text>

      <Text style={styles.subtitle}>
        Choose an area for reflection, prayer, and daily practice.
      </Text>

      {growthAreas.map((area) => (
        <GrowthCard
          key={area.id}
          area={area}
          completed={completedToday.includes(area.id)}
          onPress={() => router.push(`/growth-detail/${area.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    backgroundColor: "#F7F8F5",
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
    marginBottom: 8,
  },
});
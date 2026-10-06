import { Pressable, StyleSheet, Text, View } from "react-native";
import { GrowthArea } from "@/types/growth";
import { useLanguage } from "@/context/LanguageContext";

type GrowthCardProps = {
  area: GrowthArea;
  completed?: boolean;
  onPress: () => void;
};

export default function GrowthCard({
  area,
  completed = false,
  onPress,
}: GrowthCardProps) {
  const { t } = useLanguage();

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{area.title}</Text>
        <Text style={styles.status}>
          {completed ? t("Completed") : t("Open")}
        </Text>
      </View>

      <Text style={styles.description}>{area.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E9E1",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#1F3B2C",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F6B45",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5A6757",
  },
});
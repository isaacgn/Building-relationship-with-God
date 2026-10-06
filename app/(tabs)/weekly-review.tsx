import { StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

export default function WeeklyReviewScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("Weekly Review")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8F5",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F3B2C",
  },
});
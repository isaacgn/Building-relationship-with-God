import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { module2Chapters } from "@/data/module2Questions";
import { useLanguage } from "@/context/LanguageContext";

export default function EvaluationScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("Module 2 Evaluation")}</Text>

      <Text style={styles.subtitle}>
        {t("Select a chapter and answer the reflection questions at your own pace.")}
      </Text>

      {module2Chapters.map((chapter) => (
        <Pressable
          key={chapter.id}
          style={styles.chapterCard}
          onPress={() => router.push(`/evaluation/${chapter.id}`)}
        >
          <View style={styles.chapterContent}>
            <Text style={styles.chapterNumber}>
              {t("Chapter {number}", { number: chapter.number })}
            </Text>

            <Text style={styles.chapterTitle}>{t(chapter.title)}</Text>

            <Text style={styles.questionCount}>
              {chapter.questions.length}{" "}
              {t(chapter.questions.length === 1 ? "question" : "questions")}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F7F8F5",
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    color: "#1F3B2C",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5A6757",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  chapterCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chapterContent: {
    flex: 1,
    gap: 6,
  },
  chapterNumber: {
    color: "#2F6B45",
    fontSize: 13,
    fontWeight: "700",
  },
  chapterTitle: {
    color: "#1F3B2C",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  questionCount: {
    color: "#667368",
    fontSize: 14,
  },
  arrow: {
    color: "#2F6B45",
    fontSize: 30,
    lineHeight: 30,
  },
});
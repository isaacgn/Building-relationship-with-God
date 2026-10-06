import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { growthAreas } from "@/data/growthAreas";
import { useLanguage } from "@/context/LanguageContext";
import {
  CompletionMap,
  getCompletions,
  getProfile,
  getTodayKey,
  UserProfile,
} from "@/services/storage";

export default function TodayScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [isLoading, setIsLoading] = useState(true);

  const dailyFocus = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86_400_000
    );

    return growthAreas[dayOfYear % growthAreas.length];
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function loadDashboardData() {
        try {
          setIsLoading(true);

          const [savedProfile, savedCompletions] = await Promise.all([
            getProfile(),
            getCompletions(),
          ]);

          setProfile(savedProfile);
          setCompletions(savedCompletions);
        } catch (error) {
          console.error("Could not load dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }

      loadDashboardData();
    }, [])
  );

  const completedToday = completions[getTodayKey()] ?? [];
  const firstName = profile?.name.trim().split(/\s+/)[0] || t("there");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6B45" />
        <Text style={styles.loadingText}>{t("Loading your dashboard...")}</Text>
      </View>
    );
  }

  if (!profile?.onboardingComplete) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.title}>{t("Building Relationship with God")}</Text>

        <Text style={styles.emptyText}>
          {t("Complete your profile setup to personalise your daily journey.")}
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={styles.primaryButtonText}>{t("Set Up My Profile")}</Text>
        </Pressable>
      </View>
    );
  }

  if (!dailyFocus) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.title}>{t("Building Relationship with God")}</Text>
        <Text style={styles.emptyText}>
          {t("Add Growth Areas to your data file to show a Daily Focus.")}
        </Text>
      </View>
    );
  }

  const isDailyFocusCompleted = completedToday.includes(dailyFocus.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>{t("Welcome, {name}", { name: firstName })}</Text>

      <Text style={styles.title}>{t("Building Relationship with God")}</Text>

      <Text style={styles.introduction}>
        {t(
          "Grow daily through prayer, Scripture, gratitude, reflection, and faithful action."
        )}
      </Text>

      {/* <View style={styles.dailyFocusCard}>
        <Text style={styles.dailyFocusLabel}>{t("DAILY FOCUS")}</Text>

        <Text style={styles.dailyFocusTitle}>{t(dailyFocus.title)}</Text>

        <Text style={styles.dailyFocusDescription}>
          {t(dailyFocus.description)}
        </Text>

        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>{t("TODAY'S REFLECTION")}</Text>

          <Text style={styles.promptText}>{t(dailyFocus.prompt)}</Text>
        </View>

        <Pressable
          style={[
            styles.focusButton,
            isDailyFocusCompleted && styles.completedFocusButton,
          ]}
          onPress={() => router.push(`/growth-detail/${dailyFocus.id}`)}
        >
          <Text style={styles.focusButtonText}>
            {isDailyFocusCompleted
              ? t("Completed today")
              : t("Open Daily Focus")}
          </Text>
        </Pressable>
      </View> */}

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>{t("Today's Progress")}</Text>

          <Text style={styles.progressNumber}>
            {t("{count} completed", { count: completedToday.length })}
          </Text>
        </View>

        <Text style={styles.progressText}>
          {t(
            completedToday.length === 1
              ? "You have completed {count} practice today."
              : "You have completed {count} practices today.",
            { count: completedToday.length }
          )}
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/growth")}
        >
          <Text style={styles.secondaryButtonText}>{t("View Growth Areas")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F7F8F5",
  },
  loadingText: {
    color: "#5A6757",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#F7F8F5",
  },
  emptyText: {
  color: "#5A6757",
  fontSize: 16,
  lineHeight: 24,
  textAlign: "center",
},
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
    backgroundColor: "#F7F8F5",
  },
  welcome: {
    fontSize: 17,
    fontWeight: "600",
    color: "#526758",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F3B2C",
    lineHeight: 38,
  },
  introduction: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5A6757",
    marginBottom: 4,
  },
  dailyFocusCard: {
    backgroundColor: "#E5F0E6",
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  dailyFocusLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#46624A",
  },
  dailyFocusTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F3B2C",
  },
  dailyFocusDescription: {
    fontSize: 16,
    lineHeight: 23,
    color: "#304936",
  },
  promptBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginTop: 6,
    gap: 6,
  },
  promptLabel: {
    color: "#55715B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.9,
  },
  promptText: {
    color: "#243B29",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 23,
  },
  focusButton: {
    marginTop: 8,
    backgroundColor: "#2F6B45",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completedFocusButton: {
    backgroundColor: "#6B7C70",
  },
  focusButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  progressTitle: {
    color: "#1F3B2C",
    fontSize: 19,
    fontWeight: "700",
  },
  progressNumber: {
    color: "#2F6B45",
    fontSize: 14,
    fontWeight: "700",
  },
  progressText: {
    color: "#5A6757",
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#2F6B45",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#2F6B45",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: "#2F6B45",
    fontSize: 14,
    fontWeight: "700",
  },
});
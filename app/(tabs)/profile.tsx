import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { getProfile, UserProfile } from "@/services/storage";

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const savedProfile = await getProfile();
        setProfile(savedProfile);
      }

      loadProfile();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {profile ? (
        <View style={styles.profileCard}>
          <Text style={styles.name}>{profile.name}</Text>

          <Text style={styles.detail}>
            Life stage: {profile.lifeStage}
          </Text>

          <Text style={styles.detail}>
            Daily reminder: {profile.dailyReminderTime}
          </Text>

          <Text style={styles.detail}>
            Reminders: {profile.notificationsEnabled ? "Enabled" : "Disabled"}
          </Text>
        </View>
      ) : (
        <View style={styles.profileCard}>
          <Text style={styles.detail}>
            Complete onboarding to create your profile.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.primaryButtonText}>Set Up Profile</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Evaluations</Text>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push("/evaluation")}
      >
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Module 2 Evaluation</Text>

          <Text style={styles.menuDescription}>
            Reflect on discipleship, Bible study, cell groups, prayer, and
            practical spiritual growth.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Settings</Text>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push("/onboarding")}
      >
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Edit Profile</Text>

          <Text style={styles.menuDescription}>
            Update your name, life stage, and reminder preferences.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>
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
    marginBottom: 4,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  name: {
    color: "#1F3B2C",
    fontSize: 22,
    fontWeight: "700",
  },
  detail: {
    color: "#4E5B50",
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: "#1F3B2C",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 2,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    flex: 1,
    gap: 5,
  },
  menuTitle: {
    color: "#1F3B2C",
    fontSize: 17,
    fontWeight: "700",
  },
  menuDescription: {
    color: "#5A6757",
    fontSize: 14,
    lineHeight: 20,
  },
  arrow: {
    color: "#2F6B45",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "400",
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2F6B45",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import {
  LifeStage,
  saveProfile,
  UserProfile,
} from "@/services/storage";

const lifeStageOptions: { label: string; value: LifeStage }[] = [
  { label: "Student", value: "student" },
  { label: "Career", value: "career" },
  { label: "Business", value: "business" },
  { label: "General", value: "general" },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lifeStage, setLifeStage] = useState<LifeStage>("general");
  const [dailyReminderTime, setDailyReminderTime] = useState("07:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleContinue() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your name to continue.");
      return;
    }

    const profile: UserProfile = {
      name: trimmedName,
      lifeStage,
      dailyReminderTime,
      weeklyReminderDay: 0,
      notificationsEnabled,
      onboardingComplete: true,
    };

    try {
      setIsSaving(true);

      await saveProfile(profile);

      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Could not save profile",
        "Please try again. If the problem continues, restart the app."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      <Text style={styles.subtitle}>
        Set up your personal spiritual-growth journey.
      </Text>

      <Text style={styles.label}>Your name</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={styles.input}
        autoCapitalize="words"
      />

      <Text style={styles.label}>I am primarily a</Text>

      <View style={styles.options}>
        {lifeStageOptions.map((option) => {
          const selected = lifeStage === option.value;

          return (
            <Pressable
              key={option.value}
              style={[styles.option, selected && styles.selectedOption]}
              onPress={() => setLifeStage(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Daily reminder time</Text>

      <TextInput
        value={dailyReminderTime}
        onChangeText={setDailyReminderTime}
        placeholder="07:00"
        keyboardType="numbers-and-punctuation"
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.label}>Enable reminders</Text>
          <Text style={styles.helperText}>
            You can change this later in Profile.
          </Text>
        </View>

        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#C9D3CA", true: "#8FBE9B" }}
          thumbColor={notificationsEnabled ? "#2F6B45" : "#FFFFFF"}
        />
      </View>

      <Pressable
        style={[styles.button, isSaving && styles.disabledButton]}
        onPress={handleContinue}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? "Saving..." : "Continue"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F7F8F5",
    padding: 24,
    paddingTop: 64,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F3B2C",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5A6757",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F3B2C",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD7CD",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#1F3B2C",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: "#AFC1B2",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    backgroundColor: "#2F6B45",
    borderColor: "#2F6B45",
  },
  optionText: {
    fontWeight: "600",
    color: "#36513C",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 6,
  },
  switchText: {
    flex: 1,
    gap: 4,
  },
  helperText: {
    color: "#667368",
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#2F6B45",
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
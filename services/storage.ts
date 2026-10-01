import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETIONS_KEY = "@relationship_with_god/completions";
const PROFILE_KEY = "@relationship_with_god/profile";

export type CompletionMap = Record<string, string[]>;

export type LifeStage = "student" | "career" | "business" | "general";

export type UserProfile = {
  name: string;
  lifeStage: LifeStage;
  dailyReminderTime: string;
  weeklyReminderDay: number;
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
};

export function getTodayKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getCompletions(): Promise<CompletionMap> {
  try {
    const savedValue = await AsyncStorage.getItem(COMPLETIONS_KEY);

    if (!savedValue) {
      return {};
    }

    return JSON.parse(savedValue) as CompletionMap;
  } catch (error) {
    console.error("Could not load completion data:", error);
    return {};
  }
}

export async function isCompletedToday(areaId: string): Promise<boolean> {
  const completions = await getCompletions();
  const completedToday = completions[getTodayKey()] ?? [];

  return completedToday.includes(areaId);
}

export async function toggleCompletion(
  areaId: string
): Promise<CompletionMap> {
  try {
    const completions = await getCompletions();
    const todayKey = getTodayKey();
    const completedToday = completions[todayKey] ?? [];

    const updatedToday = completedToday.includes(areaId)
      ? completedToday.filter((id) => id !== areaId)
      : [...completedToday, areaId];

    const updatedCompletions: CompletionMap = {
      ...completions,
      [todayKey]: updatedToday,
    };

    await AsyncStorage.setItem(
      COMPLETIONS_KEY,
      JSON.stringify(updatedCompletions)
    );

    return updatedCompletions;
  } catch (error) {
    console.error("Could not save completion data:", error);
    throw error;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Could not save profile:", error);
    throw error;
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const savedValue = await AsyncStorage.getItem(PROFILE_KEY);

    if (!savedValue) {
      return null;
    }

    return JSON.parse(savedValue) as UserProfile;
  } catch (error) {
    console.error("Could not load profile:", error);
    return null;
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error("Could not clear profile:", error);
    throw error;
  }
}
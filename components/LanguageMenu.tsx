import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppLanguage, useLanguage } from "@/context/LanguageContext";

export default function LanguageMenu() {
  const { language, setLanguage, t } = useLanguage();
  const [visible, setVisible] = useState(false);

  async function selectLanguage(nextLanguage: AppLanguage) {
    try {
      await setLanguage(nextLanguage);
      setVisible(false);
    } catch {
      Alert.alert(
        t("Could not change language"),
        t("Please try again.")
      );
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("Open menu")}
        onPress={() => setVisible(true)}
        hitSlop={10}
        style={styles.menuButton}
      >
        <Ionicons name="menu" size={26} color="#1F3B2C" />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel={t("Close menu")}
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />
          <View style={styles.menu}>
            <View style={styles.menuHeading}>
              <Text style={styles.menuTitle}>{t("Choose language")}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("Close menu")}
                onPress={() => setVisible(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color="#526758" />
              </Pressable>
            </View>

            {(["en", "ta"] as const).map((option) => {
              const label = option === "en" ? t("English") : t("Tamil");
              const selected = language === option;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={[styles.option, selected && styles.selectedOption]}
                  onPress={() => selectLanguage(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.selectedOptionText,
                    ]}
                  >
                    {label}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={20} color="#2F6B45" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 14,
    padding: 2,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 72,
    paddingHorizontal: 12,
    backgroundColor: "rgba(16, 28, 20, 0.25)",
  },
  menu: {
    alignSelf: "flex-start",
    width: 260,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.16)",
    elevation: 8,
  },
  menuHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  menuTitle: {
    color: "#1F3B2C",
    fontSize: 17,
    fontWeight: "700",
  },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  selectedOption: {
    backgroundColor: "#E5F0E6",
  },
  optionText: {
    color: "#304936",
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#2F6B45",
    fontWeight: "700",
  },
});

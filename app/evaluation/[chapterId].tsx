import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { module2Chapters } from "@/data/module2Questions";
import { useLanguage } from "@/context/LanguageContext";

function getWebStorage(): Storage | null {
  if (
    typeof window !== "undefined" &&
    (window as any).localStorage
  ) {
    return (window as any).localStorage as Storage;
  }
  return null;
}

async function safeSetItem(key: string, value: string) {
  const storage = getWebStorage();
  if (storage) {
    storage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function safeGetItem(key: string): Promise<string | null> {
  const storage = getWebStorage();
  if (storage) {
    return storage.getItem(key);
  }
  return await AsyncStorage.getItem(key);
}

async function safeRemoveItem(key: string) {
  const storage = getWebStorage();
  if (storage) {
    storage.removeItem(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

type EvaluationAnswers = Record<string, number>;

const MODULE_2_ANSWERS_KEY = "@relationship_with_god/module_2_answers";

type RatingModalProps = {
  visible: boolean;
  questionLabel: string;
  currentRating?: number;
  onSelect: (rating: number) => void;
  onClose: () => void;
};

function RatingModal({
  visible,
  questionLabel,
  currentRating,
  onSelect,
  onClose,
}: RatingModalProps) {
  const { t } = useLanguage();
  const ratings = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("Rate yourself")}</Text>

          <Text style={styles.modalQuestionLabel}>
            {questionLabel}
          </Text>

          {currentRating !== undefined ? (
            <Text style={styles.currentRatingText}>
              {t("Current rating: {rating}", { rating: currentRating })}
            </Text>
          ) : null}

          <FlatList
            data={ratings}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={styles.ratingsList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.ratingButton}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.ratingButtonText}>{item}</Text>
              </Pressable>
            )}
          />

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function EvaluationChapterScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { t } = useLanguage();

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [activeImage, setActiveImage] = useState<number | null>(null);

  const [answers, setAnswers] = useState<EvaluationAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const chapter = module2Chapters.find(
    (item) => item.id === chapterId
  );

  const loadAnswers = useCallback(async () => {
    try {
      setIsLoading(true);

      const savedValue = await safeGetItem(MODULE_2_ANSWERS_KEY);

      if (savedValue) {
        setAnswers(JSON.parse(savedValue) as EvaluationAnswers);
      } else {
        setAnswers({});
      }
    } catch (error) {
      console.error("Could not load evaluation answers:", error);

      Alert.alert(
        t("Could not load answers"),
        t("Your saved evaluation answers could not be loaded.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadAnswers();
    }, [loadAnswers])
  );

  function openQuestionImage(image: number) {
  setActiveImage(image);
  setImageModalVisible(true);
}

function closeQuestionImage() {
  setImageModalVisible(false);
  setActiveImage(null);
}

  function openRatingModal(questionId: string) {
    setActiveQuestionId(questionId);
    setRatingModalVisible(true);
  }

  function closeRatingModal() {
    setRatingModalVisible(false);
    setActiveQuestionId(null);
  }

  async function selectRating(rating: number) {
    if (!activeQuestionId) {
      return;
    }

    try {
      setSavingAnswerId(activeQuestionId);

      const updatedAnswers: EvaluationAnswers = {
        ...answers,
        [activeQuestionId]: rating,
      };

      setAnswers(updatedAnswers);

      await safeSetItem(
        MODULE_2_ANSWERS_KEY,
        JSON.stringify(updatedAnswers)
      );
    } catch (error) {
      console.error("Could not save evaluation answer:", error);

      Alert.alert(
        t("Could not save answer"),
        t("Please try selecting your rating again.")
      );
    } finally {
      setSavingAnswerId(null);
      setRatingModalVisible(false);
      setActiveQuestionId(null);
    }
  }

  function getChapterAnswerIds() {
    if (!chapter) {
      return [];
    }

    const answerIds: string[] = [];

    chapter.questions.forEach((question) => {
      answerIds.push(question.id);

      question.subItems?.forEach((subItem) => {
        const subItemId = `${question.id}-sub-${subItem.id}`;

        answerIds.push(subItemId);

        subItem.subItems?.forEach((_, nestedIndex) => {
          const nestedItemId =
            `${question.id}-sub-${subItem.id}` +
            `-nested-${nestedIndex + 1}`;

          answerIds.push(nestedItemId);
        });
      });
    });

    return answerIds;
  }

  async function clearChapterResponses() {
    if (!chapter) {
      return;
    }

    try {
      setIsClearing(true);

      const chapterAnswerIds = getChapterAnswerIds();

      const updatedAnswers = { ...answers };

      chapterAnswerIds.forEach((answerId) => {
        delete updatedAnswers[answerId];
      });

      await safeSetItem(
        MODULE_2_ANSWERS_KEY,
        JSON.stringify(updatedAnswers)
      );

      setAnswers(updatedAnswers);

      Alert.alert(
        t("Responses cleared"),
        t("All saved ratings for Chapter {number} have been cleared.", {
          number: chapter.number,
        })
      );
    } catch (error) {
      console.error("Could not clear chapter responses:", error);

      Alert.alert(
        t("Could not clear responses"),
        t("Please try again.")
      );
    } finally {
      setIsClearing(false);
    }
  }

  function confirmClearChapterResponses() {
    if (!chapter) {
      return;
    }

    Alert.alert(
      t("Clear Chapter Responses?"),
      t(
        "This will permanently clear all selected ratings (0–10) for Chapter {number}. Responses in other chapters will not be changed.",
        { number: chapter.number }
      ),
      [
        {
          text: t("Cancel"),
          style: "cancel",
        },
        {
          text: t("Clear Responses"),
          style: "destructive",
          onPress: clearChapterResponses,
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6B45" />

        <Text style={styles.loadingText}>
          {t("Loading evaluation questions...")}
        </Text>
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{t("Chapter not found")}</Text>

        <Text style={styles.emptyText}>
          {t("Return to Module 2 Evaluation and choose a chapter again.")}
        </Text>
      </View>
    );
  }

  if (chapter.questions.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.chapterNumber}>
          {t("CHAPTER {number}", { number: chapter.number })}
        </Text>

        <Text style={styles.title}>{t(chapter.title)}</Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {t("Questions for this chapter have not yet been added.")}
          </Text>
        </View>
      </ScrollView>
    );
  }

  const answeredMainQuestions = chapter.questions.filter(
    (question) =>
      answers[question.id] !== undefined &&
      answers[question.id] !== null
  ).length;

  const totalMainQuestions = chapter.questions.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.chapterNumber}>
        {t("CHAPTER {number}", { number: chapter.number })}
      </Text>

      <Text style={styles.title}>{t(chapter.title)}</Text>

      <Text style={styles.subtitle}>
        {t(
          "Rate yourself honestly on a scale of 0 to 10 for personal reflection and growth. Your answers are stored only on this device."
        )}
      </Text>

      <View style={styles.progressRow}>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {t("{answered} of {total} main questions rated", {
              answered: answeredMainQuestions,
              total: totalMainQuestions,
            })}
          </Text>
        </View>

        <Pressable
          style={[
            styles.clearButton,
            isClearing && styles.disabledClearButton,
          ]}
          onPress={confirmClearChapterResponses}
          disabled={isClearing}
        >
          <Text style={styles.clearButtonText}>
            {isClearing ? t("Clearing...") : t("Clear Responses")}
          </Text>
        </Pressable>
      </View>

      {chapter.questions.map((question, index) => (
        <View key={question.id}>
          {question.sectionTitle ? (
            <Text style={styles.sectionTitle}>
              {t(question.sectionTitle)}
            </Text>
          ) : null}

          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>
              {t("Question {number}", { number: index + 1 })}
            </Text>

            <Text style={styles.questionText}>{t(question.text)}</Text>

            {question.description ? (
              <Text style={styles.questionDescription}>
                {t(question.description)}
              </Text>
            ) : null}

            {question.image ? (
  <Pressable
    style={styles.referImageButton}
    onPress={() => openQuestionImage(question.image!)}
  >
    <Text style={styles.referImageText}>
      {t("Refer the image")}
    </Text>
  </Pressable>
) : null}

            <RatingField
              label={t("Click to answer")}
              rating={answers[question.id]}
              isSaving={savingAnswerId === question.id}
              onPress={() => openRatingModal(question.id)}
            />

            {question.subItems?.length ? (
              <View style={styles.subItemsContainer}>
                <Text style={styles.subItemsTitle}>
                  {t("Consider the following:")}
                </Text>

                {question.subItems.map((subItem, subIndex) => {
                  const subItemId =
                    `${question.id}-sub-${subItem.id}`;

                  return (
                    <View key={subItemId} style={styles.subItemCard}>
                      <View style={styles.subItemHeading}>
                        {chapter.number !== 12 ? (
                          <Text style={styles.subItemNumber}>
                            {subIndex + 1}.
                          </Text>
                        ) : null}

                        <Text
                          style={[
                            styles.subItemText,
                            chapter.number === 12 &&
                              styles.chapter12SubItemText,
                          ]}
                        >
                          {t(subItem.text)}
                        </Text>
                      </View>

                      <RatingField
                        label={t("Click to answer")}
                        rating={answers[subItemId]}
                        isSaving={savingAnswerId === subItemId}
                        onPress={() => openRatingModal(subItemId)}
                        compact
                      />

                      {subItem.subItems?.length ? (
                        <View style={styles.nestedSubItemsContainer}>
                          <Text style={styles.nestedSubItemsTitle}>
                            {t("Reflect on these questions:")}
                          </Text>

                          {subItem.subItems.map(
                            (nestedItem, nestedIndex) => {
                              const nestedItemId =
                                `${question.id}-sub-${subItem.id}` +
                                `-nested-${nestedIndex + 1}`;

                              return (
                                <View
                                  key={nestedItemId}
                                  style={styles.nestedSubItemCard}
                                >
                                  <View
                                    style={styles.nestedSubItemHeading}
                                  >
                                    <Text
                                      style={styles.nestedSubItemNumber}
                                    >
                                      {nestedIndex + 1}.
                                    </Text>

                                    <Text
                                      style={styles.nestedSubItemText}
                                    >
                                      {t(nestedItem)}
                                    </Text>
                                  </View>

                                  <RatingField
                                    label={t("Click to answer")}
                                    rating={answers[nestedItemId]}
                                    isSaving={savingAnswerId === nestedItemId}
                                    onPress={() =>
                                      openRatingModal(nestedItemId)
                                    }
                                    compact
                                  />
                                </View>
                              );
                            }
                          )}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>
      ))}

      {activeImage ? (
  <Modal
    visible={imageModalVisible}
    transparent
    animationType="fade"
    onRequestClose={closeQuestionImage}
  >
    <View style={styles.imageModalOverlay}>
      <View style={styles.imageModalContent}>
        <Image
          source={activeImage}
          style={styles.chapterImage}
          resizeMode="contain"
        />

        <Pressable
          style={styles.closeImageButton}
          onPress={closeQuestionImage}
        >
          <Text style={styles.closeImageButtonText}>{t("Close")}</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
) : null}

      <RatingModal
        visible={ratingModalVisible}
        questionLabel={
          activeQuestionId
            ? t(getQuestionLabelById(activeQuestionId, chapter))
            : ""
        }
        currentRating={
          activeQuestionId ? answers[activeQuestionId] : undefined
        }
        onSelect={selectRating}
        onClose={closeRatingModal}
      />
    </ScrollView>
  );
}

function getQuestionLabelById(
  answerId: string,
  chapter: (typeof module2Chapters)[number]
): string {
  // Try to find main question
  const mainQuestion = chapter.questions.find(
    (q) => q.id === answerId
  );
  if (mainQuestion) {
    return mainQuestion.text;
  }

  // Try subitems
  for (const question of chapter.questions) {
    if (!question.subItems) continue;

    for (const subItem of question.subItems) {
      const subItemId = `${question.id}-sub-${subItem.id}`;
      if (subItemId === answerId) {
        return subItem.text;
      }

      if (subItem.subItems) {
        for (let i = 0; i < subItem.subItems.length; i++) {
          const nestedItemId =
            `${question.id}-sub-${subItem.id}` +
            `-nested-${i + 1}`;
          if (nestedItemId === answerId) {
            return subItem.subItems[i];
          }
        }
      }
    }
  }

  return "This question";
}

type RatingFieldProps = {
  label: string;
  rating?: number;
  isSaving: boolean;
  onPress: () => void;
  compact?: boolean;
};

function RatingField({
  label,
  rating,
  isSaving,
  onPress,
  compact = false,
}: RatingFieldProps) {
  const { t } = useLanguage();

  return (
    <View style={[styles.ratingFieldContainer, compact && styles.compactRatingField]}>
      <Pressable
        style={[
          styles.ratingField,
          isSaving && styles.disabledRatingField,
        ]}
        onPress={onPress}
        disabled={isSaving}
      >
        <Text
          style={[
            styles.ratingFieldLabel,
            compact && styles.compactRatingFieldLabel,
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.ratingFieldValue,
            compact && styles.compactRatingFieldValue,
            rating !== undefined && styles.selectedRatingValue,
          ]}
        >
          {rating !== undefined ? `${rating}` : t("Not rated")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  referImageButton: {
  alignSelf: "flex-start",
  paddingVertical: 4,
  paddingHorizontal: 2,
},

referImageText: {
  color: "#2F6B45",
  fontSize: 14,
  fontWeight: "700",
  textDecorationLine: "underline",
},

imageModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},

imageModalContent: {
  width: "100%",
  maxWidth: 600,
  maxHeight: "90%",
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 12,
  alignItems: "center",
  gap: 12,
},

chapterImage: {
  width: "100%",
  height: 520,
},

closeImageButton: {
  backgroundColor: "#2F6B45",
  borderRadius: 10,
  paddingHorizontal: 24,
  paddingVertical: 11,
},

closeImageButtonText: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "700",
},
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F8F5",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: "#5A6757",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F7F8F5",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#F7F8F5",
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  chapterNumber: {
    color: "#2F6B45",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    color: "#1F3B2C",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  subtitle: {
    color: "#5A6757",
    fontSize: 16,
    lineHeight: 24,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 2,
  },
  progressBadge: {
    flex: 1,
    backgroundColor: "#E5F0E6",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressText: {
    color: "#2F6B45",
    fontSize: 13,
    fontWeight: "700",
  },
  clearButton: {
    borderWidth: 1,
    borderColor: "#A54B4B",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  disabledClearButton: {
    opacity: 0.55,
  },
  clearButtonText: {
    color: "#A54B4B",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#2F6B45",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
    marginTop: 10,
    marginBottom: -4,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  questionNumber: {
    color: "#55715B",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  questionText: {
    color: "#1F3B2C",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  questionDescription: {
    color: "#5A6757",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 21,
  },
  ratingFieldContainer: {
    marginTop: 2,
  },
  compactRatingField: {
    marginTop: 0,
  },
  ratingField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9DB4A1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  disabledRatingField: {
    opacity: 0.65,
  },
  ratingFieldLabel: {
    color: "#5A6757",
    fontSize: 14,
  },
  compactRatingFieldLabel: {
    fontSize: 13,
  },
  ratingFieldValue: {
    color: "#9DB4A1",
    fontSize: 15,
    fontWeight: "700",
  },
  compactRatingFieldValue: {
    fontSize: 14,
  },
  selectedRatingValue: {
    color: "#2F6B45",
  },
  subItemsContainer: {
    backgroundColor: "#F2F5F1",
    borderLeftWidth: 3,
    borderLeftColor: "#8FAD95",
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  subItemsTitle: {
    color: "#3D5943",
    fontSize: 14,
    fontWeight: "700",
  },
  subItemCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE6DC",
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  subItemHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  subItemNumber: {
    color: "#2F6B45",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 18,
  },
  subItemText: {
    flex: 1,
    color: "#4E5B50",
    fontSize: 14,
    lineHeight: 21,
  },
  chapter12SubItemText: {
    marginLeft: 0,
  },
  nestedSubItemsContainer: {
    backgroundColor: "#EEF3ED",
    borderLeftWidth: 2,
    borderLeftColor: "#B7CDBA",
    borderRadius: 8,
    padding: 10,
    gap: 10,
    marginTop: 2,
  },
  nestedSubItemsTitle: {
    color: "#4B654F",
    fontSize: 13,
    fontWeight: "700",
  },
  nestedSubItemCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE6DC",
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  nestedSubItemHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  nestedSubItemNumber: {
    color: "#55715B",
    fontSize: 13,
    fontWeight: "700",
    minWidth: 18,
  },
  nestedSubItemText: {
    flex: 1,
    color: "#4E5B50",
    fontSize: 13,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: 16,
    padding: 18,
  },
  emptyTitle: {
    color: "#1F3B2C",
    fontSize: 24,
    fontWeight: "700",
  },
  emptyText: {
    color: "#5A6757",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    maxHeight: "80%",
  },
  modalTitle: {
    color: "#1F3B2C",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  modalQuestionLabel: {
    color: "#4E5B50",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  currentRatingText: {
    color: "#2F6B45",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  ratingsList: {
    paddingVertical: 6,
  },
  ratingButton: {
    backgroundColor: "#F2F5F1",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    alignItems: "center",
  },
  ratingButtonText: {
    color: "#2F6B45",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9DB4A1",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 4,
  },
  cancelButtonText: {
    color: "#5A6757",
    fontSize: 15,
    fontWeight: "700",
  },
});
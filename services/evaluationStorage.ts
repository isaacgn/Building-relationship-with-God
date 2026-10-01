import AsyncStorage from "@react-native-async-storage/async-storage";

const MODULE_2_EVALUATION_KEY =
  "@relationship_with_god/module_2_evaluation";

export type EvaluationAnswers = Record<string, string>;

export async function getModule2Answers(): Promise<EvaluationAnswers> {
  try {
    const savedValue = await AsyncStorage.getItem(
      MODULE_2_EVALUATION_KEY
    );

    return savedValue ? JSON.parse(savedValue) : {};
  } catch (error) {
    console.error("Could not load Module 2 answers:", error);
    return {};
  }
}

export async function saveModule2Answer(
  questionId: string,
  answer: string
): Promise<EvaluationAnswers> {
  const currentAnswers = await getModule2Answers();

  const updatedAnswers = {
    ...currentAnswers,
    [questionId]: answer,
  };

  await AsyncStorage.setItem(
    MODULE_2_EVALUATION_KEY,
    JSON.stringify(updatedAnswers)
  );

  return updatedAnswers;
}

export async function clearModule2Answers(): Promise<void> {
  await AsyncStorage.removeItem(MODULE_2_EVALUATION_KEY);
}
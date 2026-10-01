export type GrowthCategory =
  | "Foundation"
  | "Word"
  | "Community"
  | "Stewardship";

export type GrowthArea = {
  id: string;
  title: string;
  category: GrowthCategory;
  description: string;
  prompt: string;
};
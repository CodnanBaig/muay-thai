export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ComboCategory = 'Punches' | 'Kicks' | 'Elbows' | 'Knees' | 'Combos';

export interface ComboItem {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  gifPath: string;
  instructions: string[];
  category: ComboCategory;
  tips?: string[];
  commonMistakes?: string[];
  nextCombos?: string[]; // Suggested progression
}

export interface ComboDefinition extends ComboItem {
  gifFileName: string;
}
import { ComboItem, ComboDefinition, ComboCategory, DifficultyLevel } from '../types';
import comboData from '../assets/data/combos.json';
import { StorageService } from './StorageService';

export class ComboService {
  private static combos: ComboItem[] = [];

  // Initialize combos from JSON data
  static async initializeCombos(): Promise<void> {
    try {
      this.combos = (comboData as ComboDefinition[]).map((combo) => ({
        id: combo.id,
        name: combo.name,
        difficulty: combo.difficulty,
        gifPath: `../assets/muaythai/${combo.gifFileName}`,
        instructions: combo.instructions,
        category: combo.category,
        tips: combo.tips,
        commonMistakes: combo.commonMistakes,
        nextCombos: combo.nextCombos
      }));
    } catch (error) {
      console.error('Error initializing combos:', error);
      throw error;
    }
  }

  // Get all combos
  static getAllCombos(): ComboItem[] {
    return this.combos;
  }

  // Get combo by ID
  static getComboById(id: string): ComboItem | null {
    const combo = this.combos.find(combo => combo.id === id);
    return combo || null;
  }

  // Get combos by category
  static getCombosByCategory(category: ComboCategory): ComboItem[] {
    return this.combos.filter(combo => combo.category === category);
  }

  // Get combos by difficulty
  static getCombosByDifficulty(difficulty: DifficultyLevel): ComboItem[] {
    return this.combos.filter(combo => combo.difficulty === difficulty);
  }

  // Search combos by name or instructions
  static searchCombos(query: string): ComboItem[] {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return this.combos;
    }

    return this.combos.filter(combo => {
      // Search in name
      if (combo.name.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in instructions
      const instructionsText = combo.instructions.join(' ').toLowerCase();
      if (instructionsText.includes(searchTerm)) {
        return true;
      }

      // Search in category
      if (combo.category.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in tips
      if (combo.tips) {
        const tipsText = combo.tips.join(' ').toLowerCase();
        if (tipsText.includes(searchTerm)) {
          return true;
        }
      }

      return false;
    });
  }

  // Filter combos with multiple criteria
  static filterCombos({
    category,
    difficulty,
    searchQuery
  }: {
    category?: ComboCategory;
    difficulty?: DifficultyLevel;
    searchQuery?: string;
  }): ComboItem[] {
    let filteredCombos = this.combos;

    // Apply category filter
    if (category) {
      filteredCombos = filteredCombos.filter(combo => combo.category === category);
    }

    // Apply difficulty filter
    if (difficulty) {
      filteredCombos = filteredCombos.filter(combo => combo.difficulty === difficulty);
    }

    // Apply search filter
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filteredCombos = filteredCombos.filter(combo => {
        return combo.name.toLowerCase().includes(searchTerm) ||
               combo.instructions.join(' ').toLowerCase().includes(searchTerm) ||
               combo.category.toLowerCase().includes(searchTerm);
      });
    }

    return filteredCombos;
  }

  // Get recommended combos based on user's preferred difficulty
  static async getRecommendedCombos(): Promise<ComboItem[]> {
    try {
      const preferences = await StorageService.getAppPreferences();
      const progress = await StorageService.getProgress();
      
      // Get combos for user's preferred difficulty
      const preferredCombos = this.getCombosByDifficulty(preferences.preferredDifficulty);
      
      // If user is new (no sessions), show beginner combos
      if (progress.totalSessions === 0) {
        return this.getCombosByDifficulty('Beginner').slice(0, 3);
      }

      // If user has some experience, mix difficulty levels
      if (progress.totalSessions >= 10) {
        const mixed = [
          ...this.getCombosByDifficulty('Beginner').slice(0, 1),
          ...this.getCombosByDifficulty('Intermediate').slice(0, 2),
          ...this.getCombosByDifficulty('Advanced').slice(0, 1)
        ];
        return mixed;
      }

      return preferredCombos.slice(0, 4);
    } catch (error) {
      console.error('Error getting recommended combos:', error);
      // Fallback to beginner combos
      return this.getCombosByDifficulty('Beginner').slice(0, 3);
    }
  }

  // Mark combo as completed (for progress tracking)
  static async markComboCompleted(comboId: string): Promise<void> {
    try {
      const combo = this.getComboById(comboId);
      if (!combo) {
        throw new Error(`Combo with id ${comboId} not found`);
      }

      const progress = await StorageService.getProgress();
      const sessionRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'combo' as const,
        duration: 5, // Assuming 5 minutes for combo practice
        details: {
          comboId,
          comboName: combo.name,
          category: combo.category,
          difficulty: combo.difficulty
        }
      };

      // Add to session history
      progress.sessionHistory.push(sessionRecord);
      progress.totalSessions += 1;
      progress.lastSessionDate = sessionRecord.date;

      // Update streak
      await this.updateStreak(progress);

      await StorageService.saveProgress(progress);
    } catch (error) {
      console.error('Error marking combo as completed:', error);
      throw error;
    }
  }

  // Get next recommended combos based on current combo
  static getNextCombos(currentComboId: string): ComboItem[] {
    const currentCombo = this.getComboById(currentComboId);
    if (!currentCombo || !currentCombo.nextCombos) {
      return [];
    }

    return currentCombo.nextCombos
      .map(id => this.getComboById(id))
      .filter((combo): combo is ComboItem => combo !== null);
  }

  // Get unique categories for filtering UI
  static getCategories(): ComboCategory[] {
    const categories = [...new Set(this.combos.map(combo => combo.category))];
    return categories as ComboCategory[];
  }

  // Get unique difficulty levels for filtering UI
  static getDifficultyLevels(): DifficultyLevel[] {
    const difficulties = [...new Set(this.combos.map(combo => combo.difficulty))];
    return difficulties as DifficultyLevel[];
  }

  // Private helper method to update streak
  private static async updateStreak(progress: any): Promise<void> {
    const ProgressService = await import('./ProgressService');
    progress.currentStreak = ProgressService.ProgressService.calculateStreak(progress.sessionHistory);
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }
  }
}
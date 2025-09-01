import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ComboItem, ComboCategory, DifficultyLevel } from '../types';
import { ComboCard } from '../components/combo';
import { LoadingSpinner } from '../components/common';
import { ComboService } from '../services';
import { colors, typography, spacing } from '../utils/constants';

export const CombosScreen: React.FC = () => {
  const [combos, setCombos] = useState<ComboItem[]>([]);
  const [filteredCombos, setFilteredCombos] = useState<ComboItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComboCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);

  useEffect(() => {
    loadCombos();
  }, []);

  useEffect(() => {
    filterCombos();
  }, [combos, searchQuery, selectedCategory, selectedDifficulty]);

  const loadCombos = async () => {
    try {
      setIsLoading(true);
      const allCombos = ComboService.getAllCombos();
      setCombos(allCombos);
    } catch (error) {
      console.error('Error loading combos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCombos = () => {
    const filtered = ComboService.filterCombos({
      category: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      searchQuery: searchQuery || undefined,
    });
    setFilteredCombos(filtered);
  };

  const handleComboPress = (combo: ComboItem) => {
    router.push(`/combo-detail/${combo.id}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };

  const categories = ComboService.getCategories();
  const difficulties = ComboService.getDifficultyLevels();

  const renderFilterChip = (
    label: string, 
    isSelected: boolean, 
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.selectedFilterChip
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.selectedFilterChipText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderComboItem = ({ item }: { item: ComboItem }) => (
    <ComboCard
      combo={item}
      onPress={handleComboPress}
    />
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading techniques..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Muay Thai Techniques</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search techniques..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Category:</Text>
        <View style={styles.filterRow}>
          {renderFilterChip(
            'All',
            selectedCategory === null,
            () => setSelectedCategory(null)
          )}
          {categories.map((category) => (
            <React.Fragment key={category}>
              {renderFilterChip(
                category,
                selectedCategory === category,
                () => setSelectedCategory(category === selectedCategory ? null : category)
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.filterLabel}>Difficulty:</Text>
        <View style={styles.filterRow}>
          {renderFilterChip(
            'All',
            selectedDifficulty === null,
            () => setSelectedDifficulty(null)
          )}
          {difficulties.map((difficulty) => (
            <React.Fragment key={difficulty}>
              {renderFilterChip(
                difficulty,
                selectedDifficulty === difficulty,
                () => setSelectedDifficulty(difficulty === selectedDifficulty ? null : difficulty)
              )}
            </React.Fragment>
          ))}
        </View>

        {(searchQuery || selectedCategory || selectedDifficulty) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearFilters}>
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredCombos.length} technique{filteredCombos.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Combo List */}
      {filteredCombos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No techniques found</Text>
          <Text style={styles.emptyStateDescription}>
            Try adjusting your search or filter criteria
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCombos}
          renderItem={renderComboItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
  },
  filtersSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '20',
  },
  filterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  selectedFilterChipText: {
    color: colors.textPrimary,
  },
  clearFilters: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
  },
  clearFiltersText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
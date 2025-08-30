import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Combos: undefined;
  ComboDetail: { comboId: string };
  Timer: undefined;
  Progress: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Combos: undefined;
  Timer: undefined;
  Progress: undefined;
};

export type ComboStackParamList = {
  ComboList: undefined;
  ComboDetail: { comboId: string };
};

// Screen prop types for type safety
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type CombosScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Combos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ComboDetailScreenProps = NativeStackScreenProps<
  ComboStackParamList,
  'ComboDetail'
>;

export type TimerScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Timer'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ProgressScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Progress'>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
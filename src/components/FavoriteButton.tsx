import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/constants/theme';

type Props = { active: boolean; onPress: () => void };

export function FavoriteButton({ active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={s.btn}>
      <Text style={[s.icon, active && s.active]}>{active ? '♥' : '♡'}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { padding: 4 },
  icon: { fontSize: 22, color: theme.textMuted },
  active: { color: theme.accent },
});

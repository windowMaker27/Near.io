import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

type Props = { label?: string };

export function LoadingView({ label }: Props) {
  return (
    <View style={s.container}>
      <ActivityIndicator color={theme.accent} size="large" />
      {label ? <Text style={s.label}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
    gap: 16,
  },
  label: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
    letterSpacing: 0.5,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

type Props = { title: string; description?: string };

export function EmptyState({ title, description }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.icon}>◎</Text>
      <Text style={s.title}>{title}</Text>
      {description ? <Text style={s.desc}>{description}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', gap: 10, padding: 32 },
  icon: { fontSize: 40, color: theme.textFaint },
  title: {
    fontFamily: theme.fontMonoBold,
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
  },
  desc: {
    fontFamily: theme.fontMono,
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});

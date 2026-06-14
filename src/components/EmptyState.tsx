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
  container: { alignItems: 'center', gap: theme.sp2 + 2, padding: theme.sp8 },
  icon: { fontSize: 40, color: theme.textFaint },
  title: {
    fontFamily: theme.fontMonoBold,
    fontSize: theme.textXl,
    color: theme.text,
    textAlign: 'center',
  },
  desc: {
    fontFamily: theme.fontMono,
    fontSize: theme.textXs + 2,
    color: theme.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});

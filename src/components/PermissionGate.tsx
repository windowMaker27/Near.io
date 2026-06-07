import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

type Props = { onPress: () => void };

export function PermissionGate({ onPress }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.icon}>◎</Text>
      <Text style={s.title}>Localisation requise</Text>
      <Text style={s.desc}>
        Near.io utilise votre position pour pointer vers le commerce alimentaire ouvert le plus proche.
      </Text>
      <Pressable style={s.btn} onPress={onPress}>
        <Text style={s.btnText}>Autoriser la localisation</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  icon: { fontSize: 56, color: theme.accent },
  title: {
    fontFamily: theme.fontMonoBold,
    fontSize: 20,
    color: theme.text,
    textAlign: 'center',
  },
  desc: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  btn: {
    marginTop: 8,
    backgroundColor: theme.accent,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: theme.radius,
  },
  btnText: {
    fontFamily: theme.fontMonoBold,
    fontSize: 14,
    color: theme.white,
  },
});

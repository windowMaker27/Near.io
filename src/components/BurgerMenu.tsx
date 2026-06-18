import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitPlace: () => void;
};

const NAV_ITEMS = [
  { label: 'Favoris',  route: '/favorites', icon: '♥' },
  { label: 'Mode AR',  route: '/ar',        icon: '◎' },
  { label: 'Carte',    route: '/map',       icon: '⊞' },
] as const;

export function BurgerMenu({ open, onClose, onSubmitPlace }: Props) {
  const router = useRouter();
  const t = useTheme();
  const { mode, setMode } = useThemeStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: open ? 1 : 0, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: open ? 0 : -20, useNativeDriver: true, damping: 20 }),
    ]).start();
  }, [open]);

  if (!open) return null;

  const accountLabel = session ? (profile?.username ?? 'Mon compte') : 'Se connecter / Créer un compte';
  const accountRoute = session ? '/profile' : '/(auth)/login';

  // cycle: system → light → dark → system
  function cycleTheme() {
    if (mode === 'system') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('system');
  }

  const themeIcon = mode === 'light' ? '☀' : mode === 'dark' ? '☽' : '◑';
  const themeLabel = mode === 'light' ? 'Thème clair' : mode === 'dark' ? 'Thème sombre' : 'Thème système';

  return (
    <Pressable style={s.backdrop} onPress={onClose}>
      <Animated.View style={[
        s.menu,
        { opacity, transform: [{ translateY }], backgroundColor: t.surface, borderColor: t.border },
      ]}>
        <Text style={[s.menuTitle, { color: t.accent, fontFamily: t.fontMonoBold }]}>NEAR.IO</Text>
        <View style={[s.divider, { backgroundColor: t.border }]} />

        {/* Compte */}
        <Pressable style={s.menuItem} onPress={() => { onClose(); router.push(accountRoute as any); }}>
          <Text style={[s.menuIcon, { color: t.textMuted, fontFamily: t.fontMono }]}>◉</Text>
          <Text style={[s.menuLabel, { color: session ? t.accent : t.text, fontFamily: t.fontMono }]}>{accountLabel}</Text>
        </Pressable>

        <View style={[s.divider, { backgroundColor: t.border }]} />

        {/* Nav items */}
        {NAV_ITEMS.map((item) => (
          <Pressable key={item.route} style={s.menuItem} onPress={() => { onClose(); router.push(item.route); }}>
            <Text style={[s.menuIcon, { color: t.textMuted, fontFamily: t.fontMono }]}>{item.icon}</Text>
            <Text style={[s.menuLabel, { color: t.text, fontFamily: t.fontMono }]}>{item.label}</Text>
          </Pressable>
        ))}

        <View style={[s.divider, { backgroundColor: t.border }]} />

        {/* Toggle thème */}
        <Pressable style={s.menuItem} onPress={cycleTheme}>
          <Text style={[s.menuIcon, { color: t.accent, fontFamily: t.fontMono }]}>{themeIcon}</Text>
          <Text style={[s.menuLabel, { color: t.text, fontFamily: t.fontMono }]}>{themeLabel}</Text>
          <View style={[s.badge, { backgroundColor: t.accent }]}>
            <Text style={[s.badgeText, { color: t.bg, fontFamily: t.fontMonoBold }]}>
              {mode.toUpperCase()}
            </Text>
          </View>
        </Pressable>

        <View style={[s.divider, { backgroundColor: t.border }]} />

        {/* Proposer */}
        <Pressable style={s.menuItem} onPress={() => { onClose(); onSubmitPlace(); }}>
          <Text style={[s.menuIcon, { color: t.textMuted, fontFamily: t.fontMono }]}>＋</Text>
          <Text style={[s.menuLabel, { color: t.text, fontFamily: t.fontMono }]}>Proposer un commerce</Text>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100,
    justifyContent: 'flex-start',
    paddingTop: theme.sp12 + theme.sp3,
    paddingHorizontal: theme.pagePad,
  },
  menu: { borderRadius: theme.radiusLg, borderWidth: 1, overflow: 'hidden', paddingBottom: theme.sp2 },
  menuTitle: { fontSize: theme.textSm, letterSpacing: theme.trackingTitle, padding: theme.pagePad, paddingBottom: theme.sp3 },
  divider: { height: 1, marginHorizontal: theme.pagePad, marginBottom: theme.sp2, marginTop: theme.sp1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: theme.pagePad, gap: theme.sp4 },
  menuIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel: { fontSize: theme.textLg, flex: 1 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 9, letterSpacing: 1 },
});

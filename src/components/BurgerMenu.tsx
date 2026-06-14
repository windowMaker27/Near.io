import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitPlace: () => void;
};

const NAV_ITEMS = [
  { label: 'Favoris',     route: '/favorites', icon: '♥' },
  { label: 'Paramètres', route: '/settings',  icon: '⚙' },
  { label: 'Mode AR',    route: '/ar',        icon: '◎' },
  { label: 'Carte',      route: '/map',       icon: '⊞' },
] as const;

export function BurgerMenu({ open, onClose, onSubmitPlace }: Props) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: open ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: open ? 0 : -20,
        useNativeDriver: true,
        damping: 20,
      }),
    ]).start();
  }, [open]);

  if (!open) return null;

  // FIX: label inversé — "Se connecter" en premier pour un non-connecté
  const accountLabel = session
    ? (profile?.username ?? 'Mon compte')
    : 'Se connecter / Créer un compte';
  const accountRoute = session ? '/profile' : '/(auth)/login';

  return (
    <Pressable style={s.backdrop} onPress={onClose}>
      <Animated.View style={[s.menu, { opacity, transform: [{ translateY }] }]}>
        <Text style={s.menuTitle}>NEAR.IO</Text>
        <View style={s.divider} />

        {/* Compte */}
        <Pressable
          style={s.menuItem}
          onPress={() => { onClose(); router.push(accountRoute as any); }}
        >
          <Text style={s.menuIcon}>◉</Text>
          <Text style={[s.menuLabel, session && { color: theme.accent }]}>
            {accountLabel}
          </Text>
        </Pressable>

        <View style={s.divider} />

        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.route}
            style={s.menuItem}
            onPress={() => { onClose(); router.push(item.route); }}
          >
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}

        <View style={s.divider} />

        {/* Proposer un commerce */}
        <Pressable
          style={s.menuItem}
          onPress={() => { onClose(); onSubmitPlace(); }}
        >
          <Text style={s.menuIcon}>＋</Text>
          <Text style={s.menuLabel}>Proposer un commerce</Text>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    justifyContent: 'flex-start',
    paddingTop: theme.sp12 + theme.sp3,
    paddingHorizontal: theme.pagePad,
  },
  menu: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    paddingBottom: theme.sp2,
  },
  menuTitle: {
    fontFamily: theme.fontMonoBold,
    fontSize: theme.textSm,
    color: theme.accent,
    letterSpacing: theme.trackingTitle,
    padding: theme.pagePad,
    paddingBottom: theme.sp3,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: theme.pagePad,
    marginBottom: theme.sp2,
    marginTop: theme.sp1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.pagePad,
    gap: theme.sp4,
  },
  menuIcon: {
    fontSize: 18,
    color: theme.textMuted,
    width: 24,
    textAlign: 'center',
    fontFamily: theme.fontMono,
  },
  menuLabel: {
    fontFamily: theme.fontMono,
    fontSize: theme.textLg,
    color: theme.text,
  },
});

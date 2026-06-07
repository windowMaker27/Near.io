import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useRef,
  useEffect,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';

type Props = { open: boolean; onClose: () => void };

const ITEMS = [
  { label: 'Favoris', route: '/favorites', icon: '♥' },
  { label: 'Paramètres', route: '/settings', icon: '⚙' },
  { label: 'Mode AR', route: '/ar', icon: '◎' },
  { label: 'Carte', route: '/map', icon: '⊞' },
] as const;

export function BurgerMenu({ open, onClose }: Props) {
  const router = useRouter();
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

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

  return (
    <Pressable style={s.backdrop} onPress={onClose}>
      <Animated.View
        style={[s.menu, { opacity, transform: [{ translateY }] }]}
      >
        <Text style={s.menuTitle}>NEAR.IO</Text>
        <View style={s.divider} />
        {ITEMS.map((item) => (
          <Pressable
            key={item.route}
            style={s.menuItem}
            onPress={() => {
              onClose();
              router.push(item.route);
            }}
          >
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
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
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menu: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  menuTitle: {
    fontFamily: theme.fontMonoBold,
    fontSize: 11,
    color: theme.accent,
    letterSpacing: 3,
    padding: 20,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuIcon: {
    fontSize: 18,
    color: theme.textMuted,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    fontFamily: theme.fontMono,
    fontSize: 15,
    color: theme.text,
  },
});

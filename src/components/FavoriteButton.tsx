import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

export const FavoriteButton = ({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Ionicons
      name={active ? 'heart' : 'heart-outline'}
      size={22}
      color={active ? '#F87171' : '#F4F7FB'}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#1A2338',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22304A',
  },
});

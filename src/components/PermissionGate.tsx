import { Pressable, StyleSheet, Text, View } from 'react-native';

export const PermissionGate = ({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Autoriser</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
    backgroundColor: '#0B1020',
  },
  title: { color: '#F4F7FB', fontSize: 24, fontWeight: '800' },
  description: { color: '#9AA5BD', lineHeight: 22 },
  button: {
    marginTop: 10,
    backgroundColor: '#4FD1C5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#081018', fontWeight: '800', fontSize: 16 },
});

import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#131A2A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#22304A',
    gap: 8,
  },
  title: { color: '#F4F7FB', fontSize: 18, fontWeight: '700' },
  description: { color: '#9AA5BD', lineHeight: 20 },
});

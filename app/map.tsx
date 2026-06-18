import { View, Text } from 'react-native';
export default function MapScreen() {
  console.log('[MAP] minimal screen loaded');
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808' }}>
      <Text style={{ color: '#fff', fontSize: 18 }}>MAP OK</Text>
    </View>
  );
}

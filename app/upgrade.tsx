import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function UpgradeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Unlock All Emotional Literacy Lessons
      </Text>

      <Text style={styles.item}>✓ 4 complete classroom lessons</Text>
      <Text style={styles.item}>✓ Full lesson plans</Text>
      <Text style={styles.item}>✓ SEN differentiation ideas</Text>
      <Text style={styles.item}>✓ Printable worksheets</Text>
      <Text style={styles.item}>✓ Activity tracker</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/subscribe')}
      >
        <Text style={styles.buttonText}>Start 14-Day Free Trial</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Back to lessons</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },

  item: {
    fontSize: 16,
    marginBottom: 10
  },

  button: {
    marginTop: 30,
    backgroundColor: '#6B46C1',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },

  back: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666'
  }
});
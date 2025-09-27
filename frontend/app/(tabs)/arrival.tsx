import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ArrivalScreen() {
  const router = useRouter();

  // In a real app, this would come from navigation params or global state
  const selectedStore = {
    name: "Whole Foods Market",
    address: "2500 Liberty St, Ann Arbor, MI 48103"
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{selectedStore.name}</ThemedText>
          <ThemedText style={styles.storeAddress}>{selectedStore.address}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.message}>
            When you arrive, ping a FreeWilli!
          </ThemedText>
        </ThemedView>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dce2e7',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#dce2e7',
    justifyContent: 'space-between',
  },
  storeInfo: {
    backgroundColor: '#dce2e7',
    marginTop: 40,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#55627b',
    textAlign: 'center',
    marginBottom: 8,
  },
  storeAddress: {
    fontSize: 16,
    color: '#55627b',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dce2e7',
  },
  message: {
    fontSize: 20,
    color: '#55627b',
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 12,
    backgroundColor: '#55627b',
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
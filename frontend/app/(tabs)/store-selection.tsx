import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function StoreSelectionScreen() {
  const router = useRouter();
  
  const stores = [
    {"name": "Meijer", "address": "1120 Arbor Hill Pkwy, Ann Arbor, MI 48103"},
    {"name": "Whole Foods Market", "address": "2500 Liberty St, Ann Arbor, MI 48103"},
    {"name": "Walmart", "address": "975 Commerce Dr, Ann Arbor, MI 48103"},
    {"name": "Kroger", "address": "1441 Washtenaw Ave, Ann Arbor, MI 48104"},
    {"name": "Fresh Market", "address": "1890 Eastgate Ave, Ann Arbor, MI 48104"}
  ];

  const handleStoreSelect = (store: {name: string, address: string}) => {
    console.log('Selected store:', store);
    router.push('/(tabs)/recommended-list');
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Select your store</ThemedText>
        
        <ThemedView style={styles.storeContainer}>
          {stores.map((store, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.storeOption} 
              onPress={() => handleStoreSelect(store)}
            >
              <ThemedText style={styles.storeName}>{store.name}</ThemedText>
              <ThemedText style={styles.storeAddress}>{store.address}</ThemedText>
            </TouchableOpacity>
          ))}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#55627b',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  storeContainer: {
    backgroundColor: '#dce2e7',
    gap: 16,
  },
  storeOption: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#55627b',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#55627b',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
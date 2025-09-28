import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function StoreSelectionScreen() {
  const router = useRouter();
  const { cheapestItems, aiRecommendations, zipcode } = useLocalSearchParams();
  const [stores, setStores] = useState<Array<{name: string, address: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      if (!zipcode) {
        setError('No zipcode provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://35.3.105.155:3000/stores?zipcode=${zipcode}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setStores(data.stores || []);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to fetch stores');
      }
      
      setLoading(false);
    };

    fetchStores();
  }, [zipcode]);

  const handleStoreSelect = (store: {name: string, address: string}) => {
    console.log('Selected store:', store);
    router.push({
      pathname: '/(tabs)/recommended-list',
      params: { 
        cheapestItems,
        selectedStore: JSON.stringify(store),
        aiRecommendations
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Select your store {zipcode && `(${zipcode})`}
        </ThemedText>
        
        {loading ? (
          <ThemedView style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>Loading stores...</ThemedText>
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.messageContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        ) : stores.length === 0 ? (
          <ThemedView style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>No stores found for this zipcode</ThemedText>
          </ThemedView>
        ) : (
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
        )}
        
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
  messageContainer: {
    backgroundColor: '#dce2e7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  messageText: {
    fontSize: 16,
    color: '#55627b',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});
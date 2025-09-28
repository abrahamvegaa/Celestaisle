import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';

export default function ArrivalScreen() {
  const router = useRouter();
  const { groceryItems, selectedStore: selectedStoreParam } = useLocalSearchParams();
  const [routeData, setRouteData] = useState<any>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse selected store from params or use default
  const selectedStore = selectedStoreParam 
    ? JSON.parse(selectedStoreParam as string)
    : {
        name: "Whole Foods Market",
        address: "2500 Liberty St, Ann Arbor, MI 48103"
      };

  useEffect(() => {
    const fetchRouteAndMap = async () => {
      if (groceryItems) {
        try {
          const items = JSON.parse(groceryItems as string);
          
          // Fetch route data
          const routeResponse = await fetch(`http://35.3.105.155:3000/route?items=${items.join(',')}`);
          const routeData = await routeResponse.json();
          setRouteData(routeData);
          
          // Fetch map image
          const mapResponse = await fetch(`http://35.3.105.155:3000/map?items=${items.join(',')}`);
          const mapData = await mapResponse.json();
          if (mapData.image) {
            setMapImage(`data:image/png;base64,${mapData.image}`);
          }
        } catch (error) {
          console.error('Error fetching route and map:', error);
        }
      }
      setLoading(false);
    };

    fetchRouteAndMap();
  }, [groceryItems]);

  const StoreLayout = () => {
    if (!routeData) return null;

    return (
      <ThemedView style={styles.storeLayoutContainer}>
        <ThemedText style={styles.layoutTitle}>Your Shopping Route</ThemedText>
        
        {mapImage ? (
          <View style={styles.mapContainer}>
            <Image 
              source={{ uri: mapImage }}
              style={styles.mapImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <ThemedText style={styles.loadingText}>Generating map...</ThemedText>
        )}
        
        <ThemedText style={styles.pathSequence}>
          Path: {routeData.path?.join(' → ')}
        </ThemedText>
        
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={async () => {
            try {
              const items = JSON.parse(groceryItems as string);
              const response = await fetch(`http://35.3.105.155:3000/wili-route?items=${items.join(',')}`);
              
              if (response.ok) {
                // The endpoint returns a file download, not JSON
                // The zip file is automatically sent to your friend's server
                alert('✅ Route images generated and sent successfully!');
              } else {
                alert('❌ Failed to generate route images');
              }
            } catch (error) {
              console.error('Error generating zip:', error);
              alert('❌ Failed to generate route images');
            }
          }}
        >
          <ThemedText style={styles.downloadButtonText}>Download Route Images</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{selectedStore.name}</ThemedText>
          <ThemedText style={styles.storeAddress}>{selectedStore.address}</ThemedText>
        </ThemedView>
        
        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText style={styles.message}>Loading your route...</ThemedText>
          </ThemedView>
        ) : (
          <>
            <StoreLayout />
            <ThemedView style={styles.messageContainer}>
              <ThemedText style={styles.message}>
                When you arrive, ping a FreeWili!
              </ThemedText>
            </ThemedView>
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dce2e7',
  },
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dce2e7',
    marginTop: 20,
  },
  storeLayoutContainer: {
    backgroundColor: '#dce2e7',
    alignItems: 'center',
    marginTop: 20,
  },
  layoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#55627b',
    marginBottom: 15,
  },
  mapContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#55627b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImage: {
    width: 320,
    height: 240,
  },
  loadingText: {
    fontSize: 14,
    color: '#55627b',
    fontStyle: 'italic',
  },
  pathInfo: {
    fontSize: 14,
    color: '#55627b',
    marginTop: 10,
    fontWeight: '600',
  },
  pathSequence: {
    fontSize: 12,
    color: '#55627b',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  downloadButton: {
    backgroundColor: '#55627b',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
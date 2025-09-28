import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function HomeScreen() {
  const [zipcode, setZipcode] = useState('');
  const [budget, setBudget] = useState('');
  const [groceries, setGroceries] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    console.log('Submit pressed:', { zipcode, budget, groceries });
    setIsLoading(true);
    
    if (groceries.trim()) {
      try {
        const groceryList = groceries
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        if (groceryList.length > 0) {
          const budgetValue = budget.trim() === '' ? '0' : budget;
          const response = await fetch(`http://35.3.105.155:3000/cheapest?items=${groceryList.join(',')}&budget=${budgetValue}`);
          const data = await response.json();
          
          // Handle new response format with cheapest_prices and ai_recommendations
          const cheapestItems = data.cheapest_prices || data;
          const aiRecs = data.ai_recommendations || [];
          
          setIsLoading(false);
          router.push({
            pathname: '/(tabs)/store-selection',
            params: { 
              cheapestItems: JSON.stringify(cheapestItems),
              aiRecommendations: JSON.stringify(aiRecs),
              zipcode: zipcode
            }
          });
          return;
        }
      } catch (error) {
        console.error('Error fetching cheapest prices:', error);
        setIsLoading(false);
      }
    }
    
    setIsLoading(false);
    router.push({
      pathname: '/(tabs)/store-selection',
      params: { 
        zipcode: zipcode
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('@/assets/images/cart-loading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <ThemedText style={styles.loadingText}>
          Optimizing your grocery store visit...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <ThemedView style={styles.formContainer}>
          <ThemedView style={styles.inputContainer}>
            <ThemedText type="subtitle" style={styles.label}>Zipcode</ThemedText>
            <TextInput
              style={styles.input}
              value={zipcode}
              onChangeText={setZipcode}
              placeholder="Enter 5-digit zip code"
              placeholderTextColor="#a2a9b6"
              keyboardType="numeric"
              maxLength={5}
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText type="subtitle" style={styles.label}>Budget</ThemedText>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="(Optional) e.g. '50', '100'"
              placeholderTextColor="#a2a9b6"
              keyboardType="numeric"
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText type="subtitle" style={styles.label}>Groceries</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={groceries}
              onChangeText={setGroceries}
              placeholder="Copy and paste grocery list or start typing here."
              placeholderTextColor="#a2a9b6"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ThemedView>
        </ThemedView>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#dce2e7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#55627b',
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#dce2e7',
  },
  logo: {
    alignSelf: 'center',
    marginTop: 60,
    marginBottom: 40,
    width: 250,
    height: 70,
  },
  formContainer: {
    flex: 1,
    gap: 24,
    backgroundColor: '#dce2e7',
  },
  inputContainer: {
    gap: 8,
    backgroundColor: '#dce2e7',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#55627b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000000',
  },
  textArea: {
    height: 300,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#55627b',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

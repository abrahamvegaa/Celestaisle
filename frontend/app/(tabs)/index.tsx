import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [zipcode, setZipcode] = useState('');
  const [budget, setBudget] = useState('');
  const [groceries, setGroceries] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    console.log('Submit pressed:', { zipcode, budget, groceries });
    router.push('/(tabs)/store-selection');
  };

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
              placeholder="e.g. '50', '100'"
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RecommendedListScreen() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState('option1');
  const router = useRouter();

  const recommendedItems = [
    'Bananas - Organic',
    'Bread - Whole Wheat',
    'Milk - 2% Reduced Fat',
    'Eggs - Large Grade A',
    'Chicken Breast - Boneless',
    'Rice - Jasmine Long Grain',
    'Apples - Honeycrisp',
    'Yogurt - Greek Plain'
  ];

  const pickerOptions = [
    { label: 'Add to Cart', value: 'option1' },
    { label: 'Save for Later', value: 'option2' },
    { label: 'Find Alternative', value: 'option3' }
  ];

  const handleItemPress = (item: string) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handlePickerConfirm = () => {
    console.log(`Selected "${pickerValue}" for item "${selectedItem}"`);
    setModalVisible(false);
    setSelectedItem(null);
    setPickerValue('option1'); // Reset to default
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Recommended List</ThemedText>
        
        <ThemedView style={styles.listContainer}>
          {recommendedItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.listItem} 
              onPress={() => handleItemPress(item)}
            >
              <ThemedText style={styles.itemText}>{item}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
        
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/(tabs)/store-selection')}
          >
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={() => router.push('/(tabs)/arrival')}
          >
            <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Modal with Picker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              What would you like to do with {selectedItem}?
            </ThemedText>
            
            <Picker
              selectedValue={pickerValue}
              onValueChange={(itemValue) => setPickerValue(itemValue)}
              style={styles.picker}
            >
              {pickerOptions.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handlePickerConfirm}
              >
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listContainer: {
    backgroundColor: '#dce2e7',
    gap: 12,
  },
  listItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#55627b',
    textAlign: 'center',
    marginBottom: 20,
  },
  picker: {
    height: 150,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#55627b',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#55627b',
    borderRadius: 8,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    padding: 12,
    backgroundColor: '#55627b',
    borderRadius: 8,
    minWidth: 100,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
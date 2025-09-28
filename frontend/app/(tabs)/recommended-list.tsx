import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RecommendedListScreen() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [brandOptions, setBrandOptions] = useState<Array<{name: string, price: number}>>([]);
  const [selectedBrandOption, setSelectedBrandOption] = useState<string | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<Array<{name: string, price: number}>>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Array<{name: string, price: number}>>([]);
  const [userSelections, setUserSelections] = useState<{[key: string]: {name: string, price: number}}>({});
  const router = useRouter();
  const { cheapestItems, selectedStore, aiRecommendations: aiRecommendationsParam } = useLocalSearchParams();

  useEffect(() => {
    if (cheapestItems) {
      try {
        const items = JSON.parse(cheapestItems as string);
        const formattedItems = items.map(([name, price]: [string, number]) => ({
          name,
          price
        }));
        setRecommendedItems(formattedItems);
        
        // Initialize user selections with cheapest (Generic) options
        const initialSelections: {[key: string]: {name: string, price: number}} = {};
        formattedItems.forEach((item: {name: string, price: number}) => {
          initialSelections[item.name] = {
            name: `Generic ${item.name}`,
            price: item.price
          };
        });
        setUserSelections(initialSelections);
      } catch (error) {
        console.error('Error parsing cheapest items:', error);
        setRecommendedItems([]);
      }
    }

    // Parse AI recommendations (JSON format with prices)
    if (aiRecommendationsParam) {
      try {
        const aiItems = JSON.parse(aiRecommendationsParam as string);
        const formattedAiItems = aiItems.map(([name, price]: [string, number]) => ({
          name,
          price
        }));
        setAiRecommendations(formattedAiItems);
      } catch (error) {
        console.error('Error parsing AI recommendations:', error);
        setAiRecommendations([]);
      }
    }
  }, [cheapestItems, aiRecommendationsParam]);

  const handleItemPress = async (item: {name: string, price: number}) => {
    setSelectedItem(item.name);
    try {
      const response = await fetch(`http://35.3.105.155:3000/options/${item.name}`);
      const options = await response.json();
      setBrandOptions(options);
      setSelectedBrandOption(null);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching brand options:', error);
      setBrandOptions([]);
      setModalVisible(true);
    }
  };

  const handleBrandSelect = (brandOption: {name: string, price: number}) => {
    if (selectedItem) {
      setUserSelections(prev => ({
        ...prev,
        [selectedItem]: {
          name: brandOption.name,
          price: brandOption.price
        }
      }));
    }
    setSelectedBrandOption(brandOption.name);
    console.log(`Selected "${brandOption.name}" at $${brandOption.price}`);
    setModalVisible(false);
    setSelectedItem(null);
    setBrandOptions([]);
    setSelectedBrandOption(null);
  };

  const calculateTotal = () => {
    return Object.values(userSelections).reduce((total, selection) => total + selection.price, 0);
  };

  const addAiRecommendation = (aiItem: {name: string, price: number}) => {
    // Add to user selections if not already present
    if (!userSelections[aiItem.name]) {
      setUserSelections(prev => ({
        ...prev,
        [aiItem.name]: {
          name: `Generic ${aiItem.name}`,
          price: aiItem.price
        }
      }));

      // Add to recommended items list so it appears in "Your List"
      setRecommendedItems(prev => [...prev, aiItem]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Your List</ThemedText>
        
        <ThemedView style={styles.listContainer}>
          {recommendedItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.listItem} 
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemDetails}>
                  <ThemedText style={styles.itemText}>{item.name}</ThemedText>
                  {userSelections[item.name] && (
                    <ThemedText style={styles.selectedOption}>
                      {userSelections[item.name].name}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={styles.priceText}>
                  ${userSelections[item.name]?.price.toFixed(2) || item.price.toFixed(2)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {aiRecommendations.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Recommendations</ThemedText>
            
            <ThemedView style={styles.listContainer}>
              {aiRecommendations.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemDetails}>
                      <ThemedText style={styles.itemText}>{item.name}</ThemedText>
                    </View>
                    <View style={styles.priceAndButton}>
                      <ThemedText style={styles.priceText}>${item.price.toFixed(2)}</ThemedText>
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => addAiRecommendation(item)}
                        disabled={!!userSelections[item.name]}
                      >
                        <ThemedText style={[
                          styles.addButtonText,
                          userSelections[item.name] && styles.addButtonTextDisabled
                        ]}>
                          {userSelections[item.name] ? '✓' : '+'}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ThemedView>
          </>
        )}
        
        <ThemedView style={styles.totalContainer}>
          <ThemedText style={styles.totalLabel}>Total:</ThemedText>
          <ThemedText style={styles.totalPrice}>${calculateTotal().toFixed(2)}</ThemedText>
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
            onPress={() => {
              const selectedItems = Object.keys(userSelections);
              router.push({
                pathname: '/(tabs)/arrival',
                params: { 
                  groceryItems: JSON.stringify(selectedItems),
                  selectedStore
                }
              });
            }}
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
            <ScrollView style={styles.optionsList}>
              {brandOptions.map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.optionItem} 
                  onPress={() => handleBrandSelect(option)}
                >
                  <View style={styles.optionContent}>
                    <ThemedText style={styles.optionText}>{option.name}</ThemedText>
                    <ThemedText style={styles.optionPrice}>${option.price.toFixed(2)}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#55627b',
    marginTop: 30,
    marginBottom: 15,
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
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  selectedOption: {
    fontSize: 14,
    color: '#55627b',
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#55627b',
  },
  priceAndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#55627b',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButtonTextDisabled: {
    color: '#cccccc',
  },
  totalContainer: {
    backgroundColor: '#55627b',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
  optionsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  optionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#55627b',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
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
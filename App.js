import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, Appbar, Card } from 'react-native-paper';
import useFetch from './src/hooks/useFetch'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const API_URL = 'https://api.alquran.cloud/v1/surah'; 

const App = () => {
  const { data, loading, error } = useFetch(API_URL); 
  const [expandedSurah, setExpandedSurah] = useState(null); 
  const [expandedContent, setExpandedContent] = useState(null); 
  const [lastReadSurah, setLastReadSurah] = useState(null); 

  useEffect(() => {
    const fetchLastReadSurah = async () => {
      const storedSurah = await AsyncStorage.getItem('lastReadSurah');
      if (storedSurah) {
        setLastReadSurah(JSON.parse(storedSurah)); 
      }
    };

    fetchLastReadSurah();
  }, []);

  const handleSurahPress = async (surahId) => {
    if (expandedSurah === surahId) {
    
      setExpandedSurah(null);
      setLastReadSurah(null);
    } else {
      // Fetch the Surah content if it is a new Surah
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/en.asad`);
      const result = await response.json();
      setExpandedSurah(surahId); 
      setExpandedContent(result.data);
      setLastReadSurah(result.data); // Update last read Surah
      await AsyncStorage.setItem('lastReadSurah', JSON.stringify(result.data)); // Store last read Surah in Async Storage
    }
  };

  return (
    <PaperProvider>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Quran App" titleStyle={styles.appBarTitle} />
      </Appbar.Header>
      <View style={styles.container}>
        <Text style={styles.greeting}>Assalam u Alaikum</Text>
        <Text style={styles.userName}>Ghulam Abbas</Text>
        
        <View style={styles.lastRead}>
          <Text style={styles.lastReadTitle}>Last Read</Text>
          {lastReadSurah ? ( 
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>{lastReadSurah.name}</Text>
                <Text style={styles.cardAyah}>Ayah No: 1</Text>
              </Card.Content>
            </Card>
          ) : (
            <Text style={styles.noLastReadText}>No Last Read Surah</Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={data} // Use fetched data
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity onPress={() => handleSurahPress(item.number)}>
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.versesCount} Verses - {item.revelationType}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Display selected Surah content if this Surah is expanded */}
                {expandedSurah === item.number && expandedContent && (
                  <View style={styles.selectedSurahContainer}>
                    <Text style={styles.selectedSurahTitle}>{expandedContent.name}</Text>
                    {expandedContent.ayahs.map((ayah) => (
                      <Text key={ayah.number} style={styles.ayahText}>
                        {ayah.text}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
            keyExtractor={item => item.number.toString()}
          />
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#6200ee', 
  },
  appBarTitle: {
    color: '#ffffff', 
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000', 
  },
  userName: {
    fontSize: 20,
    marginBottom: 20,
    color: '#000', 
  },
  lastRead: {
    marginBottom: 20,
  },
  lastReadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  card: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#e8eaf6', 
    borderRadius: 8, 
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardAyah: {
    fontSize: 14,
    color: '#666',
  },
  noLastReadText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  item: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8, // Match the card style
    marginVertical: 5,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Set text color
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  selectedSurahContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
  },
  selectedSurahTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ayahText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 2,
  },
});

export default App;

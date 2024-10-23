// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Attempt to load cached data
        const cachedData = await AsyncStorage.getItem('quranData');
        if (cachedData) {
          setData(JSON.parse(cachedData)); 
        }

        // Fetch data from the API
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();

        // Store data in Async Storage for offline use
        await AsyncStorage.setItem('quranData', JSON.stringify(result.data));
        setData(result.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;

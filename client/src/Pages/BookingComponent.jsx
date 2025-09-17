import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingComponent = () => {
  const [type, setType] = useState('flight'); // 'flight' or 'train'
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // Reverse geocode to get city name (optional)
          axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`)
            .then(res => {
              const city = res.data.results[0].address_components.find(c => c.types.includes('locality'))?.long_name;
              if (city) setOrigin(city);
            });
        },
        (error) => console.error("Error fetching location:", error)
      );
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async (input, setSuggestions) => {
      if (input.length > 2) {
        const placeType = type === 'flight' ? 'airport' : 'train_station';
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=${placeType}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          setSuggestions(response.data.predictions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const originDebounce = setTimeout(() => fetchSuggestions(origin, setOriginSuggestions), 300);
    const destinationDebounce = setTimeout(() => fetchSuggestions(destination, setDestinationSuggestions), 300);

    return () => {
      clearTimeout(originDebounce);
      clearTimeout(destinationDebounce);
    };
  }, [origin, destination, type]);

  // Search for flights/trains
  const handleSearch = async () => {
    if (!origin || !destination || !date) {
      alert("Please fill in all fields to search.");
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("You cannot select a past date. Please select a valid date.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === 'flight' ? '/api/flights' : '/api/trains';
      const response = await axios.get(endpoint, {
        params: { origin, destination, date }
      });
      setOptions(response.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(false);
    }
  };

  // Book a flight/train
  const handleBook = async (option) => {
    try {
      const endpoint = type === 'flight' ? '/api/book-flight' : '/api/book-train';
      const response = await axios.post(endpoint, {
        optionId: option.id,
        userId: 'USER_ID_HERE', // Replace with actual user ID
      });
      alert(`Booking confirmed! Reference: ${response.data.bookingId}`);
    } catch (error) {
      console.error("Error booking:", error);
    }
  };

  return (
    <div>
      <h2>Book {type === 'flight' ? 'Flight' : 'Train'}</h2>
      <div>
        <button onClick={() => setType('flight')}>Flight</button>
        <button onClick={() => setType('train')}>Train</button>
      </div>
      <div>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          {originSuggestions.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ccc', listStyle: 'none', padding: 0, margin: 0, zIndex: 10 }}>
              {originSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  onClick={() => {
                    setOrigin(suggestion.description);
                    setOriginSuggestions([]);
                  }}
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          {destinationSuggestions.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ccc', listStyle: 'none', padding: 0, margin: 0, zIndex: 10 }}>
              {destinationSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  onClick={() => {
                    setDestination(suggestion.description);
                    setDestinationSuggestions([]);
                  }}
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={handleSearch} disabled={loading || !origin || !destination || !date}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div>
        {options.map((option) => (
          <div key={option.id}>
            <p>{option.departure} - {option.arrival}</p>
            <p>Price: {option.price}</p>
            <button onClick={() => handleBook(option)}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingComponent;

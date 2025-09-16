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

  // Search for flights/trains
  const handleSearch = async () => {
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
        <input type="text" placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={handleSearch} disabled={loading}>
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

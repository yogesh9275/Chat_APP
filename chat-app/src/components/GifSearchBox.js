import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../css/GifSearchBox.css"; // Import the CSS file for custom styles

const GifSearchBox = ({ onGifSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey = 'Bt5190x3bgAXhp3rdtOHHZhn1qXivxY0'; // Replace with your Giphy API key
  const randomGiphyApiUrl = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=50`;
  const searchGiphyApiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchTerm}&limit=100`;

  // Fetch random GIFs on component mount
  useEffect(() => {
    const fetchRandomGifs = async () => {
      try {
        const response = await axios.get(randomGiphyApiUrl);
        setGifs(response.data.data);
      } catch (error) {
        console.error('Error fetching random GIFs:', error);
      }
    };

    fetchRandomGifs();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await axios.get(searchGiphyApiUrl);
      setGifs(response.data.data);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gif-search-popup">
      <button className="gif-search-close-button" onClick={onClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          fill="currentColor"
          className="bi bi-x-lg"
          viewBox="0 0 16 16"
        >
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
        </svg>
      </button>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search GIFs"
        className="gif-search-input"
      />
      <button onClick={handleSearch} className="gif-search-button">
        Search
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="gif-results">
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.original.url}
              alt={gif.title}
              className="gif-result"
              onClick={() => {
                console.log('Selected GIF URL:', gif.images.original.url);
                onGifSelect(gif.images.original.url);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GifSearchBox;

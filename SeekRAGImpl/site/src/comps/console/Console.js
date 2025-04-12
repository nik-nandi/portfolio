import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Console.css';
// eslint-disable-next-line
const api_key = 'AIzaSyBUO3fBdbkenuy1go2XANkSvLNxdl32OQo';

// Typewriter animation component
function TypewriterMessage({ text, speed = 30 }) {
  const [displayText, setDisplayText] = useState('');
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index++;
      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed]);
  return <span>{displayText}</span>;
}

function Console({ onEnter }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  function handleChange(e) {
    setInputText(e.target.value);
  }

  async function handleSubmit() {
    if (onEnter) {
      onEnter(inputText);
    }

    setMessages(prevMessages => [
      ...prevMessages,
      { text: inputText, sender: 'user' }
    ]);

    const query = inputText;
    setInputText('');
    setIsLoading(true);

    const queryObj = {
      query,
      api_key
    };

    try {
      const response = await axios.post(
        'http://localhost:8000/research/',
        queryObj,
      );
      const result = response.data;
      console.log('Result:', result);
      if (result) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: result, sender: 'response', type: 'success' }
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'No research data found.', sender: 'response', type: 'error' }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Error: Failed to fetch research data.', sender: 'response', type: 'error' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className="console">
      <div className="console-messages" ref={consoleRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`console-message ${message.sender} ${message.type ? message.type : ''}`}
          >
            <TypewriterMessage text={message.text} />
          </div>
        ))}
        {isLoading && (
          <div className="console-message response loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
      <div className="console-input-area">
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter text..."
        />
      </div>
    </div>
  );
}

export default Console;
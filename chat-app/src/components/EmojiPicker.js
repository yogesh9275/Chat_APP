// EmojiPicker.js
import React from 'react';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

const EmojiPicker = ({ onSelect }) => {
  return (
    <div style={{ position: 'absolute', bottom: '50px', zIndex: '1000' }}>
      <Picker onSelect={onSelect} />
    </div>
  );
};

export default EmojiPicker;

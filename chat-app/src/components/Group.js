import React, { useState, useEffect } from 'react';
import '../css/Sidebar.css'; // Adjust as necessary for styling

const Group = ({ senderUsername, lastMessage, messageCount }) => {
  // Initialize local state for message count
  const [localMessageCount, setLocalMessageCount] = useState(messageCount);

  // Effect to update local state when prop changes
  useEffect(() => {
    setLocalMessageCount(messageCount);
  }, [messageCount]);

  // Determine the display text for the counter
  const counterText = localMessageCount > 99 ? '99+' : localMessageCount;

  // Click handler to reset message count
  const handleChatClick = () => {
    setLocalMessageCount(0); // Reset message count in local state
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="sidebar-chats">
          <div className="chat" onClick={handleChatClick}>
            <div className="chat-avatar">G</div>
            <div className="sidebar-info">
              <div className="chat-name">Group 1</div>
              <div className="chat-last-message">{senderUsername}: {lastMessage}</div>
            </div>
            {localMessageCount > 0 && (
          <div className="message-counter">
            {counterText}
          </div>
        )}
          </div>
          {/* Repeat for other chats */}
        </div>
      </div>
    </div>
  );
};


export default Group;

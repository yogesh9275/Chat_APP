import React, { useState, useEffect } from "react";
import {
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
} from "react-icons/fa";
import { MdMusicNote } from "react-icons/md";
import "../css/Sidebar.css";

const Sidebar = ({
  isVisible,
  senderUsername,
  lastMessage,
  messageCount,
  setChatName,
}) => {
  const [chats, setChats] = useState([]);

  const addOrUpdateChat = (username, message, count) => {
    setChats((prevChats) => {
      const existingChatIndex = prevChats.findIndex(
        (chat) => chat.username === username
      );

      if (existingChatIndex > -1) {
        const updatedChats = [...prevChats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          lastMessage: message,
          messageCount: count,
        };
        return updatedChats;
      } else {
        return [
          ...prevChats,
          {
            username: username,
            lastMessage: message,
            messageCount: count,
          },
        ];
      }
    });
  };

  const handleChatClick = (username) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.username === username ? { ...chat, messageCount: 0 } : chat
      )
    );

    if (setChatName) {
      setChatName(username);
    }
  };

  useEffect(() => {
    if (senderUsername) {
      addOrUpdateChat(senderUsername, lastMessage, messageCount);
    }
  }, [senderUsername, lastMessage, messageCount]);

  const renderIconForMessage = (message) => {
    console.log(message);
    if (message.includes(".pdf")) {
      return <FaFilePdf />;
    } else if (message.includes(".doc") || message.includes(".docx")) {
      return <FaFileWord />;
    } else if (message.includes(".xls") || message.includes(".xlsx")) {
      return <FaFileExcel />;
    } else if (message.includes(".ppt") || message.includes(".pptx")) {
      return <FaFilePowerpoint />;
    } else if (message.includes(".zip")) {
      return <FaFileArchive />;
    } else if (message.includes(".mp3")) {
      console.log("mp3 file is Faound.");
      return <MdMusicNote />;
    } else if (message.includes(".gif") || message.includes(".webp")) {
      return <FaFileImage />;
    } else if (
      message.includes(".mp4") ||
      message.includes(".avi") ||
      message.includes(".mov")
    ) {
      return <FaFileVideo />;
    } else {
      return null; // Return null if no matching file type is found
    }
  };

  return (
    <div className={`sidebar-container ${isVisible ? "visible" : ""}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="sidebar-chats">
          {chats.map((chat, index) => (
            <div
              className="chat"
              key={index}
              onClick={() => handleChatClick(chat.username)}
            >
              <div className="chat-avatar">{chat.username.charAt(0)}</div>
              <div className="sidebar-info">
                <div className="chat-name">{chat.username}</div>
                <div className="chat-last-message">
                  <span className="sidebar-text">
                    <span className="icon-column">
                      {renderIconForMessage(chat.lastMessage)}
                    </span>
                    <span className="message-column">{chat.lastMessage}</span>
                  </span>
                </div>
              </div>
              {chat.messageCount > 0 && (
                <div className="message-counter">
                  {chat.messageCount > 99 ? "99+" : chat.messageCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import ChatWindow from "./ChatWindow";
import Group from "./Group";
import "../css/ChatApp.css";
import Settings from "./Settings"; // Ensure correct path
import imageCompression from "browser-image-compression"; // Import the compression library


// Create socket instance with query parameters
function ChatApp({ username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [activeComponent, setActiveComponent] = useState("chat");
  const [chatName, setChatName] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fileName, setFileName] = useState(""); // State to hold the video file name

  const senderUsernameRef = useRef(username);

  // Initialize socket instance with query parameters and increased buffer size
  const socket = useRef(
    io(`http://localhost:5000`, {
      query: {
        chatType: activeComponent === "group" ? "group" : "chat",
        username,
      },
      transports: ["websocket"], // Ensure WebSocket transport is used
      maxHttpBufferSize: 1 * 1024 * 1024 * 1024, // Increase the buffer size to handle large files
    })
  ).current;

  // Function to check screen size and set sidebar visibility
  const updateSidebarVisibility = () => {
    // console.log(window.innerWidth);
    if (window.innerWidth < 800) {
      setSidebarVisible(false);
    } else {
      setSidebarVisible(true);
    }
  };

  const toggleSidebarVisibility = () => {
    setSidebarVisible((prevState) => !prevState);
  };

  // Use effect to handle screen size changes on mount and window resize
  useEffect(() => {
    updateSidebarVisibility(); // Check screen size on mount
    window.addEventListener("resize", updateSidebarVisibility); // Update on resize

    // Clean up listener on component unmount
    return () => {
      window.removeEventListener("resize", updateSidebarVisibility);
    };
  }, []);

  useEffect(() => {
    if (username) {
      console.log("Connected to the server from", username);

      // Handle socket errors
      socket.on("error", (error) => {
        console.error("Socket error:", error);
        socket.disconnect(); // Disconnect on error
      });

      // Handle incoming messages
      socket.on("receiveMessage", (message) => {
        console.log("Receiving message:", message);
        if (message.sender !== username) {
          console.log("Message received:", message);
          setReceiverUsername(message.sender); // Set the receiver username
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "text", data: message, received: true },
          ]);
          setMessageCount((prevCount) => prevCount + 1);
        }
      });

      // Handle incoming files
      socket.on("receiveFile", (fileData) => {
        console.log("Receiving file:", fileData);
        if (fileData.sender !== username) {
          console.log("File received:", fileData.fileName);
          console.log("File size:", formatFileSize(fileData.fileContent.byteLength)); // Assuming fileContent is an ArrayBuffer or similar

          setFileName(fileData.fileName);
          setReceiverUsername(fileData.sender); // Set the receiver username
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "file", data: fileData, received: true },
          ]);
          setMessageCount((prevCount) => prevCount + 1);
        }
      });

      // Clean up socket listeners on component unmount
      return () => {
        socket.off(); // Remove all event listeners
        console.log("Disconnected from the server");
      };
    }
  }, [username]);

  const handleSendMessage = (text) => {
    if (text.trim()) {
      const messageData = { sender: username, text };
      console.log("Sending message:", messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "text", data: messageData, received: false },
      ]);
      socket.emit("sendMessage", messageData);
      setMessage("");
      setMessageCount(0);
    }
  };


 // Helper function to format file size
const formatFileSize = (sizeInBytes) => {
  if (sizeInBytes >= 1e9) {
    return (sizeInBytes / 1e9).toFixed(2) + " GB";
  } else if (sizeInBytes >= 1e6) {
    return (sizeInBytes / 1e6).toFixed(2) + " MB";
  } else if (sizeInBytes >= 1e3) {
    return (sizeInBytes / 1e3).toFixed(2) + " KB";
  } else {
    return sizeInBytes + " bytes";
  }
};

  
  const handleSendFile = async (file) => {
    if (file) {
      try {
        // Check if the file size is within the acceptable limit
        if (file.size >1 * 1024 * 1024 * 1024) {
          // 10 MB in bytes
          console.error("File size exceeds the 10 MB limit.");
          return;
        }
  
        let processedFile = file;
  
        // Check if the file is an image and compress it if true
        if (file.type.startsWith("image/")) {
          const options = {
            maxSizeMB: 1, // Set max size to 1MB
            maxWidthOrHeight: 1920, // Optional: limit the image size
            useWebWorker: true, // Optional: use web worker for faster compression
          };
  
          processedFile = await imageCompression(file, options);
          console.log("Original file size:", formatFileSize(file.size));
          console.log("Compressed file size:", formatFileSize(processedFile.size));
        }
  
        const reader = new FileReader();
  
        // When the compressed file is successfully read
        reader.onload = (e) => {
          const fileData = {
            sender: username,
            fileName: processedFile.name,
            fileContent: e.target.result, // The compressed file content as an ArrayBuffer
            fileType: processedFile.type, // Include file type to handle different files (e.g., GIFs)
          };
  
          // Log file information for debugging
          console.log("Sending file:", fileData.fileName);
          console.log("File size:", formatFileSize(processedFile.size));
          setFileName(fileData.fileName);
          // Update the messages state with the compressed file data
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "file", data: fileData, received: false },
          ]);
  
          // Emit the compressed file data through socket
          socket.emit("sendFile", fileData);
  
          // Reset the message count
          setMessageCount(0);
        };
  
        // Handle any errors during file reading
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
        };
  
        // Read the compressed file as an ArrayBuffer
        reader.readAsArrayBuffer(processedFile);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    } else {
      console.error("No file provided.");
    }
  };
  

  // Function to handle chat name update
  const handleChatNameChange = (username) => {
    setChatName(username);
    // Optionally, send a message or update other state here
  };

  // Get the last message or file received
  const getLastMessage = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      return lastMessage.type === "text"
        ? lastMessage.data.text
        : lastMessage.data.fileName;
    }
    return "";
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const renderComponent = () => {
    switch (activeComponent) {
      case "chat":
        return (
          <Sidebar
            isSidebarVisible={isSidebarVisible}
            setChatName={handleChatNameChange}
            senderUsername={receiverUsername}
            lastMessage={getLastMessage()}
            messageCount={messageCount}
          />
        );
      case "group":
        return (
          <Group
            isVisible={isSidebarVisible}
            senderUsername={receiverUsername}
            lastMessage={getLastMessage()}
            messageCount={messageCount}
          />
        );
      default:
        return (
          <Sidebar
            isVisible={isSidebarVisible}
            setChatName={handleChatNameChange}
            senderUsername={receiverUsername}
            lastMessage={getLastMessage()}
            messageCount={messageCount}
          />
        );
    }
  };
  return (
    <div className="chat-app">
      <RightSidebar
        setActiveComponent={setActiveComponent}
        username={username}
        toggleSidebarVisibility={toggleSidebarVisibility}
        onOpenSettings={openSettings} // Open settings popup
      />
      <div className="main-content">
        {isSidebarVisible && renderComponent()}
      </div>
      <ChatWindow
        key={activeComponent}
        chatType={activeComponent}
        messages={messages}
        handleSendMessage={handleSendMessage}
        handleSendFile={handleSendFile}
        username={username}
        senderUsername={senderUsernameRef.current}
        chatName={chatName}
        fileName={fileName}
      />
      {isSettingsOpen && (
        <Settings onClose={closeSettings} />
      )}
    </div>
  );
}

export default ChatApp;

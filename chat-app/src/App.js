import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ChatApp from './components/ChatApp';
import LoginModal from './components/LoginModal';
// import Login from './components/Login';
import Signup from './components/Register'; // Import the Signup component
import ForgottenPassword from './components/ForgottenPassword';
import './App.css';

function App() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [chatType, setChatType] = useState('');
  const [showModal, setShowModal] = useState(true);
  const handleLoginSubmit = (user, type) => {
    setUsername(user);
    setChatType(type);
    setShowModal(false);
  };

  // const handleLogin = () => {
  //   setIsLoggedIn(true);
  // };
  

  return (
    <div className="App">
      <Routes>
        {/* Route for the ForgottenPassword page */}
        <Route path="/ForgottenPassword" element={<ForgottenPassword />} />

        {/* Route for the Signup page */}
        <Route path="/Signup" element={<Signup />} />

        
         {/* Route for ChatApp */}
        <Route
          path="/"
          element={showModal ? (
            <LoginModal onSubmit={handleLoginSubmit} />
          ) : (
            <ChatApp username={username}/>
          )}
        />

        {/* Default route handling */}
        {/* <Route
          path="/"
          element={isLoggedIn ? <ChatApp /> : <Login onLogin={handleLogin} />}
        /> */}
      </Routes>
    </div>
  );
}

export default App;

import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Card, Avatar, Input, Typography } from 'antd';
import 'antd/dist/reset.css'; // For Ant Design v5 or later
import './index.css'

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

// Create a WebSocket client to connect to the WebSocket server
const client = new W3CWebSocket('ws://127.0.0.1:8000');

export default class App extends Component {

  state = {
    userName: '', // Stores the username of the logged-in user
    isLoggedIn: false, // Indicates if the user is logged in
    messages: [] // Array to store the chat messages
  }

  // Function to handle sending messages
  onButtonClicked = (value) => {
    // Send the message to the WebSocket server
    client.send(JSON.stringify({
      type: "message", // Type of message
      msg: value, // Message content
      user: this.state.userName // Username of the sender
    }));
    // Clear the input field after sending the message
    this.setState({ searchVal: '' })
  }

  // Lifecycle method that runs after the component is mounted
  componentDidMount() {
    // Define what happens when the WebSocket connection is opened
    client.onopen = () => {
      console.log('WebSocket Client Connected'); // Log connection success
    };

    // Define what happens when a message is received from the WebSocket server
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data); // Parse the message data
      console.log('got reply! ', dataFromServer); // Log the received message

      // If the received message is of type 'message', update the state with the new message
      if (dataFromServer.type === "message") {
        this.setState((state) =>
          ({
            messages: [...state.messages, // Append new message to the existing messages
            {
              msg: dataFromServer.msg, // Message content
              user: dataFromServer.user // Sender's username
            }]
          })
        );
      }
    };
  }

  render() {
    return (
      <div className="main" id='wrapper'>
        {this.state.isLoggedIn ?
          <div>
            <div className="title">
              <Text id="main-heading" type="secondary" style={{ fontSize: '36px' }}>
                Websocket Chat: {this.state.userName}
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50 }} id="messages">
              {/* Render messages from the state */}
              {this.state.messages.map(message =>
                <Card key={message.msg} style={{ width: 300, margin: '16px 4px 0 4px', alignSelf: this.state.userName === message.user ? 'flex-end' : 'flex-start' }} loading={false}>
                  <Meta
                    avatar={
                      <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                        {message.user[0].toUpperCase()}
                      </Avatar>
                    }
                    title={message.user + ":"}
                    description={message.msg}
                  />
                </Card>
              )}
            </div>
            <div className="bottom">
              <Search
                placeholder="input message and send"
                enterButton="Send"
                value={this.state.searchVal}
                size="large"
                onChange={(e) => this.setState({ searchVal: e.target.value })} // Update input value in state
                onSearch={value => this.onButtonClicked(value)} // Handle send button click
              />
            </div>
          </div>
          :
          <div style={{ padding: '200px 40px' }}>
            <Search
              placeholder="Enter Username"
              enterButton="Login"
              size="large"
              onSearch={value => this.setState({ isLoggedIn: true, userName: value })} // Set login status and username
            />
          </div>
        }
      </div>
    )
  }
}

// Render the App component into the DOM
ReactDOM.render(<App />, document.getElementById('root'));

import React, { useEffect, useState } from 'react';
import { requestNotificationPermission } from './firebase-config';
import { getMessaging, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDN4mT6ORqGpO6__pHViQJWfDzYIDtfUOo",
  authDomain: "twilio-bpn.firebaseapp.com",
  projectId: "twilio-bpn",
  storageBucket: "twilio-bpn.firebasestorage.app",
  messagingSenderId: "673282561695",
  appId: "1:673282561695:web:7aa61c176fd0f1ba44f4aa",
  measurementId: "G-865BXZQ1D9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

function App() {
  const [notifications, setNotifications] = useState([]); // Changed to array for history
  const [token, setToken] = useState('');
  const [topic, setTopic] = useState('');
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    targetTopic: ''
  });
  const [topics] = useState(['vip_customer', 'abandoned_cart', 'offers']);
  const [subscribedTopics, setSubscribedTopics] = useState([]);

  useEffect(() => {
    const getToken = async () => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setToken(fcmToken);
        // Send token to backend
        await axios.post('http://localhost:3001/register-token', { token: fcmToken });
      }
    };
    getToken();

    // Direct message listener implementation
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received foreground notification: ', payload);
      setNotifications(prev => [{
        title: payload.notification.title,
        body: payload.notification.body,
        timestamp: new Date().toLocaleString()
      }, ...prev].slice(0, 10)); // Keep last 10 notifications
    });

    // Clean up listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleSubscribe = async (topic) => {
    try {
      await axios.post('http://localhost:3001/subscribe', { token, topic });
      setSubscribedTopics([...subscribedTopics, topic]);
      alert(`Subscribed to ${topic} successfully!`);
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('Failed to subscribe to topic');
    }
  };

  const handleUnsubscribe = async (topic) => {
    try {
      await axios.post('http://localhost:3001/unsubscribe', { token, topic });
      setSubscribedTopics(subscribedTopics.filter(t => t !== topic));
      alert(`Unsubscribed from ${topic} successfully!`);
    } catch (error) {
      console.error('Unsubscribe error:', error);
      alert('Failed to unsubscribe from topic');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/send-notification', {
        topic: notificationData.targetTopic,
        title: notificationData.title,
        body: notificationData.body
      });
      setNotificationData({ title: '', body: '', targetTopic: '' });
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Send notification error:', error);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Firebase Push Notifications</h1>
      
      {/* Notification Status */}
      <div style={{ marginBottom: '20px' }}>
        {token ? (
          <p style={{ color: 'green' }}>✓ Notifications enabled!</p>
        ) : (
          <p style={{ color: 'red' }}>Please enable notifications</p>
        )}
      </div>

      {/* Topic Subscription Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Topic Subscriptions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {topics.map((topic) => (
            <div key={topic} style={{ 
              border: '1px solid #ccc', 
              padding: '10px', 
              borderRadius: '5px',
              backgroundColor: subscribedTopics.includes(topic) ? '#e6ffe6' : 'white'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>{topic}</p>
              {subscribedTopics.includes(topic) ? (
                <button 
                  onClick={() => handleUnsubscribe(topic)}
                  style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}
                >
                  Unsubscribe
                </button>
              ) : (
                <button 
                  onClick={() => handleSubscribe(topic)}
                  style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}
                >
                  Subscribe
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Send Notification Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Send Notification</h2>
        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select 
            value={notificationData.targetTopic} 
            onChange={(e) => setNotificationData({ ...notificationData, targetTopic: e.target.value })}
            style={{ padding: '8px', marginBottom: '10px' }}
            required
          >
            <option value="">Select Topic</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Notification Title"
            value={notificationData.title}
            onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
            style={{ padding: '8px' }}
            required
          />
          
          <textarea
            placeholder="Notification Body"
            value={notificationData.body}
            onChange={(e) => setNotificationData({ ...notificationData, body: e.target.value })}
            style={{ padding: '8px', minHeight: '100px' }}
            required
          />
          
          <button 
            type="submit"
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '10px', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Send Notification
          </button>
        </form>
      </div>

      {/* Notifications History */}
      <div style={{ marginTop: '20px' }}>
        <h2>Notifications History</h2>
        {notifications.length === 0 ? (
          <p>No notifications received yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((notif, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{notif.title}</h4>
                <p style={{ margin: '0 0 5px 0' }}>{notif.body}</p>
                <small style={{ color: '#666' }}>{notif.timestamp}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

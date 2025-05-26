import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDN4mT6ORqGpO6__pHViQJWfDzYIDtfUOo",
  authDomain: "twilio-bpn.firebaseapp.com",
  projectId: "twilio-bpn",
  storageBucket: "twilio-bpn.firebasestorage.app",
  messagingSenderId: "673282561695",
  appId: "1:673282561695:web:7aa61c176fd0f1ba44f4aa",
  measurementId: "G-865BXZQ1D9"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BD67F2thQyCmttZKD0OghUJyKtGE0TK037DepWezVR_P7RVYcoznr7XltRnF1bNK0uU_4rPONZUh0NrOUw__xAQ' // You'll need to replace this with your actual VAPID key
      });
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
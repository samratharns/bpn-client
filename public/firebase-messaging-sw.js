importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDN4mT6ORqGpO6__pHViQJWfDzYIDtfUOo",
  authDomain: "twilio-bpn.firebaseapp.com",
  projectId: "twilio-bpn",
  storageBucket: "twilio-bpn.firebasestorage.app",
  messagingSenderId: "673282561695",
  appId: "1:673282561695:web:7aa61c176fd0f1ba44f4aa",
  measurementId: "G-865BXZQ1D9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    tag: 'notification-' + Date.now(), // Unique tag for each notification
    requireInteraction: true, // Keep notification visible until user interacts
    data: payload.data // Include any additional data
  };

  console.log('Showing background notification:', { title: notificationTitle, ...notificationOptions });
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
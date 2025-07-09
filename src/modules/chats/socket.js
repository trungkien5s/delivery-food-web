import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Join room theo order
socket.emit('joinRoom', 'ORDER_ID');

// Nhận tin nhắn mới
socket.on('newMessage', (msg) => {
  console.log('Tin nhắn mới:', msg);
  // hiển thị ra UI
});

// Gửi tin nhắn
socket.emit('sendMessage', {
  user: 'USER_ID',
  shipper: 'SHIPPER_ID',
  order: 'ORDER_ID',
  senderRole: 'user', // hoặc 'shipper'
  message: 'Tôi đang đứng ngoài cổng!',
});

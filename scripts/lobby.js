/**
 * Lobby Page Script
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Handle search input
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const roomCards = document.querySelectorAll('.room-card');
      
      roomCards.forEach(card => {
        const roomName = card.querySelector('.room-name').textContent.toLowerCase();
        const hostName = card.querySelector('.host-name').textContent.toLowerCase();
        
        if (roomName.includes(searchTerm) || hostName.includes(searchTerm)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Handle join room buttons
  const joinButtons = document.querySelectorAll('.join-room-btn');
  joinButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const roomCard = e.target.closest('.room-card');
      const roomName = roomCard.querySelector('.room-name').textContent;
      alert(`Joining room: ${roomName}`);
    });
  });

  // Handle Create Room button
  const createRoomBtn = document.querySelector('.create-room-btn');
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
      alert('Create Room modal - To be implemented');
    });
  }

  // Handle chat send
  const sendBtn = document.querySelector('.send-btn');
  const chatInput = document.querySelector('.chat-input input');
  
  if (sendBtn && chatInput) {
    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (message) {
        // Add message to chat (demo functionality)
        const chatMessages = document.querySelector('.chat-messages');
        const newMessage = document.createElement('div');
        newMessage.className = 'chat-message';
        
        // Create elements safely to prevent XSS
        const avatar = document.createElement('img');
        avatar.src = 'https://via.placeholder.com/28x28/B4FF39/000000?text=Y';
        avatar.alt = 'You';
        avatar.className = 'msg-avatar';
        
        const msgContent = document.createElement('div');
        msgContent.className = 'msg-content';
        
        const msgHeader = document.createElement('div');
        msgHeader.className = 'msg-header';
        
        const msgAuthor = document.createElement('span');
        msgAuthor.className = 'msg-author';
        msgAuthor.textContent = 'You';
        
        const msgTime = document.createElement('span');
        msgTime.className = 'msg-time';
        msgTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const msgText = document.createElement('div');
        msgText.className = 'msg-text';
        msgText.textContent = message; // Use textContent to prevent XSS
        
        msgHeader.appendChild(msgAuthor);
        msgHeader.appendChild(msgTime);
        msgContent.appendChild(msgHeader);
        msgContent.appendChild(msgText);
        newMessage.appendChild(avatar);
        newMessage.appendChild(msgContent);
        
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Handle friend search
  const friendSearchInput = document.querySelector('.search-friends input');
  if (friendSearchInput) {
    friendSearchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const friendItems = document.querySelectorAll('.friend-item');
      
      friendItems.forEach(item => {
        const friendName = item.querySelector('.friend-name').textContent.toLowerCase();
        
        if (friendName.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Handle add friend button
  const addFriendBtn = document.querySelector('.add-friend-btn');
  if (addFriendBtn) {
    addFriendBtn.addEventListener('click', () => {
      alert('Add Friend functionality - To be implemented');
    });
  }
});

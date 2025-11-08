/**
 * Active Game Page Script
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

document.addEventListener('DOMContentLoaded', () => {
  let selectedCards = [];
  const maxCards = 2;

  // Handle card selection
  const cards = document.querySelectorAll('.game-card.selectable');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('selected')) {
        // Deselect card
        card.classList.remove('selected');
        const badge = card.querySelector('.selected-badge');
        if (badge) badge.remove();
        selectedCards = selectedCards.filter(c => c !== card);
        updateSelectedNumbers();
      } else if (selectedCards.length < maxCards) {
        // Select card
        card.classList.add('selected');
        selectedCards.push(card);
        const badge = document.createElement('div');
        badge.className = 'selected-badge';
        badge.textContent = selectedCards.length;
        card.appendChild(badge);
      }
      updateSubmitButton();
    });
  });

  // Update selected card numbers
  function updateSelectedNumbers() {
    selectedCards.forEach((card, index) => {
      const badge = card.querySelector('.selected-badge');
      if (badge) {
        badge.textContent = index + 1;
      }
    });
  }

  // Update submit button
  function updateSubmitButton() {
    const submitBtn = document.querySelector('.submit-cards-btn');
    if (submitBtn) {
      submitBtn.textContent = `Submit Cards (${selectedCards.length}/${maxCards})`;
      submitBtn.disabled = selectedCards.length !== maxCards;
    }
  }

  // Handle submit button
  const submitBtn = document.querySelector('.submit-cards-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (selectedCards.length === maxCards) {
        const cardTexts = selectedCards.map(card => 
          card.querySelector('.card-text').textContent
        );
        alert(`Submitted cards:\n1. ${cardTexts[0]}\n2. ${cardTexts[1]}`);
      }
    });
  }

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
        const chatMessages = document.querySelector('.chat-messages');
        const newMessage = document.createElement('div');
        newMessage.className = 'chat-message';
        
        // Create elements safely to prevent XSS
        const avatar = document.createElement('img');
        avatar.src = 'https://via.placeholder.com/28x28/00ffff/000000?text=Y';
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

  // Handle reaction buttons
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  reactionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const emoji = button.textContent;
      // Add reaction animation
      button.style.transform = 'scale(1.3)';
      setTimeout(() => {
        button.style.transform = '';
      }, 200);
      
      // Could send reaction to other players here
      console.log('Sent reaction:', emoji);
    });
  });

  // Simulate timer countdown
  const timerValue = document.querySelector('.timer-value');
  if (timerValue) {
    let seconds = 48;
    setInterval(() => {
      seconds--;
      if (seconds < 0) seconds = 60;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerValue.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      
      // Change color when time is running out
      if (seconds <= 10) {
        timerValue.style.color = '#ff0000';
      } else {
        timerValue.style.color = 'var(--brand-green)';
      }
    }, 1000);
  }

  // Initialize submit button state
  updateSubmitButton();
});

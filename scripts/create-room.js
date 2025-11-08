/**
 * Create Room Script
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const roomNameInput = document.getElementById('room-name');
  const gameModeSelect = document.getElementById('game-mode');
  const maxPlayersInput = document.getElementById('max-players');
  const privateRoomCheckbox = document.getElementById('private-room');
  const passwordProtectedCheckbox = document.getElementById('password-protected');
  const passwordField = document.querySelector('.password-field');
  
  // Preview elements
  const previewName = document.getElementById('preview-name');
  const previewPlayers = document.getElementById('preview-players');
  const previewMode = document.getElementById('preview-mode');
  const previewPrivacy = document.getElementById('preview-privacy');
  
  // Update preview on input changes
  if (roomNameInput) {
    roomNameInput.addEventListener('input', (e) => {
      previewName.textContent = e.target.value || 'Chaos & Laughter Central';
    });
  }
  
  if (maxPlayersInput) {
    maxPlayersInput.addEventListener('input', (e) => {
      previewPlayers.textContent = `1/${e.target.value} players`;
    });
  }
  
  if (gameModeSelect) {
    gameModeSelect.addEventListener('change', (e) => {
      const modeIcons = {
        'classic': '🎮',
        'chaos': '🌪️',
        'easy': '😊',
        'hardcore': '💀'
      };
      const modeName = e.target.options[e.target.selectedIndex].text;
      const icon = modeIcons[e.target.value] || '🎮';
      previewMode.textContent = `${icon} ${modeName}`;
    });
  }
  
  if (privateRoomCheckbox) {
    privateRoomCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        previewPrivacy.textContent = '🔒 Private';
      } else {
        previewPrivacy.textContent = '🌐 Public';
      }
    });
  }
  
  // Toggle password field visibility
  if (passwordProtectedCheckbox) {
    passwordProtectedCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        passwordField.style.display = 'block';
        document.getElementById('room-password').required = true;
      } else {
        passwordField.style.display = 'none';
        document.getElementById('room-password').required = false;
      }
    });
  }
  
  // Handle form submission
  const form = document.getElementById('create-room-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Collect form data
      const formData = {
        roomName: document.getElementById('room-name').value,
        description: document.getElementById('room-description').value,
        gameType: document.getElementById('game-type').value,
        gameMode: document.getElementById('game-mode').value,
        maxPlayers: parseInt(document.getElementById('max-players').value),
        maxRounds: parseInt(document.getElementById('max-rounds').value),
        turnTime: parseInt(document.getElementById('turn-time').value),
        judgeRotation: document.getElementById('judge-rotation').value,
        isPrivate: document.getElementById('private-room').checked,
        passwordProtected: document.getElementById('password-protected').checked,
        password: document.getElementById('room-password').value,
        friendsOnly: document.getElementById('friends-only').checked,
        cardPacks: {
          default: document.getElementById('pack-default').checked,
          nsfw: document.getElementById('pack-nsfw').checked,
          memes: document.getElementById('pack-memes').checked,
          tech: document.getElementById('pack-tech').checked,
          custom: document.getElementById('pack-custom').checked
        },
        contentFilter: {
          profanity: document.getElementById('filter-profanity').checked,
          political: document.getElementById('filter-political').checked,
          religious: document.getElementById('filter-religious').checked,
          sexual: document.getElementById('filter-sexual').checked
        }
      };
      
      console.log('Creating room with settings:', formData);
      
      // Generate room code
      const roomCode = generateRoomCode();
      
      // Show success message
      alert(`Room created successfully!\n\nRoom Name: ${formData.roomName}\nRoom Code: ${roomCode}\n\nRedirecting to game lobby...`);
      
      // Redirect to lobby (in a real app, this would go to the actual room)
      setTimeout(() => {
        window.location.href = 'lobby.html';
      }, 1000);
    });
  }
  
  // Generate random room code
  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '#';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  // Update Create Room button behavior in other pages
  const createRoomBtn = document.querySelector('.create-room-btn:not(.active)');
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
      window.location.href = 'create-room.html';
    });
  }
});

/**
 * AI Playground Script
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sample card data for demo purposes
  const samplePrompts = [
    "When I'm feeling down, nothing cheers me up like _____ and _____.",
    "The secret to a happy relationship is _____ and _____.",
    "I never leave home without _____ and _____.",
    "My therapist says I have an unhealthy obsession with _____.",
    "The new dating app that matches you based on _____ is surprisingly effective.",
    "Scientists have finally discovered the cure for _____: _____!",
    "If I could only eat one thing for the rest of my life, it would be _____.",
    "My grandmother always warned me about _____, but I didn't listen.",
    "The most embarrassing thing in my browser history is _____.",
    "I'm banned from _____ for life because of _____."
  ];

  const sampleResponses = [
    "A tactical nuclear strike",
    "Unlimited breadsticks",
    "Dancing like nobody's watching",
    "My collection of regrets",
    "Existential dread",
    "The healing power of memes",
    "Aggressive finger guns",
    "Passive-aggressive sticky notes",
    "Unrealistic expectations",
    "My credit card debt",
    "Spotify's algorithmic judgment",
    "The forbidden snacks under the sink",
    "Questionable life choices",
    "That thing we don't talk about",
    "Emotional damage",
    "Chaotic neutral energy",
    "A concerning amount of coffee",
    "Social anxiety but make it spicy",
    "The will to live (sold separately)",
    "Internet arguments at 3 AM"
  ];

  // Handle prompt generation
  const promptGenerateBtn = document.querySelector('.generator-card:first-child .generate-btn');
  const promptCardsContainer = document.getElementById('prompt-cards');
  
  if (promptGenerateBtn) {
    promptGenerateBtn.addEventListener('click', () => {
      const theme = document.getElementById('prompt-theme').value;
      const style = document.getElementById('prompt-style').value;
      const count = parseInt(document.getElementById('prompt-count').value);
      
      generateCards('prompts', count, promptCardsContainer, samplePrompts);
    });
  }

  // Handle response generation
  const responseGenerateBtn = document.querySelector('.generator-card:last-child .generate-btn');
  const responseCardsContainer = document.getElementById('response-cards');
  
  if (responseGenerateBtn) {
    responseGenerateBtn.addEventListener('click', () => {
      const theme = document.getElementById('response-theme').value;
      const style = document.getElementById('response-style').value;
      const count = parseInt(document.getElementById('response-count').value);
      
      generateCards('responses', count, responseCardsContainer, sampleResponses);
    });
  }

  // Generate cards function
  function generateCards(type, count, container, dataArray) {
    container.innerHTML = '';
    container.classList.add('active');
    
    // Simulate AI generation delay
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'generated-card-item';
    loadingMessage.innerHTML = `<span class="card-text">🤖 Generating ${type}...</span>`;
    container.appendChild(loadingMessage);
    
    setTimeout(() => {
      container.innerHTML = '';
      
      // Generate random cards
      const selectedCards = [];
      for (let i = 0; i < count && i < dataArray.length; i++) {
        const randomIndex = Math.floor(Math.random() * dataArray.length);
        selectedCards.push(dataArray[randomIndex]);
      }
      
      selectedCards.forEach((cardText, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'generated-card-item';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'card-text';
        textSpan.textContent = cardText;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'card-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'card-action-btn save';
        saveBtn.textContent = '💾';
        saveBtn.title = 'Save card';
        saveBtn.addEventListener('click', () => {
          saveBtn.textContent = '✓';
          setTimeout(() => {
            saveBtn.textContent = '💾';
          }, 1000);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-action-btn delete';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Delete card';
        deleteBtn.addEventListener('click', () => {
          cardElement.style.opacity = '0';
          setTimeout(() => {
            cardElement.remove();
          }, 300);
        });
        
        actionsDiv.appendChild(saveBtn);
        actionsDiv.appendChild(deleteBtn);
        
        cardElement.appendChild(textSpan);
        cardElement.appendChild(actionsDiv);
        
        container.appendChild(cardElement);
      });
    }, 1500);
  }

  // Handle saved pack actions
  const packCards = document.querySelectorAll('.pack-card');
  packCards.forEach(packCard => {
    const viewBtn = packCard.querySelector('.btn-secondary:nth-child(1)');
    const editBtn = packCard.querySelector('.btn-secondary:nth-child(2)');
    const deleteBtn = packCard.querySelector('.btn-danger');
    const useBtn = packCard.querySelector('.btn-primary');
    
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const packName = packCard.querySelector('h3').textContent;
        alert(`Viewing pack: ${packName}`);
      });
    }
    
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const packName = packCard.querySelector('h3').textContent;
        alert(`Editing pack: ${packName}`);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const packName = packCard.querySelector('h3').textContent;
        if (confirm(`Are you sure you want to delete "${packName}"?`)) {
          packCard.style.opacity = '0';
          packCard.style.transform = 'scale(0.9)';
          setTimeout(() => {
            packCard.remove();
          }, 300);
        }
      });
    }
    
    if (useBtn) {
      useBtn.addEventListener('click', () => {
        const packName = packCard.querySelector('h3').textContent;
        alert(`Using pack "${packName}" in next game!`);
      });
    }
  });

  // Handle Create Room button
  const createRoomBtn = document.querySelector('.create-room-btn');
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
      window.location.href = 'create-room.html';
    });
  }
});

/**
 * Onboarding flow handler
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

class OnboardingManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.formData = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupRadioCards();
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        // Not authenticated, redirect to login
        window.location.href = '/';
        return;
      }

      const user = await response.json();
      
      // Check if already onboarded
      const onboardingResponse = await fetch('/api/user/onboarding-status');
      if (onboardingResponse.ok) {
        const status = await onboardingResponse.json();
        if (status.completed) {
          // Already onboarded, redirect to arena
          window.location.href = '/arena';
          return;
        }
      }

      // Pre-fill display name if not set
      const displayNameInput = document.getElementById('displayName');
      if (displayNameInput && user.username) {
        displayNameInput.value = user.username;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/';
    }
  }

  setupEventListeners() {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('onboarding-form');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousStep());
    }

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  setupRadioCards() {
    // Make preference cards clickable for radio buttons
    const radioCards = document.querySelectorAll('.preference-card');
    radioCards.forEach(card => {
      card.addEventListener('click', () => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          // Remove selected class from siblings
          const parent = card.parentElement;
          parent.querySelectorAll('.preference-card').forEach(c => {
            c.classList.remove('selected');
          });
          card.classList.add('selected');
        }
      });
    });

    // Initial selection state
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
      const card = radio.closest('.preference-card');
      if (card) {
        card.classList.add('selected');
      }
    });
  }

  validateStep(step) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    const errorMessage = document.getElementById('error-message');
    
    if (errorMessage) {
      errorMessage.classList.remove('show');
      errorMessage.textContent = '';
    }

    if (!currentStepElement) return true;

    // Step 1 validation
    if (step === 1) {
      const displayName = document.getElementById('displayName');
      const experience = document.querySelector('input[name="experience"]:checked');

      if (!displayName || !displayName.value.trim()) {
        this.showError('Please enter a display name');
        return false;
      }

      if (displayName.value.trim().length < 3) {
        this.showError('Display name must be at least 3 characters');
        return false;
      }

      if (!experience) {
        this.showError('Please select your gaming experience level');
        return false;
      }
    }

    // Step 2 validation (optional - no required fields)
    if (step === 2) {
      // All fields are optional, no validation needed
    }

    // Step 3 validation (optional - no required fields)
    if (step === 3) {
      // All fields are optional, no validation needed
    }

    return true;
  }

  showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.add('show');
    }
  }

  collectFormData() {
    const formData = {
      displayName: document.getElementById('displayName')?.value || '',
      bio: document.getElementById('bio')?.value || '',
      experience: document.querySelector('input[name="experience"]:checked')?.value || '',
      gameModes: Array.from(document.querySelectorAll('input[name="gameModes"]:checked')).map(el => el.value),
      preferredPlayerCount: document.getElementById('preferredPlayerCount')?.value || '5-6',
      playstyle: Array.from(document.querySelectorAll('input[name="playstyle"]:checked')).map(el => el.value),
      contentFilter: document.getElementById('contentFilter')?.value || 'mild',
      privacy: Array.from(document.querySelectorAll('input[name="privacy"]:checked')).map(el => el.value),
      notifications: Array.from(document.querySelectorAll('input[name="notifications"]:checked')).map(el => el.value)
    };

    return formData;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateStep(this.currentStep)) {
      return;
    }

    const formData = this.collectFormData();

    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      // Redirect to arena
      window.location.href = '/arena';
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      this.showError('Failed to save your preferences. Please try again.');
    }
  }

  nextStep() {
    if (!this.validateStep(this.currentStep)) {
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateStepDisplay();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  }

  updateStepDisplay() {
    // Update form steps
    document.querySelectorAll('.form-step').forEach(step => {
      step.classList.remove('active');
    });
    const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
    if (currentStepElement) {
      currentStepElement.classList.add('active');
    }

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
      const stepNum = parseInt(indicator.getAttribute('data-step'));
      indicator.classList.remove('active', 'completed');
      
      if (stepNum < this.currentStep) {
        indicator.classList.add('completed');
      } else if (stepNum === this.currentStep) {
        indicator.classList.add('active');
      }
    });

    // Update buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (prevBtn) {
      prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
    }

    if (nextBtn) {
      nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
    }

    if (submitBtn) {
      submitBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    // Clear error message
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.classList.remove('show');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Initialize onboarding manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.onboardingManager = new OnboardingManager();
});

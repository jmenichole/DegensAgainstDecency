/**
 * Feedback Survey System
 * 
 * Collects user feedback after game completion to improve the platform
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

class FeedbackSurvey {
  constructor() {
    this.surveyData = {
      gameId: null,
      userId: null,
      timestamp: null,
      ratings: {},
      comment: ''
    };
    this.hasShown = false;
  }

  /**
   * Show the feedback survey after a game completes
   */
  show(gameId, userId) {
    // Only show once per game
    if (this.hasShown) return;
    
    // Check if user has already submitted feedback for this game
    const submittedKey = `feedback_submitted_${gameId}`;
    if (localStorage.getItem(submittedKey)) {
      return;
    }
    
    this.surveyData.gameId = gameId;
    this.surveyData.userId = userId;
    this.surveyData.timestamp = new Date().toISOString();
    this.hasShown = true;
    
    this.createSurveyModal();
  }

  /**
   * Create the survey modal HTML
   */
  createSurveyModal() {
    // Remove existing modal if any
    const existing = document.getElementById('feedback-survey-modal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'feedback-survey-modal';
    modal.className = 'modal feedback-survey-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal-content feedback-survey-content">
        <div class="survey-header">
          <h2>🎮 Thanks for Playing!</h2>
          <p>Help us improve by sharing your feedback</p>
        </div>
        
        <div class="survey-body">
          <div class="survey-question">
            <label>How would you rate the time between rounds?</label>
            <div class="rating-container" data-question="roundTiming">
              ${this.createStarRating('roundTiming')}
            </div>
          </div>
          
          <div class="survey-question">
            <label>How helpful were the game instructions?</label>
            <div class="rating-container" data-question="instructionHelpfulness">
              ${this.createStarRating('instructionHelpfulness')}
            </div>
          </div>
          
          <div class="survey-question">
            <label>How would you rate the overall game experience?</label>
            <div class="rating-container" data-question="overallExperience">
              ${this.createStarRating('overallExperience')}
            </div>
          </div>
          
          <div class="survey-question">
            <label>Any additional comments or suggestions?</label>
            <textarea 
              id="feedback-comment" 
              class="feedback-comment" 
              placeholder="Share your thoughts, suggestions, or report any issues..."
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div class="survey-footer">
          <button class="secondary-button" onclick="feedbackSurvey.skip()">Skip</button>
          <button class="cta-button" onclick="feedbackSurvey.submit()">Submit Feedback</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupEventListeners();
  }

  /**
   * Create star rating HTML
   */
  createStarRating(questionId) {
    let html = '<div class="star-rating">';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="star" data-question="${questionId}" data-rating="${i}" onclick="feedbackSurvey.setRating('${questionId}', ${i})">★</span>`;
    }
    html += '</div>';
    return html;
  }

  /**
   * Set up event listeners for the survey
   */
  setupEventListeners() {
    // Allow clicking outside to close (but record as skipped)
    const modal = document.getElementById('feedback-survey-modal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.skip();
      }
    });
  }

  /**
   * Set a rating for a question
   */
  setRating(questionId, rating) {
    this.surveyData.ratings[questionId] = rating;
    
    // Update UI to show selected rating
    const stars = document.querySelectorAll(`[data-question="${questionId}"]`);
    stars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= rating) {
        star.classList.add('selected');
      } else {
        star.classList.remove('selected');
      }
    });
  }

  /**
   * Submit the feedback
   */
  async submit() {
    // Get comment
    const commentField = document.getElementById('feedback-comment');
    if (commentField) {
      this.surveyData.comment = commentField.value.trim();
    }

    // Validate that at least one rating is provided
    if (Object.keys(this.surveyData.ratings).length === 0) {
      alert('Please provide at least one rating before submitting.');
      return;
    }

    try {
      // Send feedback to server
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.surveyData)
      });

      if (response.ok) {
        // Mark as submitted
        localStorage.setItem(`feedback_submitted_${this.surveyData.gameId}`, 'true');
        
        // Show thank you message
        this.showThankYou();
      } else {
        console.error('Failed to submit feedback');
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Store locally if server fails
      this.storeLocalFeedback();
      this.showThankYou();
    }
  }

  /**
   * Store feedback locally if server submission fails
   */
  storeLocalFeedback() {
    const localFeedback = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
    localFeedback.push(this.surveyData);
    localStorage.setItem('pending_feedback', JSON.stringify(localFeedback));
    localStorage.setItem(`feedback_submitted_${this.surveyData.gameId}`, 'true');
  }

  /**
   * Skip the survey
   */
  skip() {
    // Mark as skipped so we don't show again
    localStorage.setItem(`feedback_submitted_${this.surveyData.gameId}`, 'skipped');
    this.close();
  }

  /**
   * Show thank you message
   */
  showThankYou() {
    const modal = document.getElementById('feedback-survey-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="modal-content feedback-survey-content">
          <div class="survey-header">
            <h2>🎉 Thank You!</h2>
            <p>Your feedback helps us make the game better for everyone</p>
          </div>
          <div class="survey-body" style="text-align: center; padding: 20px;">
            <p style="font-size: 1.1em;">We appreciate you taking the time to share your thoughts!</p>
          </div>
          <div class="survey-footer">
            <button class="cta-button" onclick="feedbackSurvey.close()">Close</button>
          </div>
        </div>
      `;
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        this.close();
      }, 3000);
    }
  }

  /**
   * Close the survey modal
   */
  close() {
    const modal = document.getElementById('feedback-survey-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Reset for next game
   */
  reset() {
    this.hasShown = false;
    this.surveyData = {
      gameId: null,
      userId: null,
      timestamp: null,
      ratings: {},
      comment: ''
    };
  }
}

// Initialize global feedback survey instance
window.feedbackSurvey = new FeedbackSurvey();

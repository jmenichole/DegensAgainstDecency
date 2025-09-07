import React, { useState } from 'react';

interface Card {
  type: 'question' | 'answer';
  text: string;
  submittedBy: string;
}

const App: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [questionUser, setQuestionUser] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answerUser, setAnswerUser] = useState('');

  const submitCard = (type: 'question' | 'answer') => {
    const text = type === 'question' ? questionText : answerText;
    const user = type === 'question' ? questionUser : answerUser;

    if (!text.trim()) {
      alert("Text can't be empty!");
      return;
    }

    const card: Card = {
      type,
      text,
      submittedBy: user || "Anonymous"
    };

    // Store in localStorage since we can't use a server on GitHub Pages
    const existingCards = JSON.parse(localStorage.getItem('degensCards') || '[]');
    existingCards.push(card);
    localStorage.setItem('degensCards', JSON.stringify(existingCards));

    alert("Card sent to the void. May it haunt the game forever.");
    
    // Clear the form
    if (type === 'question') {
      setQuestionText('');
      setQuestionUser('');
    } else {
      setAnswerText('');
      setAnswerUser('');
    }
  };

  return (
    <>
      <section className="header">
        <h1>Degens Against Decency</h1>
        <p>Help us build the most cooked af card game. Don't get weird weird. Regular weird only.</p>
      </section>

      <section className="forms">
        <div className="card-form">
          <h2>Submit a Question</h2>
          <textarea 
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question"
          />
          <input 
            value={questionUser}
            onChange={(e) => setQuestionUser(e.target.value)}
            placeholder="Discord Username (optional)" 
          />
          <button onClick={() => submitCard('question')}>Submit</button>
        </div>

        <div className="card-form">
          <h2>Submit an Answer</h2>
          <textarea 
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Enter your answer"
          />
          <input 
            value={answerUser}
            onChange={(e) => setAnswerUser(e.target.value)}
            placeholder="Discord Username (optional)" 
          />
          <button onClick={() => submitCard('answer')}>Submit</button>
        </div>
      </section>
    </>
  );
};

export default App;
/**
 * Card submission script
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

function submitCard(type) {
  const text = document.getElementById(`${type}Text`).value;
  const user = document.getElementById(`${type}User`).value;

  if (!text.trim()) return alert("Text can't be empty!");

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, text, submittedBy: user || "Anonymous" })
  })
  .then(res => res.json())
  .then(data => {
    alert("Card sent to the void. May it haunt the game forever.");
    document.getElementById(`${type}Text`).value = '';
    document.getElementById(`${type}User`).value = '';
  })
  .catch(err => alert("Something went wrong. Try again."));
}

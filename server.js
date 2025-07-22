const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

app.post('/submit', (req, res) => {
  const { type, text, submittedBy } = req.body;

  if (!text || !type) return res.status(400).send("Invalid submission");

  const newCard = { type, text, submittedBy };

  fs.readFile('deck.json', (err, data) => {
    if (err) return res.status(500).send("Could not read file");

    const deck = JSON.parse(data);
    deck.push(newCard);

    fs.writeFile('deck.json', JSON.stringify(deck, null, 2), (err) => {
      if (err) return res.status(500).send("Could not save card");
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

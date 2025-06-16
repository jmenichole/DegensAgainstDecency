document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('casino-list');
  const res = await fetch('affiliates.json');
  const casinos = await res.json();
  const top = document.getElementById('top-casino');
  let topClick = { name: '', count: 0 };

  const gifs = [
    "https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif",
    "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
    "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif"
  ];
  let clickCount = 0;

  casinos.forEach(casino => {
    const lastCollected = localStorage.getItem(casino.name);
    const now = Date.now();
    const diff = lastCollected ? (now - parseInt(lastCollected)) : Infinity;
    const expired = diff > 24 * 3600000;

    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = casino.name;

    const btnCell = document.createElement('td');
    const btn = document.createElement('a');
    btn.textContent = expired ? '🎁 Collect Bonus' : '✅ Collected';
    btn.href = expired ? casino.link : '#';
    btn.target = '_blank';
    btn.className = 'support-button';
    if (!expired) btn.style.opacity = '0.5';

    btn.onclick = () => {
      if (!expired) return false;
      localStorage.setItem(casino.name, Date.now().toString());
      clickCount++;
      if (clickCount % 5 === 0) {
        const gif = gifs[Math.floor(Math.random() * gifs.length)];
        const popup = document.getElementById('gif-popup');
        document.getElementById('popup-gif').src = gif;
        popup.style.display = 'block';
        setTimeout(() => popup.style.display = 'none', 4000);
      }
    };
    btnCell.appendChild(btn);

    const note = document.createElement('td');
    note.textContent = casino.note || '';

    row.append(name, btnCell, note);
    list.appendChild(row);

    const clicks = parseInt(localStorage.getItem(casino.name + '_clicks') || '0');
    if (clicks > topClick.count) topClick = { name: casino.name, count: clicks };
  });

  top.textContent = topClick.name || casinos[0].name;
});

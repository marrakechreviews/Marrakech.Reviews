require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

const mockSoccerData = {
  response: [
    {
      fixture: { id: 1, status: { long: "First Half", elapsed: 45 } },
      league: { id: 2, name: "Champions League", logo: "https://media.api-sports.io/football/leagues/2.png" },
      teams: {
        home: { id: 1, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
        away: { id: 2, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      },
      goals: { home: 1, away: 0 },
    },
    {
      fixture: { id: 2, status: { long: "Second Half", elapsed: 75 } },
      league: { id: 3, name: "Europa League", logo: "https://media.api-sports.io/football/leagues/3.png" },
      teams: {
        home: { id: 3, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
        away: { id: 4, name: "Atalanta", logo: "https://media.api-sports.io/football/teams/499.png" },
      },
      goals: { home: 2, away: 2 },
    },
  ],
};

app.get('/api/soccer', async (req, res) => {
  if (process.env.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY') {
    console.log('Using mock data because RAPIDAPI_KEY is a placeholder.');
    return res.json(mockSoccerData);
  }

  try {
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      params: {
        league: '2', // UEFA Champions League
        season: new Date().getFullYear().toString()
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from RapidAPI:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from RapidAPI' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

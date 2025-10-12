import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SoccerPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/soccer');
        setMatches(response.data.response);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Live Soccer Matches</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error fetching data: {error.message}</p>}
      {!loading && !error && (
        <div>
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <div key={match.fixture.id} className="border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <img src={match.league.logo} alt={match.league.name} className="w-5 h-5 mr-2" />
                      <span className="text-sm font-semibold">{match.league.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{match.fixture.status.long}</span>
                  </div>
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center w-1/3">
                      <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-10 h-10 mb-1" />
                      <span className="text-center text-sm">{match.teams.home.name}</span>
                    </div>
                    <div className="text-xl font-bold">
                      {match.goals.home} - {match.goals.away}
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                      <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-10 h-10 mb-1" />
                      <span className="text-center text-sm">{match.teams.away.name}</span>
                    </div>
                  </div>
                  <div className="text-center text-sm text-green-600 mt-2">
                    {match.fixture.status.elapsed}'
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No live matches at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SoccerPage;

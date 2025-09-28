import React, { useState, useEffect } from 'react';

const AiMatching = ({ userId }) => {
  const [matches, setMatches] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [recommendations, setRecommendations] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [matchStats, setMatchStats] = useState({
    pendingMatches: 0,
    viewedMatches: 0,
    likedMatches: 0,
    totalMatches: 0
  });

  useEffect(() => {
    fetchMatches();
    fetchPendingMatches();
    fetchMatchStats();
    fetchStudyRecommendations();
  }, [userId]);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/ai/matches/${userId}`);
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPendingMatches = async () => {
    try {
      const response = await fetch(`/api/ai/matches/${userId}/pending`);
      if (response.ok) {
        const pendingData = await response.json();
        setPendingMatches(pendingData);
      }
    } catch (error) {
      console.error('Error fetching pending matches:', error);
    }
  };

  const fetchMatchStats = async () => {
    try {
      const response = await fetch(`/api/ai/stats/${userId}`);
      if (response.ok) {
        const stats = await response.json();
        setMatchStats(stats);
      }
    } catch (error) {
      console.error('Error fetching match stats:', error);
    }
  };

  const fetchStudyRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/study-recommendations/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availableTimeSlots: ['Monday 14:00-16:00', 'Wednesday 10:00-12:00', 'Friday 15:00-17:00']
        })
      });
      
      if (response.ok) {
        const recommendationData = await response.text();
        setRecommendations(recommendationData);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations('Unable to load personalized recommendations at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAction = async (matchId, action) => {
    try {
      const response = await fetch(`/api/ai/matches/${matchId}/${action}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchMatches();
        fetchPendingMatches();
        fetchMatchStats();
      }
    } catch (error) {
      console.error(`Error ${action}ing match:`, error);
    }
  };

  const getCompatibilityColor = (score) => {
    if (score >= 0.8) return 'text-brand-blue-700 bg-brand-blue-100';
    if (score >= 0.6) return 'text-brand-yellow-700 bg-brand-yellow-100';
    return 'text-neutral-600 bg-neutral-100';
  };

  const getCompatibilityLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Low Compatibility';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">🤖 AI-Powered Matching</h2>
        <div className="text-sm text-neutral-600">
          Powered by Gemini AI
        </div>
      </div>

      {/* Match Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{matchStats.pendingMatches}</div>
          <div className="text-sm text-blue-800">Pending</div>
        </div>
        <div className="bg-brand-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-brand-blue-600">{matchStats.likedMatches}</div>
          <div className="text-sm text-brand-blue-800">Liked</div>
        </div>
        <div className="bg-brand-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-brand-blue-600">{matchStats.totalMatches}</div>
          <div className="text-sm text-brand-blue-800">Total Matches</div>
        </div>
        <div className="bg-brand-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-brand-yellow-600">{matchStats.viewedMatches}</div>
          <div className="text-sm text-brand-yellow-800">Viewed</div>
        </div>
      </div>

      {/* AI Study Recommendations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          💡 Personalized Study Recommendations
          {loading && <span className="ml-2 text-sm text-neutral-600">Loading...</span>}
        </h3>
        <div className="bg-gradient-to-r from-brand-blue-50 to-brand-blue-100 border border-brand-blue-200 p-4 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Generating recommendations...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {recommendations || 'Click refresh to get personalized study recommendations based on your profile and schedule.'}
            </div>
          )}
          <button
            onClick={fetchStudyRecommendations}
            disabled={loading}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : '🔄 Refresh Recommendations'}
          </button>
        </div>
      </div>

      {/* Pending AI Matches */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          🎯 New AI Matches
          <span className="ml-2 bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded-full">
            {pendingMatches.length}
          </span>
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {pendingMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No new matches found</p>
              <p className="text-sm mt-1">Check back later for AI-generated study partner suggestions</p>
            </div>
          ) : (
            pendingMatches.map(match => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{match.suggestedUser?.name || 'Study Partner'}</h4>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(match.compatibilityScore)}`}>
                      {(match.compatibilityScore * 100).toFixed(0)}% - {getCompatibilityLabel(match.compatibilityScore)}
                    </div>
                    {match.distanceKm && (
                      <div className="text-sm text-gray-600 mt-1">
                        📍 {match.distanceKm.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-brand-yellow-50 border border-brand-yellow-200 p-3 rounded mb-3">
                  <div className="text-sm font-medium text-brand-yellow-800 mb-1">🤖 AI Analysis:</div>
                  <div className="text-sm text-brand-yellow-700">
                    {match.aiReasoning || 'AI analysis shows good compatibility based on your study preferences and schedule.'}
                  </div>
                </div>

                {/* Shared Interests */}
                {match.sharedInterests && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">🎯 Shared Interests:</div>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(match.sharedInterests).map((interest, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMatchAction(match.id, 'like')}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  >
                    👍 Like
                  </button>
                  <button
                    onClick={() => handleMatchAction(match.id, 'view')}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    👀 View Profile
                  </button>
                  <button
                    onClick={() => handleMatchAction(match.id, 'reject')}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    👎 Pass
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* All Matches History */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📋 Match History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {matches.slice(0, 10).map(match => (
            <div key={match.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{match.suggestedUser?.name || 'Study Partner'}</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getCompatibilityColor(match.compatibilityScore)}`}>
                  {(match.compatibilityScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  match.status === 'LIKED' ? 'bg-green-100 text-green-800' :
                  match.status === 'VIEWED' ? 'bg-blue-100 text-blue-800' :
                  match.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {match.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(match.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={fetchPendingMatches}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
        >
          🔄 Find New Matches
        </button>
        <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
          ⚙️ AI Preferences
        </button>
        <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition">
          📊 Compatibility Report
        </button>
      </div>
    </div>
  );
};

export default AiMatching;
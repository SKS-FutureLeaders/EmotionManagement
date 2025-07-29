import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image } from 'react-native';
import { Platform } from 'react-native';

// Simplified animations that won't overwhelm young children
const animationStyles = `
@keyframes gentle-float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.float-animation {
  animation: gentle-float 3s ease-in-out infinite;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-in-out forwards;
}

.badge-hover {
  transition: all 0.3s ease;
}

.badge-hover:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.spinner {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  border: 6px solid #e0e0e0;
  border-top: 6px solid #4A90E2;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.badge-hover {
  transition: all 0.3s ease;
}

.badge-hover:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  border-color: #4CAF50;
}

.badge-hover:hover img {
  transform: scale(1.1) rotate(5deg);
}
`;

const containerStyles = {
  small: {
    maxWidth: '100%',
    padding: '10px',
    margin: '0',
  },
  medium: {
    maxWidth: '90%',
    padding: '15px',
    margin: '0 auto',
  },
  large: {
    maxWidth: '1400px',
    padding: '20px',
    margin: '0 auto',
  }
};

const cardStyles = {
  small: {
    width: '100%',
    minWidth: 'unset',
    margin: '10px 0',
  },
  medium: {
    width: '48%',
    minWidth: '300px',
    margin: '10px',
  },
  large: {
    width: '32%',
    minWidth: '350px',
    margin: '0',
  }
};

const badgeGridStyles = {
  small: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    padding: '15px',
  },
  medium: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '30px',
    padding: '20px',
  },
  large: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '40px',
    padding: '30px',
  }
};

const mediaQueryStyles = `
  /* Mobile styles */
  @media (max-width: 768px) {
    .container {
      ${Object.entries(containerStyles.small).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
    .stat-card {
      ${Object.entries(cardStyles.small).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
    .badge-grid {
      ${Object.entries(badgeGridStyles.small).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
  }

  /* Tablet styles */
  @media (min-width: 769px) and (max-width: 1024px) {
    .container {
      ${Object.entries(containerStyles.medium).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
    .stat-card {
      ${Object.entries(cardStyles.medium).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
    .badge-grid {
      ${Object.entries(badgeGridStyles.medium).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
  }

  /* Desktop styles */
  @media (min-width: 1025px) {
    .container {
      ${Object.entries(containerStyles.large).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
    .stat-card {
      ${Object.entries(cardStyles.large).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
    .badge-grid {
      ${Object.entries(badgeGridStyles.large).map(([key, value]) => `${key}: ${value};`).join('\n')}
    }
  }
`;

interface ChildData {
  name: string;
  streaks: number;
  maxStreak: number;
  leadershipScore: number;
  badges?: number[];
  league: string;  // Add this line
}

// Map badge numbers to image assets with descriptions
const badgeImages = {
  1: require("../../assets/badges/1.png"),  // First login
  2: require("../../assets/badges/2.png"),  // Leadership score 1000
  3: require("../../assets/badges/3.png"),  // Leadership score 5000
  4: require("../../assets/badges/4.png"),  // Leadership score 15000
  5: require("../../assets/badges/5.png"),  // Max streak 7 days
  6: require("../../assets/badges/6.png"),  // Max streak 30 days
  7: require("../../assets/badges/7.png"),  // Max streak 365 days
  8: require("../../assets/badges/8.png"),  // Completion of goal 1
  9: require("../../assets/badges/9.png"),  // First weekly journal
  10: require("../../assets/badges/10.jpg"), // First avatar created
  11: require("../../assets/badges/11.png"), // First anger thermometer
  12: require("../../assets/badges/12.png"), // First hi to your anger
  13: require("../../assets/badges/13.png")  // First know your anger
};

// Add this near the top of the file with other imports
const leagueImages: Record<string, any> = {
  bronze: require("../../assets/leagues/bronze.png"),
  silver: require("../../assets/leagues/silver.png"),
  gold: require("../../assets/leagues/gold.png"),
  platinum: require("../../assets/leagues/platinum.png"),
  crystal: require("../../assets/leagues/crystal.png"),
  leader: require("../../assets/leagues/leader.png")
};

// Add a fallback handler for missing images
const handleLeagueImageError = (league: string) => {
  console.error(`Failed to load league image for ${league}`);
  return leagueImages.bronze; // Fallback to bronze if image fails to load
};

const Streaks = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [badgeErrors, setBadgeErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);

        if (!token) {
          setError('No authentication token found. Please login again.');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }

         const API_URL = Platform.OS === "web" 
          ? "http://localhost:5000" 
          : "http://192.168.206.225:5000";
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        // First try the child profile endpoint
        try {
          const response = await axios.get(`${API_URL}/childauth/getprofile`, {
            headers: {
              'Authorization': formattedToken,
              'Content-Type': 'application/json'
            }
          });

          console.log('Child profile response:', response.data);
          
          if (response.data) {
            const childInfo = {
              name: response.data.name || 'Unknown',
              streaks: response.data.streaks || 0,
              maxStreak: response.data.maxStreak || 0,
              leadershipScore: response.data.leadershipScore || 0,
              badges: Array.isArray(response.data.badges) ? response.data.badges : [],
              league: response.data.league || 'bronze'
            };
            setChildData(childInfo);
            return;
          }
        } catch (childError) {
          console.log('Not a child profile, trying parent profile...', childError);
          // Don't throw an error yet, try parent profile first
        }

        // If child profile fails, try parent profile
        try {
          const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': formattedToken,
              'Content-Type': 'application/json'
            }
          });

          console.log('Parent profile response:', response.data);
          
          if (response.data && response.data.user) {
            const parentInfo = {
              name: response.data.user.first_name || 'Unknown',
              streaks: 0,
              maxStreak: 0,
              leadershipScore: 0,
              badges: [],
              league: 'parent'
            };
            setChildData(parentInfo);
            return;
          } else {
            throw new Error('Invalid parent profile data format');
          }
        } catch (parentError) {
          console.error('Parent profile error:', parentError);
          
          // Only throw the error if both attempts fail
          const errorMessage = parentError.response?.status === 401 
            ? 'Authentication failed. Please login again.'
            : parentError.response?.status === 404
              ? 'Profile not found. Please check your credentials.'
              : 'Failed to fetch profile data. Please try again later.';
          
          throw new Error(errorMessage);
        }

      } catch (err) {
        console.error('Error type:', typeof err);
        console.error('Detailed error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, []);

  // Safety check: If childData is still null but loading is false, display error
  useEffect(() => {
    if (!loading && !childData && !error) {
      setError('Failed to load data. Please try again.');
    }
  }, [loading, childData, error]);

  // Handle image error
  const handleBadgeImageError = (badgeId: number) => {
    setBadgeErrors(prev => ({ ...prev, [badgeId]: true }));
  };

  console.log('Component state:', { loading, childData, error });

  // Simple badge rendering with minimal animations
  const renderBadges = (badges: number[] = []) => {
    if (!badges || badges.length === 0) {
      return (
        <div className="text-center bg-white p-6 rounded-xl shadow-md my-6 fade-in" style={{
          border: '2px dashed #ddd',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <div className="text-5xl mb-4">🎮</div>
          <div className="text-2xl font-bold text-blue-600 mb-3">No badges yet!</div>
          <p className="text-lg text-gray-600 mt-2">Play games to earn badges!</p>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '40px',
        padding: '30px',
        width: '100%',
        justifyItems: 'center',
        alignItems: 'start'
      }} className="fade-in badge-grid">
        {badges.map((badgeId, index) => (
          <div 
            key={badgeId}
            className="badge-hover"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              width: '240px',  // Increased width
              height: '280px', // Increased height
              margin: '0',    // Remove default margins
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #e0e0e0',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: getBadgeColor(badgeId),
              }}
            />
            <div 
              className="relative"
              style={{
                width: '120px',
                height: '120px',
                marginBottom: '15px',
                borderRadius: '20px',
                padding: '15px',
                background: `linear-gradient(135deg, ${getBadgeColor(badgeId)}20, ${getBadgeColor(badgeId)}40)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
            >
              <Image
                source={badgeImages[badgeId as keyof typeof badgeImages]}
                style={{ 
                  width: 90, 
                  height: 90,
                  transition: 'transform 0.3s ease'
                }}
                resizeMode="contain"
                onError={() => handleBadgeImageError(badgeId)}
              />
            </div>
            <div className="text-center">
              <span 
                className="font-bold text-lg"
                style={{
                  color: '#333',
                  display: 'block',
                  marginTop: '5px'
                }}
              >
                {getBadgeName(badgeId)}
              </span>
              <span 
                style={{
                  color: '#666',
                  fontSize: '13px',
                  display: 'block',
                  marginTop: '5px',
                  padding: '0 10px'
                }}
              >
                {getBadgeDescription(badgeId)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Softer badge colors that are still bright and fun
  const getBadgeColor = (badgeId: number) => {
    const colors = [
      '#5DADE2', '#F4D03F', '#2ECC71', '#E74C3C', '#9B59B6', 
      '#F39C12', '#1ABC9C', '#3498DB', '#E67E22', '#27AE60'
    ];
    return colors[badgeId % colors.length];
  };

  // Simple, clear badge names that children can understand
  const getBadgeName = (badgeId: number) => {
    const names = {
      1: 'Welcome Explorer',
      2: 'Rising Star',
      3: 'Leadership Pro',
      4: 'Master Leader',
      5: 'Weekly Warrior',
      6: 'Monthly Master',
      7: 'Year Champion',
      8: 'Goal Achiever',
      9: 'Journal Master',
      10: 'Avatar Creator',
      11: 'Emotion Tracker',
      12: 'Anger Greeter',
      13: 'Anger Expert'
    };
    return names[badgeId as keyof typeof names] || 'Mystery Badge';
  };

  // Add a new function to get badge descriptions
  const getBadgeDescription = (badgeId: number) => {
    const descriptions = {
      1: 'First time logging in!',
      2: 'Reached 1,000 leadership points',
      3: 'Achieved 5,000 leadership points',
      4: 'Master level: 15,000 points',
      5: 'Maintained a 7-day streak',
      6: 'Kept a 30-day streak going',
      7: 'Amazing 365-day streak',
      8: 'Completed your first goal',
      9: 'Completed first weekly journal',
      10: 'Created your first avatar',
      11: 'Used anger thermometer',
      12: 'Completed Hi to Your Anger',
      13: 'Mastered Know Your Anger'
    };
    return descriptions[badgeId as keyof typeof descriptions] || 'Keep playing to learn more!';
  };

  // For standard React routing
  const reloadPage = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md fade-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-blue-600 mt-4">Loading your progress...</p>
          <p className="text-gray-500 mt-2">Just a moment while we get your data</p>
        </div>
        <style>
          {animationStyles}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md fade-in">
          <div className="text-6xl mb-4">
            😕
          </div>
          <p className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong.</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 font-bold text-xl shadow-md"
            onClick={reloadPage}
          >
            Try Again
          </button>
        </div>
        <style>
          {animationStyles}
        </style>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className="flex justify-center items-center h-screen" style={{background: 'linear-gradient(135deg, #f9e4c4 0%, #ffeec7 50%, #fff6d1 100%)'}}>
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md fade-in">
          <div className="text-7xl mb-4 bounce-animation">
            🤔
          </div>
          <p className="text-2xl font-bold text-amber-500 mb-4">Can't find your progress!</p>
          <button 
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 font-bold text-xl shadow-lg"
            onClick={reloadPage}
          >
            Try Again
          </button>
        </div>
        <style>
          {animationStyles}
        </style>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      width: '100%',
      overflow: 'auto'
    }}>
      <style>
        {animationStyles}
        {mediaQueryStyles}
      </style>
      
      <div className="container">
        {/* Header Section with improved styling */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#4F6DF5',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '25px',
          color: 'white'
        }} className="fade-in">
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{ marginRight: '12px', fontSize: '30px' }}>🏆</span>
            {childData.name}'s Progress Dashboard
          </h1>
          
          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              backgroundColor: '#fff',
              color: '#4F6DF5',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '14px'
            }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = "/";
              }
            }}>
              <span style={{ fontSize: '18px', marginRight: '4px' }}>🏠</span>
              Home
            </button>
          </div>
        </div>
        
        {/* Welcome message */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          borderLeft: '5px solid #4CAF50',
        }} className="fade-in">
          <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '22px' }}>
            Welcome to Your Progress Dashboard, {childData.name}!
          </h2>
          <p style={{ fontSize: '16px', color: '#555', margin: '0 0 10px 0' }}>
            Here you can see how well you're doing with your streaks, points, and badges.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ color: '#FF5252', fontSize: '24px', marginRight: '10px' }}>💡</span>
            <span style={{ color: '#555', fontWeight: 'bold' }}>Keep playing to earn more badges and build your streak!</span>
          </div>
        </div>
        
        {/* Stats Overview with improved cards */}
        <h2 style={{ 
          margin: '25px 0 15px', 
          color: '#333', 
          fontSize: '22px', 
          display: 'flex', 
          alignItems: 'center' 
        }} className="fade-in">
          <span style={{ marginRight: '10px', fontSize: '24px' }}>📊</span>
          My Stats Overview
        </h2>
        
        {/* Cards Container with better layout - now with 4 boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          margin: '20px auto 40px'
        }}>
          {/* Current Streak Card */}
          <div className="stat-card bg-white rounded-xl shadow-md overflow-hidden p-8 text-center card-hover"
            style={{ 
              position: 'relative',
              border: "none",
              boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
              minHeight: '350px',
              width: '32%',
              minWidth: '320px',
              marginLeft: '0',
              flex: '1 1 auto'
            }}
          >
            {/* Top bar */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '8px',
              backgroundColor: '#4A90E2',
            }}></div>
            
            <div style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '20px',
              padding: '20px 10px'
            }}>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-600">Current Streak</h2>
              <div className="text-4xl md:text-5xl float-animation">
                🔥
              </div>
              <div>
                <span className="text-5xl md:text-7xl font-bold text-blue-500">{childData.streaks}</span>
                <p className="text-lg md:text-xl text-gray-600 mt-3">days in a row</p>
              </div>
              {/* Progress bar */}
              <div style={{
                width: '80%',
                height: '8px',
                backgroundColor: '#E0E0E0',
                borderRadius: '4px',
                margin: '15px auto 0',
                position: 'relative'
              }}>
                <div style={{
                  width: `${Math.min((childData.streaks / (childData.maxStreak || 10)) * 100, 100)}%`,
                  height: '100%',
                  backgroundColor: '#4A90E2',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          </div>

          {/* Max Streak - center positioned */}
          <div className="stat-card bg-white rounded-xl shadow-md overflow-hidden p-8 text-center card-hover"
            style={{ 
              position: 'relative',
              border: "none",
              boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
              minHeight: '350px',
              width: '32%',
              minWidth: '320px',
              margin: '0 auto',
              flex: '1 1 auto'
            }}
          >
            {/* Top bar */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '8px',
              backgroundColor: '#9C27B0',
            }}></div>
            
            <div style={{ 
              marginTop: '10px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <h2 className="text-xl md:text-2xl font-bold text-purple-600">Best Streak</h2>
              <div className="text-3xl md:text-4xl float-animation">
                ⭐
              </div>
              <div className="mt-2">
                <span className="text-4xl md:text-6xl font-bold text-purple-500">{childData.maxStreak}</span>
                <p className="text-md md:text-lg text-gray-600 mt-2">best in a row</p>
              </div>
              
              {/* Achievement indicator */}
              <div style={{
                backgroundColor: '#F3E5F5',
                padding: '8px 16px',
                borderRadius: '20px',
                marginTop: '10px',
                display: 'inline-block'
              }}>
                <span style={{ color: '#9C27B0', fontWeight: 'bold', fontSize: '14px' }}>
                  Achievement unlocked!
                </span>
              </div>
            </div>
          </div>
          
          {/* Leadership Score - right positioned */}
          <div className="stat-card bg-white rounded-xl shadow-md overflow-hidden p-8 text-center card-hover"
            style={{ 
              position: 'relative',
              border: "none",
              boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
              minHeight: '350px',
              width: '32%',
              minWidth: '320px',
              marginRight: '0',
              flex: '1 1 auto'
            }}
          >
            {/* Top bar */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '8px',
              backgroundColor: '#FFC107',
            }}></div>
            
            <div style={{ 
              marginTop: '10px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <h2 className="text-xl md:text-2xl font-bold text-yellow-600">Total Points</h2>
              <div className="text-3xl md:text-4xl float-animation">
                👑
              </div>
              <div className="mt-2">
                <span className="text-4xl md:text-6xl font-bold text-yellow-500">{childData.leadershipScore}</span>
                <p className="text-md md:text-lg text-gray-600 mt-2">leadership points</p>
              </div>
              
              {/* Next level indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '10px',
                gap: '5px',
                backgroundColor: '#FFF8E1',
                padding: '8px 16px',
                borderRadius: '20px',
                width: 'auto'
              }}>
                <span className="text-sm md:text-base text-gray-600">Next level:</span>
                <span className="text-sm md:text-base font-bold text-yellow-600">
                  {Math.ceil(childData.leadershipScore / 100) * 100} points
                </span>
              </div>
            </div>
          </div>

          {/* New League Card */}
          <div className="stat-card bg-white rounded-xl shadow-md overflow-hidden p-8 text-center card-hover"
            style={{ 
              position: 'relative',
              border: "none",
              boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
              minHeight: '350px',
              minWidth: '280px',
              flex: '1 1 auto'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '8px',
              backgroundColor: '#E91E63',
            }}></div>
            
            <div style={{ 
              marginTop: '10px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <h2 className="text-xl md:text-2xl font-bold text-pink-600">Current League</h2>
              <div className="text-3xl md:text-4xl float-animation">
                <Image
                  source={leagueImages[childData.league] || leagueImages.bronze}
                  style={{ 
                    width: 80,
                    height: 80,
                    objectFit: 'contain'
                  }}
                  resizeMode="contain"
                  onError={() => handleLeagueImageError(childData.league)}
                />
              </div>
              <div className="mt-2">
                <span className="text-4xl md:text-6xl font-bold text-pink-500 capitalize">
                  {childData.league || 'Bronze'}
                </span>
                <p className="text-md md:text-lg text-gray-600 mt-2">league rank</p>
              </div>
              
              <div style={{
                backgroundColor: '#FCE4EC',
                padding: '8px 16px',
                borderRadius: '20px',
                marginTop: '10px',
                display: 'inline-block'
              }}>
                <span style={{ color: '#E91E63', fontWeight: 'bold', fontSize: '14px' }}>
                  Keep climbing the ranks!
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Badges Section - improved spacing and responsiveness */}
        <div 
          className="mt-16 bg-white rounded-xl shadow-md overflow-hidden p-8 fade-in" 
          style={{ 
            position: 'relative',
            border: 'none',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}
        >
          {/* Top bar */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '8px',
            backgroundColor: '#4CAF50',
          }}></div>
          
          <div className="text-center mb-10" style={{ marginTop: '15px' }}>
            <h2 className="text-3xl font-bold text-green-600" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>🏅</span>
              My Earned Badges
            </h2>
            <p className="text-gray-600 mt-3 text-lg">
              Collect badges by completing activities and challenges!
            </p>
          </div>

          {renderBadges(childData.badges)}
        </div>
        
        {/* Tips section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginTop: '30px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderTop: '5px solid #FFC107',
          marginBottom: '40px'
        }} className="fade-in">
          <h2 style={{
            color: '#333',
            marginTop: 0,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>💡</span> Tips to Grow Your Progress
          </h2>
          
          <div style={{
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            borderLeft: '4px solid #FF9800'
          }}>
            <h3 style={{ color: '#FF9800', marginBottom: '10px' }}>Keep Your Streak Going</h3>
            <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.5' }}>
              Come back every day to keep building your streak! Don't break the chain of success.
            </p>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>Try New Activities</h3>
            <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.5' }}>
              Complete different types of activities to unlock special badges and earn more points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streaks;
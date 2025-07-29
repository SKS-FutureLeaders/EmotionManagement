'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './activity5.module.css';
import Confetti from 'react-confetti';
import Image from 'next/image';

// Define the emotions we'll use in the activity
const emotions = [
  { name: 'Happy', icon: '😊', id: 1, color: '#FFD600' },
  { name: 'Sad', icon: '😢', id: 2, color: '#5D9CEC' },
  { name: 'Angry', icon: '😠', id: 3, color: '#FC6E51' },
  { name: 'Surprised', icon: '😮', id: 4, color: '#AC92EC' },
  { name: 'Scared', icon: '😨', id: 5, color: '#A0D468' },
];

// Original emotion images array
const originalEmotionImages = [
  { id: 1, path: '/images/happy.jpg', emotion: 'Happy' },
  { id: 2, path: '/images/sad.jpg', emotion: 'Sad' },
  { id: 3, path: '/images/angry.jpg', emotion: 'Angry' },
  { id: 4, path: '/images/surprised.jpg', emotion: 'Surprised' },
  { id: 5, path: '/images/scared.jpg', emotion: 'Scared' },
];

// Fun encouragement messages for correct answers
const encouragementMessages = [
  "Awesome job! You're a feeling detective! 🕵️",
  "Wow! You really know your feelings! 🌟",
  "Super duper! You're getting so good at this! 🚀",
  "Amazing work! You're a feelings expert! 🏆",
  "Fantastic! You're learning so much! 🎉"
];

// Fisher-Yates shuffle algorithm
interface ShuffleArray {
    <T>(array: T[]): T[];
}

const shuffleArray: ShuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Add celebration messages
const celebrationMessages = [
  "Hooray! You've identified all the feelings correctly! You're amazing! 🎉",
  "Wow! You're a feelings superstar! You found all 5 emotions! 🌟",
  "You did it! You've mastered all the feelings! Fantastic job! 🏆",
  "Incredible! You're a champion at recognizing feelings! 🥇",
  "Super duper! You found all the feelings correctly! You're awesome! 🚀"
];

export default function Activity5() {
  const [emotionImages, setEmotionImages] = useState(() => shuffleArray(originalEmotionImages));
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [expandedEmotion, setExpandedEmotion] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [encouragement, setEncouragement] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [completedRound, setCompletedRound] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  // Removed floatingEmojis state variable
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPrompting, setIsPrompting] = useState(false);
  
  // Update window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Remove the floating emojis effect - deleted
  
  // Function to reset activity with shuffled images
  const resetActivity = () => {
    setEmotionImages(shuffleArray(originalEmotionImages));
    setCurrentImage(0);
    setCompletedRound(false);
    // Don't reset score to allow accumulation across rounds
  };
  
  // If we completed a round (all images shown), shuffle for next round
  useEffect(() => {
    if (completedRound) {
      resetActivity();
    }
  }, [completedRound]);
  
  // Improved check for activity completion
  useEffect(() => {
    // Check if all 5 emotions have been correctly identified (score of 5)
    if (score >= 5 && !showCompletion) {
      const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
      setCelebrationMessage(randomMessage);
      
      // Show the completion modal and confetti
      setShowCompletion(true);
      setShowConfetti(true);
    }
  }, [score, showCompletion]);
  
  // Reset inactivity timer whenever user interacts
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // If already prompting, clear that state
    if (isPrompting) {
      setIsPrompting(false);
    }
    
    // Set new inactivity timer - increased to 20 seconds (was 10)
    const timer = setTimeout(() => {
      // Start prompting the user after longer inactivity
      setIsPrompting(true);
    }, 20000); // Increased from 10000 to 20000 ms
    
    setInactivityTimer(timer);
  };
  
  // Setup inactivity detection on mount and when image changes
  useEffect(() => {
    resetInactivityTimer();
    
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [currentImage]);
  
  // Add interaction trackers for all user actions
  const handleUserInteraction = () => {
    resetInactivityTimer();
  };
  
  const handleEmotionClick = (emotion: string) => {
    handleUserInteraction();
    // Prevent repeated toggles which can cause lag
    if (!expandedEmotion) {
      setExpandedEmotion(emotion);
    } else if (expandedEmotion === emotion) {
      setExpandedEmotion(null);
    } else {
      // If another emotion is expanded, switch to this one directly
      setExpandedEmotion(emotion);
    }
  };
  
  const checkAnswer = (selectedEmotion: string) => {
    const correctEmotion = emotionImages[currentImage].emotion;
    setAttempts(attempts + 1);
    
    if (selectedEmotion === correctEmotion) {
      // Pick a random encouragement message
      const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      setEncouragement(randomMessage);
      
      setFeedback('correct');
      setShowConfetti(true);
      setScore(score + 1);
      setProgress(Math.min(100, progress + 20));
      
      setTimeout(() => {
        setShowConfetti(false);
        setFeedback(null);
        
        // Move to next image or complete round
        if (currentImage < emotionImages.length - 1) {
          setCurrentImage(currentImage + 1);
        } else {
          setCompletedRound(true);
        }
        
        setSelectedEmotion(null);
      }, 3000);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  };

  const selectEmotionAndCheck = (emotion: string) => {
    handleUserInteraction();
    setSelectedEmotion(emotion);
    checkAnswer(emotion);
  };
  
  // Improved completion modal close handler
  const handleCompletionClose = () => {
    handleUserInteraction();
    
    // Hide the modal
    setShowCompletion(false);
    
    // Stop confetti
    setShowConfetti(false);
    
    // Reset the game state for a new round
    setScore(0); // Reset the score for a fresh start
    setProgress(0); // Reset progress bar
    resetActivity();
  };
  
  // Display current image index for debugging
  const currentImageDetails = useMemo(() => {
    return `${currentImage + 1}/${emotionImages.length} (${emotionImages[currentImage]?.emotion})`;
  }, [currentImage, emotionImages]);
  
  // Optimize to prevent excessive re-renders and improve performance
  const memoizedEmotions = useMemo(() => emotions, []);
  
  return (
    <div className={styles.container} onClick={handleUserInteraction}>
      <div className={styles.backgroundBubbles}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`${styles.bubble} ${styles[`bubble${i + 1}`] || styles.bubble1}`}></div>
        ))}
      </div>
      
      {/* Removed floating emojis section */}
      
      <header className={styles.header}>
        <h1 className={styles.title}>Feeling Detective</h1>
        <div className={styles.scoreBoard}>
          <div className={styles.score}>Score: {score}</div>
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {/* More compact counter */}
          <div className={styles.imageCounter}>
            {currentImage + 1}/{emotionImages.length}
          </div>
        </div>
      </header>

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={showCompletion} // Keep confetti going during completion celebration
          numberOfPieces={showCompletion ? 500 : 300}
          gravity={0.2}
          colors={['#FFD600', '#FC6E51', '#5D9CEC', '#AC92EC', '#A0D468']}
        />
      )}
      
      <div className={styles.activityContainer}>
        {/* Optimized Left sidebar with emotion icons */}
        <div className={styles.sidebarContainer}>
          {memoizedEmotions.map((emotion) => {
            const isCorrectEmotion = emotionImages[currentImage]?.emotion === emotion.name;
            const shouldHighlight = isPrompting && isCorrectEmotion;
            
            return (
              <motion.div 
                key={emotion.id} 
                className={`${styles.emotionIconContainer} ${shouldHighlight ? styles.attentionNeeded : ''}`}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={styles.emotionIcon}
                  style={{ 
                    backgroundColor: emotion.color,
                    boxShadow: shouldHighlight ? '0px 0px 15px rgba(255, 214, 0, 0.7)' : undefined
                  }}
                  onClick={() => handleEmotionClick(emotion.name)}
                >
                  <span className={styles.iconText}>{emotion.icon}</span>
                  <span className={styles.iconLabel}>{emotion.name}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {expandedEmotion === emotion.name && (
                    <motion.div
                      initial={{ width: 0, opacity: 0, x: -20 }}
                      animate={{ width: 'auto', opacity: 1, x: 0 }}
                      exit={{ width: 0, opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={styles.emotionName}
                      style={{ backgroundColor: emotion.color }}
                      onClick={() => selectEmotionAndCheck(emotion.name)}
                    >
                      <div className={styles.selectButtonContent}>
                        {/* Simplified text - just the emotion name */}
                        <span>{emotion.name}</span>
                        <span className={styles.selectArrow}>→</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        {/* Main content with image */}
        <div className={styles.mainContent}>
          <div className={styles.instructionBubble}>
            <p className={styles.instructionText}>Which feeling is shown in the picture?</p>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentImage}-${emotionImages[currentImage]?.id}`}
              className={styles.imageContainer}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.5 
              }}
            >
              <div className={styles.emotionImage}>
                <img 
                  src={emotionImages[currentImage]?.path} 
                  alt={`${emotionImages[currentImage]?.emotion} expression`}
                  className={styles.emotionPhoto}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder-emotion.jpg'; // Fallback image
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Feedback animations */}
          <AnimatePresence>
            {feedback === 'correct' && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1.2, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15 
                }}
                className={styles.feedbackCorrect}
              >
                <div className={styles.feedbackIconContainer}>
                  <svg viewBox="0 0 24 24" width="80" height="80" className={styles.feedbackIcon}>
                    <motion.path
                      fill="none"
                      stroke="#4CAF50"
                      strokeWidth="3"
                      strokeLinecap="round"
                      d="M4 12 L10 18 L20 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </svg>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.starBurst}
                  />
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={styles.feedbackText}
                >
                  {encouragement}
                </motion.p>
              </motion.div>
            )}
            
            {feedback === 'incorrect' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={styles.feedbackIncorrect}
              >
                <div className={styles.feedbackIconContainer}>
                  <svg viewBox="0 0 24 24" width="80" height="80" className={styles.feedbackIcon}>
                    <motion.path
                      fill="none"
                      stroke="#F44336"
                      strokeWidth="3"
                      strokeLinecap="round"
                      d="M6 6 L18 18 M6 18 L18 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </svg>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={styles.feedbackText}
                >
                  Not quite right! This is <span className={styles.highlightEmotion}>{emotionImages[currentImage].emotion}</span>.
                  <br />Let's try another one!
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Improve completion celebration modal */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div 
            className={styles.completionOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className={styles.completionModal}
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className={styles.completionHeader}>
                <span className={styles.trophy}>🏆</span>
                <h2>Amazing Job!</h2>
                <span className={styles.trophy}>🏆</span>
              </div>
              
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className={styles.star}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2, type: "spring" }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
              
              <p className={styles.completionMessage}>{celebrationMessage}</p>
              
              <div className={styles.emojiRow}>
                {emotions.map(emotion => (
                  <motion.div 
                    key={emotion.id}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className={styles.completionEmoji}
                  >
                    {emotion.icon}
                  </motion.div>
                ))}
              </div>
              
              <motion.button 
                className={styles.playAgainButton}
                onClick={handleCompletionClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


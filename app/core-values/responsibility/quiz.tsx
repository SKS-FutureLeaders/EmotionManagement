import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.12.240:5000";

// Quiz questions about responsibility
const quizQuestions = [
  {
    id: 1,
    question: "What does responsibility mean?",
    options: [
      "Doing your chores and tasks without being asked",
      "Letting others do things for you",
      "Taking credit for others' work",
      "Doing only the things you enjoy"
    ],
    correctAnswer: 0,
    explanation: "Responsibility means taking care of your duties without needing to be reminded or asked!"
  },
  {
    id: 2,
    question: "Why is it important to keep your room clean?",
    options: [
      "So you don't get in trouble",
      "So you can find your things and take care of them",
      "So your parents will be happy",
      "It isn't important"
    ],
    correctAnswer: 1,
    explanation: "Keeping your room clean shows you're responsible with your belongings and helps you take care of your things!"
  },
  {
    id: 3,
    question: "What should you do if you make a mistake?",
    options: [
      "Blame someone else",
      "Hide it so no one knows",
      "Take responsibility and try to fix it",
      "Pretend it didn't happen"
    ],
    correctAnswer: 2,
    explanation: "Taking responsibility for mistakes and trying to fix them shows real maturity and responsibility!"
  },
  {
    id: 4,
    question: "How does finishing homework on time show responsibility?",
    options: [
      "It shows you care about your education",
      "It helps you learn and grow",
      "It demonstrates good time management",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "Completing homework on time shows you care about learning, helps you grow, AND demonstrates you can manage your time well!"
  },
  {
    id: 5,
    question: "What happens when you are responsible?",
    options: [
      "People trust you more",
      "You feel proud of yourself",
      "You learn important life skills",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "Being responsible helps people trust you, makes you feel proud, and teaches you important skills for life!"
  }
];

export default function ResponsibilityQuiz() {
  const router = useRouter();
  
  // Core state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  
  // Progress calculation
  const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  
  // Handle option selection
  const handleSelectOption = (optionIndex) => {
    if (isAnswered || animating) return;
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    // Save the user's answer
    setUserAnswers(prev => [
      ...prev, 
      { 
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedOption: optionIndex,
        correctOption: currentQuestion.correctAnswer,
        isCorrect
      }
    ]);
    
    // Update score if correct
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    // Read the explanation aloud
    Speech.speak(currentQuestion.explanation, {
      language: 'en-US',
      rate: 0.9,
      pitch: 1.1
    });
  };

  // Move to next question or finish quiz
  const handleNextQuestion = () => {
    if (animating) return;
    
    // Stop any ongoing speech
    Speech.stop();
    
    setAnimating(true);
    setFadeOut(true);
    
    // Use a simple timer instead of animations with callbacks
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        // Next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setFadeOut(false);
        setAnimating(false);
      } else {
        // Complete quiz - this is the critical transition
        setQuizCompleted(true);
        
        // We'll show results after a short delay
        setTimeout(() => {
          setResultVisible(true);
          setAnimating(false);
          
          // Save results to backend
          saveQuizResults();
        }, 300);
      }
    }, 400); // Transition time
  };
  
  // Save quiz results to backend
  const saveQuizResults = async () => {
    setIsSaving(true);
    
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found for saving quiz results');
        setIsSaving(false);
        return;
      }
      
      // Save quiz progress
      await axios.post(
        `${API_URL}/curriculum/progress/responsibility`,
        { 
          section: 'quiz', 
          completed: true,
          score: score,
          total: quizQuestions.length
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Save detailed answers
      await axios.post(
        `${API_URL}/quiz/results`,
        {
          quizType: 'responsibility',
          score: score,
          totalQuestions: quizQuestions.length,
          answers: userAnswers,
          completedAt: new Date()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Quiz results saved successfully');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      
      // Save locally if API fails
      try {
        const quizData = {
          quizType: 'responsibility',
          score: score,
          totalQuestions: quizQuestions.length,
          answers: userAnswers,
          completedAt: new Date()
        };
        
        await AsyncStorage.setItem('responsibility_quiz_results', JSON.stringify(quizData));
        console.log('Quiz results saved locally as fallback');
      } catch (localError) {
        console.error('Error saving quiz results locally:', localError);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Go back to responsibility lesson
  const handleBackToLesson = () => {
    router.push('/core-values/responsibility');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quiz header (always present) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Responsibility Quiz</Text>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </Text>
        </View>
        
        {/* Questions screen */}
        {!quizCompleted && (
          <View style={[
            styles.questionContainer,
            fadeOut && styles.fadeOut
          ]}>
            <View style={styles.questionBox}>
              <Text style={styles.questionText}>
                {quizQuestions[currentQuestionIndex].question}
              </Text>
            </View>
            
            {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === quizQuestions[currentQuestionIndex].correctAnswer;
              const isWrongSelection = isSelected && !isCorrectAnswer;
              
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption,
                    isAnswered && isCorrectAnswer && styles.correctOption,
                    isWrongSelection && styles.wrongOption,
                  ]}
                  onPress={() => handleSelectOption(idx)}
                  disabled={isAnswered || animating}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.optionText,
                    isAnswered && isCorrectAnswer && styles.correctOptionText,
                    isWrongSelection && styles.wrongOptionText
                  ]}>
                    {option}
                  </Text>
                  
                  {isAnswered && isCorrectAnswer && (
                    <Image 
                      source={require('../../../assets/images/correct-icon.png')} 
                      style={styles.resultIcon}
                    />
                  )}
                  
                  {isWrongSelection && (
                    <Image 
                      source={require('../../../assets/images/wrong-icon.png')} 
                      style={styles.resultIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            
            {/* Explanation appears after answering */}
            {isAnswered && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationText}>
                  {quizQuestions[currentQuestionIndex].explanation}
                </Text>
              </View>
            )}
            
            {/* Next button appears after answering */}
            {isAnswered && (
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNextQuestion}
                disabled={animating}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Results screen */}
        {quizCompleted && resultVisible && (
          <View style={styles.resultsContainer}>
            <View style={styles.celebrationIconContainer}>
              <Image 
                source={require('../../../assets/images/star-trophy.png')} 
                style={styles.celebrationIcon}
              />
            </View>
            
            <LinearGradient
              colors={['#FF9052', '#FFAA70']}
              style={styles.resultsHeader}
            >
              <Text style={styles.resultsTitle}>Quiz Complete!</Text>
            </LinearGradient>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Your Score: {score}/{quizQuestions.length}
              </Text>
              <Text style={styles.scoreMessage}>
                {score === quizQuestions.length 
                  ? "Perfect score! You're a responsibility expert!" 
                  : score >= quizQuestions.length / 2
                  ? "Great job! You know a lot about responsibility!"
                  : "Good try! Keep learning about responsibility!"}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackToLesson}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.backButtonText}>Back to Responsibility Lesson</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2', // Light orange for responsibility
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9052', // Orange for responsibility
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#FFE4D0',
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF9052',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  questionContainer: {
    alignItems: 'center',
    opacity: 1,
  },
  fadeOut: {
    opacity: 0.5,
  },
  questionBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE4D0', // Light orange
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  selectedOption: {
    borderColor: '#FF9052',
    backgroundColor: '#FFF0E6',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  wrongOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  correctOptionText: {
    color: '#2E7D32',
  },
  wrongOptionText: {
    color: '#C62828',
  },
  resultIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: '#FFF0E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFCBA8',
  },
  explanationText: {
    fontSize: 16,
    color: '#FF9052',
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: '#FF9052',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    alignItems: 'center',
  },
  resultsHeader: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9052',
    marginBottom: 16,
  },
  scoreMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 26,
  },
  celebrationIconContainer: {
    marginBottom: 20,
  },
  celebrationIcon: {
    width: 120,
    height: 120,
  },
  backButton: {
    backgroundColor: '#FF9052',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
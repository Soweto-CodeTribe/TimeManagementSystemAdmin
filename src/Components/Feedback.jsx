/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import "./styling/Feedback.css";
import DataLoader from "./dataLoader";

function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [categorizedFeedback, setCategorizedFeedback] = useState({
    positive: [],
    neutral: [],
    constructive: [],
    negative: [],
    question: []
  });
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  // Enhanced sentiment analysis datasets with more natural language patterns and word combinations
  const sentimentPatterns = {
    positive: [
      // Explicit praise
      "amazing", "awesome", "excellent", "fantastic", "great", "love", "outstanding", "perfect", 
      "wonderful", "brilliant", "impressive", "exceptional", "superb", "terrific", "delightful", 
      // Satisfaction expressions
      "happy with", "pleased with", "satisfied", "enjoyable", "enjoyed", "appreciate", "thankful",
      "grateful", "thank you", "thanks for", "kudos", "well done", "good job", "bravo",
      // Improvement acknowledgments
      "better than", "improved", "enhancement", "upgrade", "progress", "advancement",
      // Quality descriptors
      "user-friendly", "intuitive", "convenient", "reliable", "stable", "smooth", "fast", 
      "responsive", "efficient", "effective", "valuable", "worth", "helpful",
      // Emotional responses
      "excited", "impressed", "pleased", "glad", "delighted", "thrilled", "love using",
      // Recommendation language
      "recommend", "would use again", "definitely use", "keep up",
      // Positive word combinations
      "works perfectly", "exactly what i needed", "very pleased", "really helpful", "made my day",
      "solved my problem", "saved me time", "exceeded expectations", "pleasant experience",
      "best experience", "easy to use", "works flawlessly", "absolutely love", "very intuitive"
    ],
    constructive: [
      // Suggestion language
      "suggest", "suggestion", "recommend", "consider", "would be nice", "could add", 
      "might be better", "prefer if", "would like to see", "hope for", "looking forward to",
      "would appreciate if", "please add", "wish there was", "needs more",
      // Improvement focused
      "improve", "enhancement", "upgrade", "update", "revise", "refine", "develop further",
      "build upon", "expand on", "strengthen", "potentially", "possibly", "opportunity to",
      // Balanced feedback
      "however", "although", "while", "even though", "despite", "on the other hand",
      "overall good but", "like it except", "works well but", "good start but",
      // Specific feature requests
      "feature request", "missing feature", "additional option", "more control", "flexibility",
      // Constructive word combinations
      "one thing i would", "it would be better if", "have you considered", "could be improved by",
      "nice but needs", "good but could use", "almost perfect except", "would benefit from",
      "needs a little more", "might work better with", "consider adding", "potential improvement",
      "would be perfect if", "my only suggestion is", "a nice addition would be"
    ],
    negative: [
      // Direct criticism
      "bad", "poor", "terrible", "awful", "horrible", "disappointing", "frustrating", "annoying", "again", "bug",
      // Problem indicators
      "difficult", "complicated", "confusing", "unclear", "hard to", "challenging", "tedious", 
      "boring", "slow", "laggy", "buggy", "glitchy", "unreliable", "unstable", "crashes", 
      "error", "broken", "fails", "failed", "doesn't work", "not working", "malfunctioning",
      // Inadequacy expressions
      "inadequate", "insufficient", "limited", "lacking", "missing", "incomplete", "useless",
      "unhelpful", "ineffective", "inefficient", "waste of time", "waste of money",
      // Strong negative emotions
      "hate", "dislike", "upset", "disappointed", "frustrated", "annoyed", "irritated",
      "angry", "furious", "regret", "unfortunate", "unacceptable", "ridiculous",
      // Comparative criticism
      "worse than", "declined", "deteriorated", "downgrade", "step backwards",
      // Negative word combinations
      "completely unusable", "doesn't make sense", "very disappointing", "totally frustrated",
      "wasted my time", "major issues with", "constantly crashes", "extremely difficult",
      "not at all what", "far too complicated", "very confusing interface", "extremely slow",
      "couldn't figure out", "worst experience", "just doesn't work", "absolutely terrible",
      "really annoying when", "consistently fails to", "very poorly designed"
    ],
    question: [
      // Direct questions
      "how do i", "how can i", "how to", "what is", "where is", "when will", "can i", "will it",
      "does it", "is there", "are there", "why isn't", "why doesn't",
      // Help requests
      "help with", "need help", "assistance with", "guidance on", "explain how", "clarify",
      "looking for help", "not sure how", "can't figure out", "don't understand how",
      // Uncertainty expressions
      "confused about", "unclear how", "not certain", "wondering if", "curious if",
      "would like to know", "trying to understand",
      // Question word combinations
      "is it possible to", "do you have any", "could someone tell me", "is there a way to",
      "how do i get", "can you explain", "need to know if", "wondering how to",
      "any idea why", "is this supposed to", "have been trying to", "should i be able to",
      "what am i doing wrong", "does anyone know how", "could you please explain"
    ]
  };

  // Enhanced function to categorize feedback with more advanced pattern recognition
  const categorizeFeedback = (feedbackArray) => {
    const categorized = {
      positive: [],
      neutral: [],
      constructive: [],
      negative: [],
      question: []
    };

    // Weightings for different sentiment categories
    const categoryWeights = {
      positive: 1,
      constructive: 1.2,  // Give slightly more weight to constructive feedback
      negative: 1.1,      // Give slightly more weight to negative feedback
      question: 1.3       // Give more weight to questions
    };

    feedbackArray.forEach(item => {
      const text = item.feedbackText.toLowerCase();
      
      // Initialize weighted scores for each category
      const scores = {
        positive: 0,
        constructive: 0,
        negative: 0,
        question: 0
      };
      
      // Check for pattern matches in each category with weighted scoring
      Object.keys(sentimentPatterns).forEach(category => {
        sentimentPatterns[category].forEach(pattern => {
          // Check for exact matches of phrases (especially important for multi-word patterns)
          if (text.includes(pattern.toLowerCase())) {
            // Give more weight to longer patterns (likely more specific)
            const patternWeight = pattern.includes(" ") ? 1.5 : 1;
            scores[category] += patternWeight * categoryWeights[category];
          }
        });
      });
      
      // Check for question marks as strong question indicators
      if (text.includes('?')) {
        scores.question += 2.5 * categoryWeights.question; // Stronger weight for question marks
      }
      
      // Advanced contextual analysis - check for patterns that might override others
      // For example, "I love it but..." is constructive despite having positive words
      if ((text.includes("but") || text.includes("however") || text.includes("although")) && 
          (scores.positive > 0 && (scores.constructive > 0 || scores.negative > 0))) {
        scores.constructive += 1.5;  // Boost constructive score for mixed feedback
      }
      
      // Check for strong negation phrases that might flip sentiment
      const negationPhrases = ["not good", "not great", "not working", "doesn't work", "won't work", "can't use"];
      negationPhrases.forEach(phrase => {
        if (text.includes(phrase)) {
          scores.negative += 2;  // Strongly boost negative for negated positive terms
          scores.positive = Math.max(0, scores.positive - 1);  // Reduce positive score
        }
      });
      
      // Determine primary sentiment category based on highest weighted score
      const highestCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
      
      // Only categorize as the highest if the score exceeds a minimum threshold
      if (scores[highestCategory] >= 1) {
        categorized[highestCategory].push(item);
      } else {
        categorized.neutral.push(item);  // Default to neutral if no strong sentiment detected
      }
    });
    
    return categorized;
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get('https://timemanagementsystemserver.onrender.com/api/add-user/getFeedBack', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success && Array.isArray(response.data.feedback)) {
          const feedbackData = response.data.feedback;
          setFeedback(feedbackData);
          
          // Categorize the feedback
          const categorized = categorizeFeedback(feedbackData);
          setCategorizedFeedback(categorized);
        } else {
          throw new Error("Invalid response format");
        }

        setIsLoading(false);
      } catch (err) {
        setError("Error loading feedback. Please try again later.");
        setIsLoading(false);
        console.error("API Error:", err.message);
      }
    };

    fetchFeedback();
  }, [token]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate total counts for tab badges
  const getCategoryCount = (category) => {
    return category === "all" 
      ? feedback.length 
      : categorizedFeedback[category]?.length || 0;
  };

  if (isLoading) return <DataLoader />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="feedback-container">
      <div className="feedback-header-main">
        <h2 className="feedback-title">Feedback</h2>
        <span className="feedback-badge">{feedback.length} Reviews</span>
      </div>

      {feedback.length === 0 ? (
        <EmptyState />
      ) : (
        <>
        <div className="feedback-tabs">
            <button 
              className={`tab-button ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
              <span className="tab-count">{getCategoryCount("all")}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "positive" ? "active" : ""}`}
              onClick={() => setActiveTab("positive")}
            >
              Positive
              <span className="tab-count">{getCategoryCount("positive")}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "constructive" ? "active" : ""}`}
              onClick={() => setActiveTab("constructive")}
            >
              Constructive
              <span className="tab-count">{getCategoryCount("constructive")}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "negative" ? "active" : ""}`}
              onClick={() => setActiveTab("negative")}
            >
              Needs Improvement
              <span className="tab-count">{getCategoryCount("negative")}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "question" ? "active" : ""}`}
              onClick={() => setActiveTab("question")}
            >
              Questions
              <span className="tab-count">{getCategoryCount("question")}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === "neutral" ? "active" : ""}`}
              onClick={() => setActiveTab("neutral")}
            >
              Neutral
              <span className="tab-count">{getCategoryCount("neutral")}</span>
            </button>
          </div>
          <div className="feedback-header-main">
            
          </div>

          <div className="feedback-content-area">
            {activeTab === "all" && (
              <div className="feedback-grid">
                {feedback.map((item) => (
                  <div key={item.id} className="feedback-card">
                    <div className="feedback-header">
                      <div className="anonymous-info">
                        <div className="anonymous-badge">{item.fullName}</div>
                        <p className="feedback-date">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="feedback-content">
                      <p className="feedback-comment">{item.feedbackText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab !== "all" && (
              <div className="feedback-grid">
                {categorizedFeedback[activeTab].length === 0 ? (
                  <p className="empty-category">No {activeTab} feedback available.</p>
                ) : (
                  categorizedFeedback[activeTab].map((item) => (
                    <div key={item.id} className={`feedback-card ${activeTab}`}>
                      <div className="feedback-header">
                        <div className="anonymous-info">
                          <div className="anonymous-badge">{item.fullName}</div>
                          <p className="feedback-date">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                      <div className="feedback-content">
                        <p className="feedback-comment">{item.feedbackText}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const ErrorState = ({ error }) => (
  <div className="feedback-card error-state">
    <p className="error-message">{error}</p>
  </div>
);

const EmptyState = () => (
  <div className="feedback-card empty-state">
    <p>No feedback available yet.</p>
  </div>
);

export default FeedbackPage;
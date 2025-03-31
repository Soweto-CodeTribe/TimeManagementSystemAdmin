/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import "./styling/Feedback.css";

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

  // Enhanced sentiment analysis datasets with more natural language patterns
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
      "recommend", "would use again", "definitely use", "keep up"
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
      "feature request", "missing feature", "additional option", "more control", "flexibility"
    ],
    negative: [
      // Direct criticism
      "bad", "poor", "terrible", "awful", "horrible", "disappointing", "frustrating", "annoying","again", "bug",
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
      "worse than", "declined", "deteriorated", "downgrade", "step backwards"
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
      "would like to know", "trying to understand"
    ]
  };

  // Function to categorize feedback based on enhanced sentiment analysis
  const categorizeFeedback = (feedbackArray) => {
    const categorized = {
      positive: [],
      neutral: [],
      constructive: [],
      negative: [],
      question: []
    };

    feedbackArray.forEach(item => {
      const text = item.feedbackText.toLowerCase();
      
      // Count matches for each category
      const matches = {
        positive: 0,
        constructive: 0,
        negative: 0,
        question: 0
      };
      
      // Check for pattern matches in each category
      Object.keys(sentimentPatterns).forEach(category => {
        sentimentPatterns[category].forEach(pattern => {
          if (text.includes(pattern.toLowerCase())) {
            matches[category]++;
          }
        });
      });
      
      // Check for question marks as additional question indicator
      if (text.includes('?')) {
        matches.question += 2; // Give extra weight to question marks
      }
      
      // Determine primary sentiment category
      if (matches.question >= 2) {
        categorized.question.push(item);
      } else if (matches.constructive > 0 && matches.positive > 0) {
        // Constructive feedback often has both positive elements and suggestions
        categorized.constructive.push(item);
      } else if (matches.negative > matches.positive && matches.negative > 0) {
        categorized.negative.push(item);
      } else if (matches.positive > 0) {
        categorized.positive.push(item);
      } else {
        categorized.neutral.push(item);
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

  if (isLoading) return <LoadingSkeleton />;
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

const LoadingSkeleton = () => (
  <div className="feedback-container">
    <h2 className="feedback-title">Feedback</h2>
    {Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="feedback-card skeleton">
          <div className="feedback-header">
            <div className="skeleton-info">
              <div className="skeleton-line"></div>
            </div>
          </div>
          <div className="feedback-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line medium"></div>
          </div>
        </div>
      ))}
  </div>
);

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
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import "./styling/Feedback.css";

function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [newFeedback, setNewFeedback] = useState("");
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        console.log("Token:", token);

        const response = await axios.get('https://timemanagementsystemserver.onrender.com/api/add-user/getFeedBack', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log("Feedback Data:", response.data);

        if (response.data.success && Array.isArray(response.data.feedback)) {
          setFeedback(response.data.feedback);
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

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="feedback-container">
      {/* <h2 className="feedback-title">Feedback</h2> */}

      {/* Feedback Submission Form */}

      {/* Feedback Header */}
      <div className="feedback-header-main">
        <h2 className="feedback-title">Feedback</h2>
        <span className="feedback-badge">{feedback.length} Reviews</span>
      </div>

      {/* Feedback Cards */}
      {feedback.length === 0 ? (
        <EmptyState />
      ) : (
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

// eslint-disable-next-line react/prop-types
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
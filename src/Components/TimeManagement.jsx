// TimeManagement.js
import { useState, useRef, useEffect } from "react";
import { FaRegClock, FaArrowLeft } from "react-icons/fa"; // Import clock and back arrow icons
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./styling/TimeManagement.css"; // Import your CSS file

const TimeManagement = () => {
  const navigate = useNavigate(); // Get navigate function from useNavigate

  const parseTimeString = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    return {
      hours,
      minutes,
      period,
    };
  };

  const formatTimeValue = (time) => {
    return `${time.hours}:${time.minutes.toString().padStart(2, "0")} ${time.period}`;
  };

  const [businessStartTime, setBusinessStartTime] = useState(parseTimeString("6:00 AM"));
  const [lunchStartTime, setLunchStartTime] = useState(parseTimeString("12:00 PM"));
  const [lunchEndTime, setLunchEndTime] = useState(parseTimeString("1:00 PM"));
  const [businessEndTime, setBusinessEndTime] = useState(parseTimeString("6:00 PM"));
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [activeTimePicker, setActiveTimePicker] = useState(null);

  const timePickerRefs = {
    businessStart: useRef(null),
    lunchStart: useRef(null),
    lunchEnd: useRef(null),
    businessEnd: useRef(null),
  };

  const timePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target) &&
        !Object.values(timePickerRefs).some((ref) => ref.current && ref.current.contains(event.target))
      ) {
        setActiveTimePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCurrentTimeSetter = () => {
    switch (activeTimePicker) {
      case "businessStart":
        return setBusinessStartTime;
      case "lunchStart":
        return setLunchStartTime;
      case "lunchEnd":
        return setLunchEndTime;
      case "businessEnd":
        return setBusinessEndTime;
      default:
        return null;
    }
  };

  const getCurrentTimeValue = () => {
    switch (activeTimePicker) {
      case "businessStart":
        return businessStartTime;
      case "lunchStart":
        return lunchStartTime;
      case "lunchEnd":
        return lunchEndTime;
      case "businessEnd":
        return businessEndTime;
      default:
        return null;
    }
  };

  const handleTimeChange = (field) => {
    setActiveTimePicker(field);
  };

  const handleHourChange = (hour) => {
    const setter = getCurrentTimeSetter();
    const currentValue = getCurrentTimeValue();

    if (setter && currentValue) {
      setter({
        ...currentValue,
        hours: hour,
      });
    }
  };

  const handleMinuteChange = (minute) => {
    const setter = getCurrentTimeSetter();
    const currentValue = getCurrentTimeValue();

    if (setter && currentValue) {
      setter({
        ...currentValue,
        minutes: minute,
      });
    }
  };

  const handlePeriodChange = (period) => {
    const setter = getCurrentTimeSetter();
    const currentValue = getCurrentTimeValue();

    if (setter && currentValue) {
      setter({
        ...currentValue,
        period,
      });
    }
  };

  const handleSave = () => {
    const settings = {
      businessStartTime: formatTimeValue(businessStartTime),
      lunchStartTime: formatTimeValue(lunchStartTime),
      lunchEndTime: formatTimeValue(lunchEndTime),
      businessEndTime: formatTimeValue(businessEndTime),
      sessionTimeout: `${sessionTimeout} minutes`,
    };

    console.log("Saved settings:", settings);
    localStorage.setItem("timeManagementSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  // Generate hours and minutes for the time picker
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Back button handler
  const handleBack = () => {
    navigate('/settings'); // Navigate to the Settings screen
  };

  return (
    <div className="time-management-root">
      <div className="time-management-card">
        <button onClick={handleBack} className="back-button" aria-label="Go back">
          <FaArrowLeft />
        </button>
        <h1 className="title">Time Management</h1>
        <p className="subtitle">Configure your business hours and session timeout settings.</p>
        <div className="divider"></div>
        <h2 className="subtitle section-title">Business Hours</h2>
        <div className="time-input-group">
          <label htmlFor="business-start-time">Business Start Time:</label>
          <div
            className="time-input"
            ref={timePickerRefs.businessStart}
            onClick={() => handleTimeChange("businessStart")}
          >
            <input type="text" id="business-start-time" value={formatTimeValue(businessStartTime)} readOnly />
            <span className="clock-icon"><FaRegClock /></span>
          </div>
        </div>
        <div className="time-input-group">
          <label htmlFor="lunch-start-time">Lunch Start Time:</label>
          <div className="time-input" ref={timePickerRefs.lunchStart} onClick={() => handleTimeChange("lunchStart")}> 
            <input type="text" id="lunch-start-time" value={formatTimeValue(lunchStartTime)} readOnly />
            <span className="clock-icon"><FaRegClock /></span>
          </div>
        </div>
        <div className="time-input-group">
          <label htmlFor="lunch-end-time">Lunch End Time:</label>
          <div className="time-input" ref={timePickerRefs.lunchEnd} onClick={() => handleTimeChange("lunchEnd")}> 
            <input type="text" id="lunch-end-time" value={formatTimeValue(lunchEndTime)} readOnly />
            <span className="clock-icon"><FaRegClock /></span>
          </div>
        </div>
        <div className="time-input-group">
          <label htmlFor="business-end-time">Business End Time:</label>
          <div className="time-input" ref={timePickerRefs.businessEnd} onClick={() => handleTimeChange("businessEnd")}> 
            <input type="text" id="business-end-time" value={formatTimeValue(businessEndTime)} readOnly />
            <span className="clock-icon"><FaRegClock /></span>
          </div>
        </div>
        <div className="divider"></div>
        <div className="timeout-section">
          <h2 className="subtitle section-title">Session Timeout</h2>
          <p className="timeout-label">Select the session timeout duration:</p>
          <div className="radio-group">
            <label className="radio-label green-radio">
              <input
                type="radio"
                value="15"
                checked={sessionTimeout === "15"}
                onChange={(e) => setSessionTimeout(e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-text">15 minutes</span>
            </label>
            <label className="radio-label green-radio">
              <input
                type="radio"
                value="30"
                checked={sessionTimeout === "30"}
                onChange={(e) => setSessionTimeout(e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-text">30 minutes</span>
            </label>
            <label className="radio-label green-radio">
              <input
                type="radio"
                value="60"
                checked={sessionTimeout === "60"}
                onChange={(e) => setSessionTimeout(e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-text">60 minutes</span>
            </label>
          </div>
        </div>
        <button className="save-button green-save" onClick={handleSave}>
          Save Settings
        </button>
        {activeTimePicker && (
          <div className="time-picker" ref={timePickerRef}>
            <div className="time-picker-section">
              <h3 className="time-picker-label">Select Hour</h3>
              <div className="time-picker-options">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={`time-picker-option ${getCurrentTimeValue().hours === hour ? "selected green-selected" : ""}`}
                    onClick={() => handleHourChange(hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
            <div className="time-picker-section">
              <h3 className="time-picker-label">Select Minute</h3>
              <div className="time-picker-options">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    className={`time-picker-option ${getCurrentTimeValue().minutes === minute ? "selected green-selected" : ""}`}
                    onClick={() => handleMinuteChange(minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
            <div className="time-picker-section">
              <h3 className="time-picker-label">Select AM/PM</h3>
              <div className="time-picker-options period">
                {["AM", "PM"].map((period) => (
                  <div
                    key={period}
                    className={`time-picker-option ${getCurrentTimeValue().period === period ? "selected green-selected" : ""}`}
                    onClick={() => handlePeriodChange(period)}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeManagement;




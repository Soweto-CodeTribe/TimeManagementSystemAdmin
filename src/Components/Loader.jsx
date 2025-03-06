"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import "./styling/Loader.css"

// eslint-disable-next-line react/prop-types
export default function Loader({ isLoading = true }) {
  const [progress, setProgress] = useState(0)
  const [canHide, setCanHide] = useState(false)
  const intervalRef = useRef(null)
  const showLoader = isLoading || !canHide
  
  // Reset state when loader is shown again
  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      setCanHide(false)
    }
  }, [isLoading])
  
  // Handle progress animation
  useEffect(() => {
    if (showLoader) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Start new progress interval
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          // Slow down as we approach 100%
          if (prev < 70) return prev + 2
          if (prev < 90) return prev + 0.8
          if (prev < 99) return prev + 0.4
          
          // When we reach 100%, allow hiding after a short delay
          clearInterval(intervalRef.current)
          
          // Add a small delay before allowing the loader to hide
          setTimeout(() => {
            setCanHide(true)
          }, 500) // Show 100% for half a second
          
          return 100
        })
      }, 5)
    }
    
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [showLoader])
  
  if (!showLoader) return null
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="loaderContainer"
    >
      <div className="loaderContent">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="logoContainer"
        >
          <div className="logo-animation">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="logo-ring logo-ring-outer"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="logo-ring logo-ring-inner"
            />
            <div className="logo-center-wrapper">
              <motion.div
                animate={{ 
                  scale: [1, 1.03, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="logo-center"
              >
                CT
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar-bg">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
            
            {/* Subtle glow effect */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="progress-bar-glow"
            />
          </div>
          
          <div className="progress-text-container">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="progress-text"
            >
              Loading
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="progress-text"
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </div>
        
        {/* Feature Icons */}
        <div className="icons-grid">
          {[
            { icon: "users", label: "Trainees" },
            { icon: "chart", label: "Progress" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.1 * i, 
                duration: 0.5,
                ease: "easeOut"
              }}
              className="icon-container"
            >
              <div className="icon-box">
                {item.icon === "users" && (
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="icon-svg"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: i * 0.20
                    }}
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </motion.svg>
                )}
                
                {item.icon === "chart" && (
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="icon-svg"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </motion.svg>
                )}
              </div>
              <span className="icon-label">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

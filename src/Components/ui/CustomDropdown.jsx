import React, { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ options, value, onChange, placeholder = 'Select...', disabled = false }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    if (!disabled) {
      onChange(option.value);
      setOpen(false);
    }
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className={`custom-dropdown${disabled ? ' disabled' : ''}`} ref={dropdownRef}>
      <div
        className={`dropdown-selected${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        tabIndex={0}
        onBlur={() => setOpen(false)}
      >
        {selectedLabel}
        <span className="dropdown-arrow">▼</span>
      </div>
      {open && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option${value === option.value ? ' selected' : ''}`}
              onClick={() => handleSelect(option)}
              onMouseDown={e => e.preventDefault()}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

import React, { useState } from 'react';

const Checkbox = ({ initialChecked, onChange, label }) => {
  const [isChecked, setIsChecked] = useState(initialChecked);

  const handleToggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange(newChecked);
  };

  return (
    <div className="checkbox-item">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
        className="checkbox checkbox-primary"
      />
      <span className={`checkbox-label ${isChecked ? 'checked' : ''}`}>{label}</span>
    </div>
  );
};

export default Checkbox;
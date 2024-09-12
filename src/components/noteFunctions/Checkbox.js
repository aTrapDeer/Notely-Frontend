import React, { useState } from 'react';

const Checkbox = ({ initialChecked, onChange, label }) => {
  const [isChecked, setIsChecked] = useState(initialChecked);

  const handleToggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange(newChecked);
  };

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
        className="form-checkbox h-5 w-5 text-blue-600"
      />
      <span className="ml-2 text-gray-700">{label}</span>
    </div>
  );
};

export default Checkbox;
import React from 'react';

const FilterTabs = ({ tabs, activeTab, onTabChange }) => {
  const formatTabName = (tab) => {
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === tab
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {formatTabName(tab)}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
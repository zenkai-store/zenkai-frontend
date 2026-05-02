// src/components/ThemeToggle.jsx
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  //const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      //onClick={toggleTheme}
      className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl 
                bg-gradient-to-r from-gray-100 to-gray-200 
                dark:from-gray-700 dark:to-gray-800
                hover:from-gray-200 hover:to-gray-300 
                dark:hover:from-gray-600 dark:hover:to-gray-700
                transition-all duration-200 
                text-gray-700 dark:text-gray-300 
                font-medium text-sm
                shadow-sm hover:shadow-md
                border border-gray-200 dark:border-gray-700"
    >
      {isDarkMode ? (
        <>
          <Sun size={18} />
          Light Mode
        </>
      ) : (
        <>
          <Moon size={18} />
          Dark Mode
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

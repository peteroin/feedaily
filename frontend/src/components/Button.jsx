import clsx from "clsx";
import React from "react";
import { Link } from "react-router-dom";

const Button = ({ 
  id, 
  title, 
  rightIcon, 
  leftIcon, 
  containerClass, 
  onClick, 
  to, 
  external = false // 🔹 new prop
}) => {
  const classes = clsx(
    "group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-violet-50 px-7 py-3 text-black",
    containerClass
  );

  const content = (
    <>
      {leftIcon}

      <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
        <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
          {title}
        </div>
        <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
          {title}
        </div>
      </span>

      {rightIcon}
    </>
  );

  // ✅ Case 1: External link (opens in new tab)
  if (to && external) {
    return (
      <a 
        id={id} 
        href={to} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={classes}
      >
        {content}
      </a>
    );
  }

  // ✅ Case 2: Internal navigation (React Router)
  if (to) {
    return (
      <Link id={id} to={to} className={classes}>
        {content}
      </Link>
    );
  }

  // ✅ Case 3: Normal button with onClick
  return (
    <button id={id} onClick={onClick} className={classes}>
      {content}
    </button>
  );
};

export default Button;

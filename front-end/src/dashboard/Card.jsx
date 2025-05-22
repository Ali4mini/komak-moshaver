import React from 'react';

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
      {title && <h2 className="text-xl font-semibold text-slate-700 mb-4">{title}</h2>}
      <div>{children}</div>
    </div>
  );
}

export default Card;

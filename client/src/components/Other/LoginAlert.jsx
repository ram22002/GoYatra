import React from 'react';

const LoginAlert = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="mb-6">You need to be logged in to create a trip.</p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginAlert;

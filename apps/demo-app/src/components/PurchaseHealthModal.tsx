"use client";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

const PurchaseHealthModal = ({
  visible,
  onPurchase,
  onClose,
}: {
  visible: boolean;
  onPurchase: () => void;
  onClose: () => void;
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FaTimes className="text-gray-800 dark:text-gray-200" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Purchase Health
          </h2>
          
          <div className="w-full mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-2">5 Health Points</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get back to learning immediately
              </p>
              <p className="text-2xl font-bold">$0.99</p>
            </div>
          </div>

          <button
            onClick={onPurchase}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold mb-2"
          >
            Purchase Now
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-full font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHealthModal;
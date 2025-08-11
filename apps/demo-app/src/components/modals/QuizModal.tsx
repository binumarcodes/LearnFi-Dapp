"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaClock,
  FaCheck,
  FaTimesCircle,
  FaStar,
  FaExclamationTriangle,
  FaLightbulb,
  FaArrowRight,
  FaInfoCircle
} from "react-icons/fa";

interface QuizModalProps {
  visible: boolean;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  onQuizComplete: (isCorrect: boolean) => void;
  onCancel: (skipped: boolean) => void;
}

const QuizModal = ({
  visible,
  question,
  options,
  answer,
  explanation,
  onQuizComplete,
  onCancel,
}: QuizModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMistakeExplanation, setShowMistakeExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const rotateAnim = useRef(0);

  useEffect(() => {
    if (visible) {
      setSelected(null);
      setHasSubmitted(false);
      setShowFeedback(false);
      setIsCorrect(false);
      setShowMistakeExplanation(false);
      setTimeLeft(30);
    }
  }, [visible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let animationFrame: number;

    const updateRotation = () => {
      rotateAnim.current = (rotateAnim.current + 0.5) % 360;
      animationFrame = requestAnimationFrame(updateRotation);
    };

    if (visible && !hasSubmitted) {
      setTimeLeft(30);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      animationFrame = requestAnimationFrame(updateRotation);
    }

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(animationFrame);
    };
  }, [visible, hasSubmitted]);

  const triggerFeedback = (correct: boolean) => {
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setTimeout(() => {
        handleProceed(correct);
      }, 1500);
    }
  };

  const handleProceed = (correct: boolean) => {
    setShowFeedback(false);
    setHasSubmitted(false);
    setSelected(null);
    onQuizComplete?.(correct);
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    const correct = selected === answer;
    setIsCorrect(correct);
    triggerFeedback(correct);
  };

  const handleGotIt = () => {
    setShowFeedback(false);
    setHasSubmitted(false);
    setSelected(null);
    onQuizComplete?.(isCorrect);
  };

  if (!question || !Array.isArray(options) || !answer) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: rotateAnim.current }}
                  className="text-blue-500 dark:text-blue-400"
                >
                  <FaClock className="text-xl" />
                </motion.div>
                <span className="font-medium text-gray-800 dark:text-white">
                  {timeLeft} <span className="text-gray-500 dark:text-gray-300">s</span>
                </span>
              </div>
              <button
                onClick={() => onCancel(true)}
                disabled={hasSubmitted}
                className={`p-1 rounded-full transition-colors ${
                  hasSubmitted 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Question and Options */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                {question}
              </h3>

              <div className="space-3">
                {options.map((option, index) => {
                  const isSelected = selected === option;
                  const isCorrectAnswer = option === answer;
                  let optionClasses = "w-full p-4 rounded-lg border transition-all text-left";

                  // Base styling
                  optionClasses += " bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white";

                  // Selected but not submitted
                  if (isSelected && !hasSubmitted) {
                    optionClasses += " border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30";
                  }

                  // Submitted states
                  if (hasSubmitted) {
                    if (isSelected && !isCorrectAnswer) {
                      optionClasses += " border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-30";
                    } else if (isCorrectAnswer) {
                      optionClasses += " border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-30";
                    }
                  }

                  return (
                    <button
                      key={index}
                      className={`${optionClasses} mb-3 last:mb-0`}
                      disabled={hasSubmitted}
                      onClick={() => !hasSubmitted && setSelected(option)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{option}</span>
                        {hasSubmitted && (
                          <>
                            {isSelected && !isCorrectAnswer && (
                              <FaTimesCircle className="text-red-500 text-lg" />
                            )}
                            {isCorrectAnswer && (
                              <FaCheck className="text-green-500 text-lg" />
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6">
              {!hasSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className={`w-full py-3 px-6 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                    !selected
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Submit Answer
                </button>
              ) : showFeedback && isCorrect ? (
                <button
                  onClick={() => handleProceed(isCorrect)}
                  className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-all flex items-center justify-center gap-2"
                >
                  Continue <FaArrowRight />
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowMistakeExplanation(true)}
                    className="w-full py-3 px-6 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <FaLightbulb /> Learn Why
                  </button>
                  <button
                    onClick={handleGotIt}
                    className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-all"
                  >
                    Got It
                  </button>
                </div>
              )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`mx-6 mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    isCorrect
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {isCorrect ? (
                    <FaStar className="text-xl" />
                  ) : (
                    <FaExclamationTriangle className="text-xl" />
                  )}
                  <div className="flex items-center">
                    <span className="font-bold">
                      {isCorrect ? "Correct!" : "Incorrect!"}
                    </span>
                    <span className="ml-2">
                      {isCorrect ? "+10 XP" : "-1 Health point"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Explanation Modal */}
          <AnimatePresence>
            {showMistakeExplanation && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25 }}
                  className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl p-6 shadow-xl"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <FaInfoCircle className="text-blue-500 text-xl" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Explanation:
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {explanation || "No explanation found!"}
                  </p>
                  <button
                    onClick={() => setShowMistakeExplanation(false)}
                    className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuizModal;
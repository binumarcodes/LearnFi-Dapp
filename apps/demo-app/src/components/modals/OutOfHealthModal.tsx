"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../util/firebase";
import { FaTimes, FaRedo } from "react-icons/fa";
import BrokenHeartIcon from "../icons/BrokenHeartIcon";
import PurchaseHealthModal from "../PurchaseHealthModal";

type WaitingQuote = {
  text: string;
  category: string;
};

const OutOfHealthModal = ({
  timeRemaining,
  visible = false,
  onRequestHealth,
  onPurchaseHealth,
  onClose,
}: {
  timeRemaining?: string;
  visible?: boolean;
  onRequestHealth?: () => void;
  onPurchaseHealth?: () => void;
  onClose?: () => void;
}) => {
  const [quotes, setQuotes] = useState<WaitingQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState("Loading quotes...");
  const [currentCategory, setCurrentCategory] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeParts = timeRemaining?.split(":") ?? ["00", "00", "00"];

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const snapshot = await getDocs(collection(db, "waitingQuotes"));
      
      if (snapshot.empty) {
        setError("No quotes available");
        return;
      }

      const data: WaitingQuote[] = snapshot.docs.map(doc => ({
        text: doc.data().text || "No quote text",
        category: doc.data().category || "",
      }));

      setQuotes(data);
      pickRandomQuote(data);
    } catch (error) {
      console.error("Error in fetchQuotes:", error);
      setError("Failed to load quotes");
      setCurrentQuote("Couldn't load quotes");
    } finally {
      setLoading(false);
    }
  };

  const pickRandomQuote = (dataArray?: WaitingQuote[]) => {
    try {
      const source = dataArray ?? quotes;
      if (!source || source.length === 0) {
        setCurrentQuote("No quotes available");
        return;
      }

      const randomIndex = Math.floor(Math.random() * source.length);
      const randomItem = source[randomIndex];
      
      setCurrentQuote(randomItem.text);
      setCurrentCategory(randomItem.category);
    } catch (error) {
      console.error("Error in pickRandomQuote:", error);
      setCurrentQuote("Error loading quote");
    }
  };

  useEffect(() => {
    if (visible) {
      fetchQuotes();
      
      const interval = setInterval(() => {
        pickRandomQuote();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleRegenerate = () => {
    pickRandomQuote();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FaTimes className="text-gray-800 dark:text-gray-200" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <BrokenHeartIcon className="w-24 h-24 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You're out of health!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Next health will be available in
          </p>

          {/* Timer */}
          <div className="flex border border-yellow-400 rounded-lg overflow-hidden mb-8">
            {timeParts.map((val, index) => (
              <React.Fragment key={index}>
                <div className="px-6 py-3 bg-yellow-400 bg-opacity-10 flex-1 text-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {val.trim?.() || "00"}
                  </span>
                </div>
                {index < 2 && (
                  <div className="w-px bg-yellow-400" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Quote Section */}
          {loading ? (
            <div className="flex flex-col items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading inspirational quotes...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={fetchQuotes}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {currentCategory && (
                <p className="text-blue-500 dark:text-blue-400 font-medium mb-1">
                  {currentCategory}
                </p>
              )}
              <p className="text-gray-800 dark:text-gray-200 text-center mb-6 px-4 leading-relaxed">
                {currentQuote}
              </p>
            </>
          )}

          {/* Regenerate Button */}
          <button
            onClick={handleRegenerate}
            disabled={loading || !!error}
            className={`w-full py-3 px-4 rounded-full font-bold mb-4 flex items-center justify-center gap-2 ${
              loading || error
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <FaRedo />
            {loading ? "Loading..." : error ? "Try Again" : "Regenerate Quotes"}
          </button>
        </div>
      </div>

      <PurchaseHealthModal
        visible={isModalVisible}
        onPurchase={() => {
          onPurchaseHealth?.();
          setIsModalVisible(false);
        }}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default OutOfHealthModal;
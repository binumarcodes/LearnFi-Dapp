"use client";
import { useEffect, useRef, useState } from "react";
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../components/util/firebase";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { AnimatePresence, motion } from "framer-motion";

// Modals
import QuizModal from "./modals/QuizModal";
import CommentModal from "./modals/CommentModal";
import OutOfHealthModal from "./modals/OutOfHealthModal";

interface VideoControlsProps {
  videoId: string;
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  initialSaves?: number;
  quizRequired?: boolean;
  quizCompleted?: boolean;
  isHealthDepleted?: boolean;
  timeRemaining?: string;
  onQuizPress?: () => void;
  onRequestHealth?: () => void;
  onPurchaseHealth?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  initialSaves = 0,
  quizRequired = false,
  quizCompleted = false,
  isHealthDepleted = false,
  timeRemaining = "",
  onQuizPress = () => {},
  onRequestHealth = () => {},
  onPurchaseHealth = () => {},
}) => {
  const { data: account } = useAbstraxionAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [outOfHealthVisible, setOutOfHealthVisible] = useState(false);
  
  // Counts
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [shareCount, setShareCount] = useState(initialShares);
  const [saveCount, setSaveCount] = useState(initialSaves);

  // Modals
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const pulseAnim = useRef(1);

  // SVG Icons
  const LikeIcon = () => <img src="/icons/like.svg" alt="Like" className="w-6 h-6" />;
  const LikedIcon = () => <img src="/icons/liked.svg" alt="Liked" className="w-6 h-6 text-red-500" />;
  const CommentIcon = () => <img src="/icons/chat.svg" alt="Comment" className="w-6 h-6" />;
  const ShareIcon = () => <img src="/icons/share.svg" alt="Share" className="w-6 h-6" />;
  const BookmarkIcon = () => <img src="/icons/bookmark.svg" alt="Save" className="w-6 h-6" />;
  const SavedIcon = () => <img src="/icons/saved.svg" alt="Saved" className="w-6 h-6 text-yellow-400" />;
  const QuizIcon = () => <img src="/icons/quizIcon.svg" alt="Quiz" className="w-6 h-6" />;
  const CheckIcon = () => <img src="/icons/checkMark.svg" alt="Completed" className="w-3 h-3" />;
  const LockIcon = () => <img src="/icons/lock.svg" alt="Locked" className="w-3 h-3" />;
  const LightBulbIcon = () => <img src="/icons/lightbulb.svg" alt="Quiz" className="w-6 h-6" />;

  const handleAuthCheck = (action: () => void) => {
    if (!account?.bech32Address) {
      // Handle authentication requirement
      return;
    }
    action();
  };

  const handleQuizPress = () => {
    if (isHealthDepleted) {
      setOutOfHealthVisible(true);
      return;
    }
    onQuizPress();
  };

  // Load video data
  useEffect(() => {
    if (!videoId) {
      setIsLoading(false);
      setLoadFailed(true);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "content", videoId),
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLikesCount(data.likes || 0);
            setSaveCount(data.saves || 0);
            setShareCount(data.shares || 0);
            setCommentsCount(data.comments || 0);
            setLoadFailed(false);
          } else {
            console.warn('Video document does not exist');
            setLoadFailed(true);
          }
        } catch (error) {
          console.error('Error processing snapshot:', error);
          setLoadFailed(true);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Snapshot error:', error);
        setLoadFailed(true);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [videoId]);

  // Check user interactions
  useEffect(() => {
    if (!account?.bech32Address || !videoId) return;

    const checkInteractions = async () => {
      try {
        const userRef = doc(db, "learners", account.bech32Address);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setSaved(userData?.savedVideos?.includes(videoId) ?? false);
          setLiked(userData?.likedVideos?.includes(videoId) ?? false);
        }
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };

    checkInteractions();
  }, [account?.bech32Address, videoId]);

  const toggleLike = async () => {
    handleAuthCheck(async () => {
      if (!videoId || !account?.bech32Address) return;

      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

      try {
        const batch = [];
        const videoRef = doc(db, "content", videoId);
        const userRef = doc(db, "learners", account.bech32Address);

        batch.push(updateDoc(videoRef, {
          likes: increment(newLikedState ? 1 : -1)
        }));

        batch.push(updateDoc(userRef, {
          likedVideos: newLikedState 
            ? arrayUnion(videoId) 
            : arrayRemove(videoId)
        }));

        await Promise.all(batch);
      } catch (error) {
        console.error('Failed to update likes:', error);
        setLiked(!newLikedState);
        setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
        alert('Could not update like status');
      }
    });
  };

  const toggleSave = async () => {
    if (!videoId || !account?.bech32Address) return;

    const newSavedState = !saved;
    setSaved(newSavedState);
    setSaveCount(prev => newSavedState ? prev + 1 : prev - 1);

    try {
      const batch = [];
      const videoRef = doc(db, "content", videoId);
      const userRef = doc(db, "learners", account.bech32Address);

      batch.push(updateDoc(videoRef, {
        saves: increment(newSavedState ? 1 : -1)
      }));

      batch.push(updateDoc(userRef, {
        savedVideos: newSavedState 
          ? arrayUnion(videoId) 
          : arrayRemove(videoId)
      }));

      await Promise.all(batch);
    } catch (error) {
      console.error('Failed to update save status:', error);
      setSaved(!newSavedState);
      setSaveCount(prev => newSavedState ? prev - 1 : prev + 1);
      alert('Could not update save status');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "LearnFi 🔥",
        text: `🔥 I'm learning with LearnFi! Check out this app`,
      });

      // Count the share if successful
      await updateDoc(doc(db, "content", videoId), {
        shares: increment(1),
      });
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatCount = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const handleCommentAdded = (newCount: number) => {
    setCommentsCount(newCount);
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-8 right-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="fixed bottom-8 right-8 text-white text-sm">
        Failed to load controls
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-80 flex flex-col items-center gap-6 z-50">
      {/* Quiz Button */}
      <motion.div 
        animate={{ scale: quizCompleted ? 1 : [1, 1.05, 1] }}
        transition={{ repeat: quizCompleted ? 0 : Infinity, duration: 1.2 }}
        className="flex flex-col items-center"
      >
        <button
          onClick={() => handleAuthCheck(handleQuizPress)}
          className={`relative p-3 rounded-full ${quizCompleted ? 'bg-green-500' : 'bg-yellow-400'} shadow-lg hover:shadow-yellow-400/50 transition-all`}
          disabled={quizCompleted}
        >
          <LightBulbIcon />
          
          {!quizCompleted && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              NEW
            </div>
          )}

          {quizCompleted && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full p-1">
              <CheckIcon />
            </div>
          )}
        </button>
        <span className="text-white text-sm font-medium mt-1">Quiz</span>
      </motion.div>

      {/* Like Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={toggleLike}
          className="p-3 rounded-full bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/50 transition-all"
        >
          {liked ? <LikedIcon /> : <LikeIcon />}
        </button>
        <span className="text-white text-sm mt-1">
          {likesCount > 0 ? formatCount(likesCount) : "Like"}
        </span>
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center relative">
        <button
          onClick={() => {
            if (quizRequired && !quizCompleted) {
              setShowTooltip(!showTooltip);
            } else {
              setIsCommentModalVisible(true);
            }
          }}
          className={`p-3 rounded-full ${quizRequired && !quizCompleted ? 'opacity-70' : 'bg-gray-800/30'} backdrop-blur-sm hover:bg-gray-700/50 transition-all relative`}
        >
          <CommentIcon />
          {quizRequired && !quizCompleted && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
              <LockIcon />
            </div>
          )}
        </button>
        
        {showTooltip && quizRequired && !quizCompleted && (
          <div className="absolute right-14 top-0 bg-gray-800 p-3 rounded-lg shadow-lg w-48">
            <p className="text-white text-sm mb-2">Complete the quiz to unlock comments</p>
            <button 
              onClick={() => {
                setShowTooltip(false);
                handleQuizPress();
              }}
              className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium"
            >
              Take Quiz
            </button>
          </div>
        )}
        
        <span className="text-white text-sm mt-1">
          {commentsCount > 0 ? formatCount(commentsCount) : "Comment"}
        </span>
      </div>

      {/* Save Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={toggleSave}
          className="p-3 rounded-full bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/50 transition-all"
        >
          {saved ? <SavedIcon /> : <BookmarkIcon />}
        </button>
        <span className="text-white text-sm mt-1">
          {saveCount > 0 ? formatCount(saveCount) : "Save"}
        </span>
      </div>

      {/* Share Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleShare}
          className="p-3 rounded-full bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/50 transition-all"
        >
          <ShareIcon />
        </button>
        <span className="text-white text-sm mt-1">
          {shareCount > 0 ? formatCount(shareCount) : "Share"}
        </span>
      </div>

      {/* Comment Modal */}
      <CommentModal
        visible={isCommentModalVisible}
        videoId={videoId}
        onClose={() => setIsCommentModalVisible(false)}
        currentUser={account ? {
          uid: account.bech32Address,
          displayName: "User",
          photoURL: undefined
        } : null}
        onCommentAdded={handleCommentAdded}
      />

      {/* Out of Health Modal */}
      <OutOfHealthModal
        timeRemaining={timeRemaining}
        onRequestHealth={onRequestHealth}
        onPurchaseHealth={onPurchaseHealth}
        visible={outOfHealthVisible}
        onClose={() => setOutOfHealthVisible(false)}
      />
    </div>
  );
};

export default VideoControls;
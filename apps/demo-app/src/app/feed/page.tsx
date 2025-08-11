"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, increment, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../components/util/firebase";
import QuizModal from "../../components/modals/QuizModal";
import StatusIndicators from "../../components/StatusIndicator";
import VideoControls from "../../components/VideoControls"; // Import the VideoControls component
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import OutOfHealthModal from "../../components/modals/OutOfHealthModal";

interface VideoData {
  id: string;
  videoUrl: string;
  profilePicture?: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  quiz?: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  };
  subject?: string;
  title?: string;
  topicNumber?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface UserStats {
  health: number;
  xp: number;
  healthRestoreTime?: string;
}

const Page = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [showOutOfHealthModal, setShowOutOfHealthModal] = useState(false);
  const [healthRestoreTime, setHealthRestoreTime] = useState("");
  const [currentQuiz, setCurrentQuiz] = useState<{
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  } | null>(null);
  const [stats, setStats] = useState<UserStats>({ health: 5, xp: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);

  const { data: account } = useAbstraxionAccount();

  // Health status monitoring
  useEffect(() => {
    if (stats.health === 0 && stats.healthRestoreTime) {
      setShowOutOfHealthModal(true);
      setHealthRestoreTime(stats.healthRestoreTime);
    } else {
      setShowOutOfHealthModal(false);
    }
  }, [stats.health, stats.healthRestoreTime]);

  // Real-time stats listener
  useEffect(() => {
    if (!account?.bech32Address) return;

    const userRef = doc(db, "learners", account.bech32Address);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          health: data.health || 5,
          xp: data.xp || 0,
          healthRestoreTime: data.healthRestoreTime || undefined
        });
      }
    });

    return () => unsubscribe();
  }, [account?.bech32Address]);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const calculateTimeRemaining = (restoreTime?: string): string => {
    if (!restoreTime) return "00:00:00";
    const now = new Date();
    const restoreDate = new Date(restoreTime);
    const diff = restoreDate.getTime() - now.getTime();
    if (diff <= 0) return "00:00:00";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "content"));
        const videosData: VideoData[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as VideoData
        }));
        setVideos(shuffleArray(videosData));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const markAsWatched = (videoId: string) => {
    if (!watchedVideos.has(videoId)) {
      setWatchedVideos(prev => new Set(prev).add(videoId));
    }
  };

  const handleQuizClick = () => {
    if (currentVideo?.quiz) {
      setCurrentQuiz(currentVideo.quiz);
      setShowQuiz(true);
    }
  };

  const handleVideoChange = (index: number) => {
    setCurrentIndex(index);
    if (videos[index]?.id) {
      markAsWatched(videos[index].id);
    }
  };

  const updateUserStats = async (isCorrect: boolean) => {
    try {
      if (!account?.bech32Address) {
        console.error("No user account available");
        return;
      }

      const userRef = doc(db, "learners", account.bech32Address);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User document doesn't exist");
        return;
      }

      const currentData = userDoc.data();
      const currentHealth = currentData.health || 5;
      
      let updates: any = {
        xp: increment(isCorrect ? 10 : 0),
        lastHealthUpdate: new Date().toISOString()
      };

      if (!isCorrect) {
        const newHealth = Math.max(0, currentHealth - 1);
        updates.health = newHealth;
        
        if (newHealth === 0) {
          const restoreTime = new Date(Date.now() + 5 * 60 * 1000);
          updates.healthRestoreTime = restoreTime.toISOString();
        }
      } else if (currentHealth === 0 && currentData.healthRestoreTime) {
        updates.healthRestoreTime = null;
      }

      await updateDoc(userRef, updates);
      console.log(`User stats updated: ${isCorrect ? "+10 XP" : "-1 Health"}`);
      
      // If quiz was answered correctly, mark as completed
      if (isCorrect && currentVideo?.quiz) {
        setQuizCompleted(true);
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-bounce">
          <div className="w-16 h-16 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load videos</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No videos available</p>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className="relative h-screen overflow-hidden" style={{ backgroundColor: '#15202B' }}>
      <StatusIndicators />

      <div className="relative h-full w-full flex items-center justify-center">
        <video
          key={currentVideo.id}
          src={currentVideo.videoUrl}
          controls
          className="h-full w-full object-contain"
          autoPlay
          playsInline
        />
        
        <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center mb-2">
            <img 
              src={currentVideo.profilePicture || "/default-profile.png"} 
              alt={currentVideo.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="text-white font-bold">{currentVideo.username}</span>
          </div>
          <p className="text-white text-sm mb-2">{currentVideo.description}</p>
          
          {(currentVideo.subject || currentVideo.title) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {currentVideo.subject && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                  {currentVideo.subject}
                </span>
              )}
              {currentVideo.title && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                  {currentVideo.title}
                </span>
              )}
              {currentVideo.topicNumber && (
                <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                  Topic {currentVideo.topicNumber}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Controls Component */}
      <VideoControls
        videoId={currentVideo.id}
        initialLikes={currentVideo.likes}
        initialComments={currentVideo.comments}
        initialShares={currentVideo.shares}
        initialSaves={currentVideo.saves}
        quizRequired={!!currentVideo.quiz}
        quizCompleted={quizCompleted}
        isHealthDepleted={stats.health === 0}
        timeRemaining={healthRestoreTime}
        onQuizPress={handleQuizClick}
        onPurchaseHealth={() => updateUserStats(true)}
      />

      {/* Navigation Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        <button 
          className="bg-gray-800 bg-opacity-50 rounded-full p-2"
          onClick={() => handleVideoChange(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button 
          className="bg-gray-800 bg-opacity-50 rounded-full p-2"
          onClick={() => handleVideoChange(Math.min(videos.length - 1, currentIndex + 1))}
          disabled={currentIndex === videos.length - 1}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {currentQuiz && (
        <QuizModal
          visible={showQuiz}
          question={currentQuiz.question}
          options={currentQuiz.options}
          answer={currentQuiz.answer}
          explanation={currentQuiz.explanation}
          onQuizComplete={async (isCorrect) => {
            setShowQuiz(false);
            await updateUserStats(isCorrect);
          }}
          onCancel={() => setShowQuiz(false)}
        />
      )}

      <OutOfHealthModal
        visible={showOutOfHealthModal}
        timeRemaining={calculateTimeRemaining(healthRestoreTime)}
        onClose={() => setShowOutOfHealthModal(false)}
        onPurchaseHealth={() => {
          updateUserStats(true);
          setShowOutOfHealthModal(false);
        }}
      />
    </div>
  );
};

export default Page;
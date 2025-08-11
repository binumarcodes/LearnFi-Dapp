'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../components/util/firebase';
import { useAuth } from '../../context/AuthContext';
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { FiMoreVertical, FiEdit, FiUserPlus, FiHeart, FiAward, FiStar } from 'react-icons/fi';
import { FaWallet, FaUserFriends } from 'react-icons/fa';

const ProfilePage = () => {
  const router = useRouter();
  const { user, isGuest, logout } = useAuth();
  const { data: account } = useAbstraxionAccount();
  const [userData, setUserData] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [health, setHealth] = useState(5);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth status
  useEffect(() => {
    if (!user || isGuest) {
      setLoading(false);
      // Redirect to auth modal would be handled by your auth flow
    } else {
      setAuthChecked(true);
      fetchData();
    }
  }, [user, isGuest]);

 // In your profile page component
const fetchUserStats = async () => {
  if (!user && !account?.bech32Address) return;

  try {
    const userId = account?.bech32Address || user?.uid;
    const userRef = doc(db, "learners", userId);
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        setXp(data.xp ?? 0);
        setHealth(Math.max(0, Math.min(5, data.health ?? 5))); // Clamp value
      }
    });

    return unsubscribe; // Cleanup on unmount
  } catch (error) {
    console.error("Error fetching user stats:", error);
  }
};

// Update the useEffect
useEffect(() => {
  let unsubscribe: () => void;
  
  const init = async () => {
    if (!user && !account?.bech32Address) return;
    setLoading(true);
    try {
      unsubscribe = await fetchUserStats();
      const newStreak = await updateUserStreak();
      setStreak(newStreak);
    } catch (e) {
      console.error("Error initializing:", e);
    } finally {
      setLoading(false);
    }
  };

  init();
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [user, account?.bech32Address]);

  const updateUserStreak = async () => {
    if (!user && !account?.bech32Address) return 0;

    try {
      const userId = account?.bech32Address || user?.uid;
      const userRef = doc(db, "learners", userId);
      const userDoc = await getDoc(userRef);
      const todayStr = new Date().toISOString().slice(0, 10);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          currentStreak: 1,
          lastActivityDate: todayStr,
        });
        return 1;
      }

      const data = userDoc.data();
      const lastDateStr = data.lastActivityDate || "";
      const currentStreak = data.currentStreak || 0;
      const lastDate = new Date(lastDateStr);
      const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = currentStreak;
      if (lastDateStr === todayStr) return currentStreak;
      if (diffDays === 1) newStreak += 1;
      else newStreak = 1;

      await updateDoc(userRef, {
        currentStreak: newStreak,
        lastActivityDate: todayStr,
      });
      return newStreak;
    } catch (error) {
      console.error("Error updating streak:", error);
      return 0;
    }
  };

  const fetchData = async () => {
    if (!user && !account?.bech32Address) return;
    
    setLoading(true);
    try {
      await fetchUserStats();
      const newStreak = await updateUserStreak();
      setStreak(newStreak);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (num: number) => {
    if (num < 10000) return num.toLocaleString();
    if (num < 1000000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    return `${(num / 1000000000).toFixed(num % 1000000000 === 0 ? 0 : 1)}B`;
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleFindFriends = () => {
    router.push('/friends');
  };

  const promptLogout = () => {
    setMenuVisible(false);
    setShowLogoutConfirmation(true);
  };

  const handleLogout = async () => {
    setShowLogoutConfirmation(false);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="relative bg-white dark:bg-gray-800 shadow-md pb-8 pt-16 px-6">
        <button 
          onClick={() => setMenuVisible(!menuVisible)}
          className="absolute top-6 right-6 text-gray-600 dark:text-gray-300"
        >
          <FiMoreVertical size={24} />
        </button>

        {menuVisible && (
          <div className="absolute right-6 top-16 bg-white dark:bg-gray-700 shadow-lg rounded-lg py-2 w-48 z-10">
            <button 
              onClick={handleEditProfile}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Edit Profile
            </button>
            <button 
              onClick={promptLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
            >
              Logout
            </button>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
              <img 
                src={userData?.avatar || "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault1.png?alt=media&token=867737ee-98a8-4d28-a8a5-fe577408c4a6"} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
            {userData?.username || (isGuest ? "Guest User" : "Anonymous")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {userData?.fullName || (isGuest ? "Sign in to personalize" : "No name provided")}
          </p>

     

          <div className="flex space-x-4 mt-6 w-full max-w-md">
            <button
              onClick={handleEditProfile}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <FiEdit className="mr-2" />
              Edit Profile
            </button>
            <button
              onClick={handleFindFriends}
              className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <FiUserPlus className="mr-2" />
              Find Friends
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 -mt-12">
        <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
              <FiAward className="text-gray-900" size={20} />
            </div>
            <p className="text-gray-400 text-sm mb-2">Current Streak</p>
            <p className="text-white font-bold text-xl">{streak} days</p>
          </div>
        </div>

        <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
              <FiStar className="text-gray-900" size={20} />
            </div>
            <p className="text-gray-400 text-sm mb-2">Total XP</p>
            <p className="text-white font-bold text-xl">{formatCount(xp)}</p>
          </div>
        </div>

        <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
              <FiHeart className="text-gray-900" size={20} />
            </div>
            <p className="text-gray-400 text-sm mb-2">Health Points</p>
            <p className="text-white font-bold text-xl">{health}/5</p>
          </div>
        </div>
      </div>

      {/* Additional Menu Items */}
      <div className="mt-8 px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <button 
            onClick={() => router.push('/wallet')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <FaWallet className="text-gray-600 dark:text-gray-300 mr-3" size={18} />
              <span className="text-gray-800 dark:text-white">Wallet</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <button 
            onClick={() => router.push('/friends')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <FaUserFriends className="text-gray-600 dark:text-gray-300 mr-3" size={18} />
              <span className="text-gray-800 dark:text-white">Friends</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Auth Button for Guests */}
      {(!user || isGuest) && (
        <div className="px-6 mt-8">
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg"
          >
            Sign Up / Log In
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Logout</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
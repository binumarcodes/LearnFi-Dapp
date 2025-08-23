import { useState, useEffect, useCallback } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { doc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../components/util/firebase';
import { debounce } from 'lodash';

interface UserInfoModalProps {
  onClose: () => void;
  onSubmit: (fullName: string, username: string, avatar: string) => void;
}

const AVATARS_PER_PAGE = 8;

// Default avatars (same as mobile)
const defaultAvatarUrls = [
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault1.png?alt=media&token=867737ee-98a8-4d28-a8a5-fe577408c4a6",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault2.png?alt=media&token=00236ac0-323c-47ba-9542-a05444c19a25",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault3.png?alt=media&token=d1cc3fb5-0dad-4cef-9cfb-0a5fb8298b8e",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault4.png?alt=media&token=2b8c7aaf-e2ea-42b9-bbf4-a209ae15358a",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault5.png?alt=media&token=c583157d-8e65-44be-b169-09b5ce8de155",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault6.png?alt=media&token=1c73c3ac-efa8-4121-8cfa-03807d183d4d",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault7.png?alt=media&token=2af4077b-df5f-4d9e-8a29-11fe8c47578d",
  "https://firebasestorage.googleapis.com/v0/b/voice-naija.appspot.com/o/avatars%2Fall%2Fdefault8.png?alt=media&token=47246d93-642b-4e11-b048-2dd461714f04",
];

export default function UserInfoModal({ onClose, onSubmit }: UserInfoModalProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [additionalAvatars, setAdditionalAvatars] = useState<string[]>([]);
  const [displayedAvatars, setDisplayedAvatars] = useState<string[]>(defaultAvatarUrls);
  const [loading, setLoading] = useState(false);
  const [hasMoreAvatars, setHasMoreAvatars] = useState(true);
  const [paginationToken, setPaginationToken] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

  const fetchAdditionalAvatars = async () => {
    if (loading || !hasMoreAvatars) return;

    setLoading(true);
    try {
      const storage = getStorage();
      const avatarsRef = ref(storage, "avatars/all");
      const result = await listAll(avatarsRef);

// Remove pagination handling since listAll returns everything
const nonDefaultItems = result.items
  .filter(item => !item.name.startsWith("default"))
  .sort((a, b) => {
    const aNum = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
    const bNum = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
    return aNum - bNum;
  });

const batchUrls = await Promise.all(nonDefaultItems.map(item => getDownloadURL(item)));

setAdditionalAvatars(prev => [...prev, ...batchUrls]);
setDisplayedAvatars([...defaultAvatarUrls, ...batchUrls]);
setHasMoreAvatars(false); // no pagination with listAll

    } catch (error) {
      console.error("Error fetching additional avatars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditionalAvatars();
  }, []);

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username.trim()) {
        setUsernameError(null);
        setIsUsernameAvailable(false);
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        setUsernameError("Only letters, numbers, and underscores allowed");
        setIsUsernameAvailable(false);
        return;
      }

      if (username.length < 3) {
        setUsernameError("Must be at least 3 characters");
        setIsUsernameAvailable(false);
        return;
      }

      if (username.length > 20) {
        setUsernameError("Must be less than 20 characters");
        setIsUsernameAvailable(false);
        return;
      }

      try {
        setIsCheckingUsername(true);
        const usersRef = collection(db, "learners");
        const q = query(usersRef, where("username", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setUsernameError(null);
          setIsUsernameAvailable(true);
        } else {
          setUsernameError("Username is taken");
          setIsUsernameAvailable(false);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Error checking availability");
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500),
    []
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setUsername(text);
    checkUsernameAvailability(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || selectedAvatar === null) return;
    
    if (!isUsernameAvailable) {
      await checkUsernameAvailability(username);
      if (!isUsernameAvailable) return;
    }

    setLoading(true);
    try {
      await onSubmit(fullName, username, displayedAvatars[selectedAvatar]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Complete Your Profile</h2>
        <p className="text-gray-400 mb-6">Choose a username and avatar to personalize your experience</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className={`w-full p-2 rounded bg-gray-700 text-white ${
                  usernameError ? 'border border-red-500' : ''
                } ${isUsernameAvailable ? 'border border-green-500' : ''}`}
                required
              />
              {isCheckingUsername && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            {usernameError && (
              <p className="text-red-500 text-xs mt-1">{usernameError}</p>
            )}
            {isUsernameAvailable && (
              <p className="text-green-500 text-xs mt-1">Username available!</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Choose an avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {displayedAvatars.map((avatar, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedAvatar(index)}
                  className={`cursor-pointer rounded-full overflow-hidden border-2 ${
                    selectedAvatar === index 
                      ? 'border-blue-500' 
                      : 'border-transparent'
                  }`}
                >
                  <img 
                    src={avatar} 
                    alt={`Avatar ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {hasMoreAvatars && (
              <button
                type="button"
                onClick={fetchAdditionalAvatars}
                disabled={loading}
                className="mt-3 text-blue-500 font-medium text-sm disabled:text-gray-500"
              >
                {loading ? 'Loading...' : 'Load More Avatars'}
              </button>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400 disabled:opacity-50"
              disabled={loading || !fullName || !isUsernameAvailable || selectedAvatar === null}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
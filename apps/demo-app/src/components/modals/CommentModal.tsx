"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  doc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDoc,
  writeBatch,
  increment
} from "firebase/firestore";
import { db } from "../../components/util/firebase";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaReply, FaPaperPlane, FaUser } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BsChat } from "react-icons/bs";

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: any;
  replies?: Reply[];
  showAllReplies?: boolean;
}

interface Reply {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: any;
  replyingTo?: string;
}

interface CommentModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
  } | null;
  onCommentAdded?: (newCount: number) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ 
  visible, 
  videoId, 
  onClose,
  currentUser,
  onCommentAdded
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  
  const { data: account } = useAbstraxionAccount();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Just now';
    
    const now = new Date();
    const commentDate = timestamp.toDate();
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d`;
    
    return commentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'learners', userId));
      if (userDoc.exists()) {
        return {
          username: userDoc.data().username || userDoc.data().displayName || 'Anonymous',
          avatar: userDoc.data().avatar || null
        };
      }
      return {
        username: 'Anonymous',
        avatar: null
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        username: 'Anonymous',
        avatar: null
      };
    }
  };

  const loadComments = useCallback(() => {
    if (!videoId) return () => {};

    setLoading(true);
    setError(null);

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('videoId', '==', videoId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFunctions: (() => void)[] = [];

    const unsubscribeMain = onSnapshot(q, 
      async (snapshot) => {
        const commentsData: Comment[] = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userData = data.username 
              ? { username: data.username, avatar: data.avatar }
              : await fetchUserData(data.userId);
            
            return {
              id: doc.id,
              userId: data.userId,
              username: userData.username,
              avatar: userData.avatar,
              text: data.text,
              createdAt: data.createdAt,
              replies: [],
              showAllReplies: false
            };
          })
        );

        setComments(commentsData);
        setLoading(false);

        commentsData.forEach(comment => {
          const repliesRef = collection(db, 'comments', comment.id, 'replies');
          const repliesQuery = query(repliesRef, orderBy('createdAt', 'asc'));
          
          const unsubscribeReplies = onSnapshot(repliesQuery, 
            async (repliesSnapshot) => {
              const replies = await Promise.all(
                repliesSnapshot.docs.map(async (replyDoc) => {
                  const replyData = replyDoc.data();
                  const userData = replyData.username 
                    ? { username: replyData.username, avatar: replyData.avatar }
                    : await fetchUserData(replyData.userId);
                  
                  return {
                    id: replyDoc.id,
                    userId: replyData.userId,
                    username: userData.username,
                    avatar: userData.avatar,
                    text: replyData.text,
                    replyingTo: replyData.replyingTo,
                    createdAt: replyData.createdAt,
                  };
                })
              );

              setComments(prev => prev.map(c => 
                c.id === comment.id ? { ...c, replies } : c
              ));
            },
            (err) => {
              console.error('Error fetching replies:', err);
            }
          );

          unsubscribeFunctions.push(unsubscribeReplies);
        });
      },
      (err) => {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again.');
        setLoading(false);
      }
    );

    unsubscribeFunctions.push(unsubscribeMain);

    return () => {
      unsubscribeFunctions.forEach(unsub => {
        try {
          if (unsub && typeof unsub === 'function') {
            unsub();
          }
        } catch (error) {
          console.error('Error during unsubscribe:', error);
        }
      });
    };
  }, [videoId]);

  useEffect(() => {
    const cleanup = loadComments();
    return () => {
      cleanup && cleanup();
    };
  }, [loadComments]);

  useEffect(() => {
    if (currentUser?.uid) {
      const fetchUserAvatar = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'learners', currentUser.uid));
          if (userDoc.exists()) {
            setUserAvatar(userDoc.data().avatar || null);
          }
        } catch (error) {
          console.error('Error fetching user avatar:', error);
          setUserAvatar(null);
        } finally {
          setAvatarLoading(false);
        }
      };

      fetchUserAvatar();
    } else {
      setAvatarLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (visible) {
      // Scroll to bottom when modal opens
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setReplyingTo(null);
      setReplyText('');
    }
  }, [visible]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser || !videoId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, 'learners', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      const batch = writeBatch(db);
      
      const commentsRef = collection(db, 'comments');
      const newCommentRef = doc(commentsRef);
      batch.set(newCommentRef, {
        videoId,
        userId: currentUser.uid,
        username: userData?.username || currentUser.displayName || 'Anonymous',
        avatar: userData?.avatar || null,
        text: newComment,
        createdAt: serverTimestamp(),
      });
      
      const videoRef = doc(db, 'content', videoId);
      batch.update(videoRef, {
        comments: increment(1)
      });
      
      await batch.commit();
      
      setNewComment('');
      if (onCommentAdded) {
        onCommentAdded(comments.length + 1);
      }
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !currentUser || !replyingTo) return;

    setIsSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, 'learners', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      const batch = writeBatch(db);
      
      const repliesRef = collection(db, 'comments', replyingTo.commentId, 'replies');
      const newReplyRef = doc(repliesRef);
      batch.set(newReplyRef, {
        userId: currentUser.uid,
        username: userData?.username || currentUser.displayName || 'Anonymous',
        avatar: userData?.avatar || null,
        text: replyText,
        replyingTo: replyingTo.username,
        createdAt: serverTimestamp(),
      });
      
      const videoRef = doc(db, 'content', videoId);
      batch.update(videoRef, {
        comments: increment(1)
      });
      
      await batch.commit();
      
      setReplyText('');
      setReplyingTo(null);
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (onCommentAdded) {
        onCommentAdded(comments.length + 1);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startReply = (commentId: string, username: string) => {
    setReplyingTo({ commentId, username });
    setReplyText(`@${username} `);
    setTimeout(() => {
      replyInputRef.current?.focus();
      replyInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleShowAllReplies = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, showAllReplies: !comment.showAllReplies } 
        : comment
    ));
  };

  const renderReplyItem = (reply: Reply) => (
    <div key={reply.id} className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-2">
        {reply.avatar ? (
          <img 
            src={reply.avatar} 
            alt={reply.username}
            className="w-7 h-7 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {reply.username}
            </span>
            {reply.replyingTo && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                → @{reply.replyingTo}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
            {reply.text}
          </p>
        </div>
      </div>
    </div>
  );

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-start gap-3">
        {comment.avatar ? (
          <img 
            src={comment.avatar} 
            alt={comment.username}
            className="w-9 h-9 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
            <FaUser className="text-white text-base" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 mt-1">
            {comment.text}
          </p>
          
          <button 
            onClick={() => startReply(comment.id, comment.username)}
            className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-1 flex items-center gap-1"
          >
            <FaReply className="text-xs" />
            Reply
          </button>
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {renderReplyItem(comment.replies[0])}
              
              {comment.replies.length > 1 && !comment.showAllReplies && (
                <button
                  onClick={() => toggleShowAllReplies(comment.id)}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-2"
                >
                  View {comment.replies.length - 1} more replies
                </button>
              )}
              
              {comment.showAllReplies && comment.replies.slice(1).map(renderReplyItem)}
              
              {comment.showAllReplies && (
                <button
                  onClick={() => toggleShowAllReplies(comment.id)}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-2"
                >
                  Collapse replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <AnimatePresence>
        {visible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <p className="text-red-500 text-center mb-4">{error}</p>
              <button
                onClick={onClose}
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col"
            ref={modalRef}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <IoMdClose size={24} />
              </button>
            </div>
            
            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <BsChat size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                    No comments yet
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Be the first to comment!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {comments.map(renderComment)}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {replyingTo ? (
                <div className="mb-2 flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Replying to @{replyingTo.username}
                  </span>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                      inputRef.current?.focus();
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <IoMdClose size={18} />
                  </button>
                </div>
              ) : null}
              
              <div className="flex items-center gap-3">
                {avatarLoading ? (
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                    <FaUser className="text-white text-base" />
                  </div>
                )}
                
                <div className="flex-1 relative">
                  <textarea
                    ref={replyingTo ? replyInputRef : inputRef}
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={replyingTo ? `Reply to @${replyingTo.username}` : "Add a comment..."}
                    rows={1}
                    value={replyingTo ? replyText : newComment}
                    onChange={(e) => replyingTo ? setReplyText(e.target.value) : setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        replyingTo ? handleAddReply() : handleAddComment();
                      }
                    }}
                  />
                </div>
                
                <button
                  onClick={replyingTo ? handleAddReply : handleAddComment}
                  disabled={
                    (replyingTo ? !replyText.trim() : !newComment.trim()) || 
                    isSubmitting
                  }
                  className={`p-2 rounded-full ${(replyingTo ? replyText.trim() : newComment.trim()) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-400'}`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;
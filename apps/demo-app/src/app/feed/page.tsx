import {
  Box,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Button,
  Skeleton,
  LinearProgress,
  IconButton,
  Modal,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../components/util/firebase";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Xp from "../../../public/xp.svg"

interface VideoData {
  id: string;
  videoUrl: string;
  quiz: string;
  options: string[];
  correctAnswer: string;
  username: string;
  subject: string;
  title: string;
  topicNumber: number;
  uploadedAt: string;
  uploadedBy: string;
}

const bounceAnimation = {
  "@keyframes bounce": {
    "0%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-20px)" },
    "100%": { transform: "translateY(0)" },
  },
};

const page = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [health, setHealth] = useState(5);
  const [quizOpen, setQuizOpen] = useState(false);
  const [likes, setLikes] = useState<{ [videoId: string]: number }>({});
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      const querySnapshot = await getDocs(collection(db, "videos"));
      const vids: VideoData[] = [];
      querySnapshot.forEach((doc) => {
        vids.push({ id: doc.id, ...(doc.data() as VideoData) });
      });
      setVideos(vids);
    };
    fetchVideos();
  }, []);

  const currentVideo = videos[currentIndex];

  const handleAnswerSubmit = () => {
    if (selectedAnswer === currentVideo.correctAnswer) {
      setIsCorrect(true);
      setTimeout(() => {
        setSelectedAnswer("");
        setIsCorrect(false);
        setVideoLoaded(false);
        setQuizOpen(false);
        setCurrentIndex((prev) => Math.min(prev + 1, videos.length - 1));
      }, 1000);
    } else {
      setHealth((prev) => Math.max(prev - 1, 0));
      alert("❌ Incorrect! -1 ❤️");
    }
  };

  const handleLike = (videoId: string) => {
    setLikes((prev) => ({
      ...prev,
      [videoId]: (prev[videoId] || 0) + 1,
    }));
  };

  if (health === 1 && selectedAnswer !== currentVideo.correctAnswer) {
    const expiryTime = Date.now() + 5 * 60 * 60 * 1000; // 5 hours in milliseconds
    localStorage.setItem("healthExpiry", expiryTime.toString());
  }

  useEffect(() => {
    const savedExpiry = localStorage.getItem("healthExpiry");
    if (savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      const timeRemaining = expiryTime - Date.now();
  
      if (timeRemaining <= 0) {
        setHealth(5);
        localStorage.removeItem("healthExpiry");
      } else {
        setHealth(0);
      }
    }
  }, []);


const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
const [countdown, setCountdown] = useState("");

// Reset everything on page reload
useEffect(() => {
  setHealth(5);  // Reset health on page reload
  setExpiryTimestamp(null);  // Reset expiry timestamp on page reload
  setCountdown("");  // Reset countdown
}, []);

// When user loses their last health
useEffect(() => {
  if (health === 0 && !expiryTimestamp) {
    // Set expiry time for 5 hours from now
    setExpiryTimestamp(Date.now() + 5 * 60 * 60 * 1000); 
  }
}, [health]);

// Countdown timer logic (in-memory)
useEffect(() => {
  if (!expiryTimestamp) return;

  const interval = setInterval(() => {
    const timeLeft = expiryTimestamp - Date.now();
    if (timeLeft <= 0) {
      setHealth(5);  // Reset health
      setCountdown("");  // Clear countdown
      setExpiryTimestamp(null);  // Clear expiry timestamp
      clearInterval(interval);
    } else {
      const hrs = Math.floor(timeLeft / (1000 * 60 * 60));
      const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setCountdown(`${hrs}h ${mins}m ${secs}s`);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [expiryTimestamp]);



  const renderHearts = () =>
    Array.from({ length: 5 }, (_, i) => (
      <Tooltip key={i} title={i < health ? "Alive" : "Lost"} arrow>
        <Box
          component="span"
          sx={{
            mx: 0.3,
            transition: "transform 0.2s",
            transform: i === health - 1 ? "scale(1.2)" : "scale(1)",
          }}
        >
          {i < health ? (
            <FavoriteIcon sx={{ color: "#ef4444" }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: "#cbd5e1" }} />
          )}
        </Box>
      </Tooltip>
    ));

  const xpCount = currentIndex + 1; // Incremental XP count based on the current index

  const [giftModalOpen, setGiftModalOpen] = useState(false);
const [selectedGift, setSelectedGift] = useState<string | null>(null);

const handleGiftSend = () => {
  // Here you could handle the logic for sending the gift, e.g., calling an API or updating a local state.
  alert(`You sent a ${selectedGift} gift!`);
  setGiftModalOpen(false);
};


  if (!currentVideo) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          ...bounceAnimation,
        }}
      >
        <img
          src="/logo.png" // Path to your logo in the public folder
          alt="Loading Logo"
          style={{
            width: 100,
            height: 120,
            animation: "bounce 1s infinite",
          }}
        />
        <Typography variant="h6" sx={{ mt: 2, color: "#000" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Paper elevation={4} sx={{ p: 3, backgroundColor: "#fff", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", mb: 4, gap: 2 }}>
          <Typography fontSize="1rem" fontWeight={500} sx={{fontWeight: 600, color: "#334155", fontSize: 18,}}>
            {renderHearts()}
          </Typography>

          <Box
  sx={{
    width: { xs: "100%", sm: "40%" },
    backgroundColor: "#f8fafc",
    borderRadius: 2,
    p: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}
>
  <Typography
    variant="caption"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      mb: 1,
      fontWeight: 600,
      color: "#334155",
    }}
  >
    <img
      src="/level.svg" // Path to your level SVG icon
      alt="Level Icon"
      width={25}
      height={25}
    />
    Level {Math.floor(xpCount / 5) + 1} • {currentIndex + 1}/{videos.length}
  </Typography>

  <LinearProgress
    variant="determinate"
    value={(currentIndex + 1) / videos.length * 100}
    sx={{
      height: 12,
      borderRadius: 5,
      backgroundColor: "#e2e8f0",
      "& .MuiLinearProgress-bar": {
        background: `linear-gradient(90deg, #fffacd, #ffd700, #ff8c00)`,
        transition: "all 0.5s ease-in-out",
      },
    }}
  />
</Box>


          <Typography
  variant="caption"
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    color: "#334155",
    fontSize: 15,
    gap: 1,
  }}
>
  XP: {xpCount}
  <img
    src="/xp.svg"
    alt="XP Icon"
    width={30}
    height={30}
  />
</Typography>


        </Box>

        {/* Video + Arrows Layout */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <Box
              sx={{
                width: 380,
                height: 650,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                boxShadow: 2,
                backgroundColor: "#000",
              }}
            >
              {!videoLoaded && <Skeleton variant="rectangular" width={380} height={650} />}
              <video
                key={currentVideo.id}
                src={currentVideo.videoUrl}
                controls
                onLoadedData={() => setVideoLoaded(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: videoLoaded ? "block" : "none",
                }}
              />
              
              {/* Video Details (similar to TikTok) */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  color: "white",
                  display: "flex",
                  flexDirection: "row",  // Horizontal alignment
                  gap: 1,
                  padding: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",  // Dark transparent background
                  borderRadius: 2,  // Rounded corners for the background
                  minWidth: "90%",  // Limit width to fit within screen
                  whiteSpace: "nowrap",  // Prevent text from wrapping
                  overflow: "hidden",  // Hide overflow if text exceeds container width
                }}
              >
                <Typography variant="caption" fontWeight={300} noWrap sx={{ flexShrink: 0 }}>
                  @{currentVideo.uploadedBy}
                </Typography>

                <Typography variant="body2" fontWeight={500} noWrap sx={{ flexShrink: 0 }}>
                  {currentVideo.title}
                </Typography>

                <Typography variant="body2" fontWeight={400} noWrap sx={{ flexShrink: 0 }}>
                  {currentVideo.subject}
                </Typography>

                <Typography variant="caption" fontWeight={300} noWrap sx={{ flexShrink: 0 }}>
                  Topic {currentVideo.topicNumber}
                </Typography>
              </Box>
            </Box>

            {/* Arrow Buttons on the Right */}
            {/* Arrow Buttons with Like Icon */}
            <Box
              sx={{
                position: "absolute",
                right: 350,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconButton
                onClick={() => setQuizOpen(false)}
                sx={{
                  backgroundColor: "gold",
                  "&:hover": { backgroundColor: "#b8860b" },
                  borderRadius: "50%",
                  padding: 2,
                }}
              >
                <ArrowUpwardIcon sx={{ color: "#000" }} />
              </IconButton>

              {/* Like Button with Count */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <IconButton
                  onClick={() => setLiked(!liked)}
                  sx={{
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: "transparent" },
                  }}
                >
                  <FavoriteIcon sx={{ color: liked ? "#ef4444" : "#fca5a5" }} />
                </IconButton>
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  {liked ? 1 : 0} likes
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  <IconButton
    onClick={() => setGiftModalOpen(true)}  // Open gift modal
    sx={{
      backgroundColor: "transparent",
      "&:hover": { backgroundColor: "#ffd700" },
      borderRadius: "50%",
      padding: 2,
    }}
  >
    <img 
      src="/shop.svg"  // Path to the SVG file in the public folder
      alt="Gift Icon"
      style={{ width: 30, height: 30 }}  // Adjust the size as needed
    />
  </IconButton>
  <Typography variant="caption" sx={{ mt: 0.5 }}>
    Send a Gift
  </Typography>
</Box>



<Modal
  open={giftModalOpen}
  onClose={() => setGiftModalOpen(false)}
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "#ffffff",
      boxShadow: 8,
      borderRadius: 4,
      width: "90%",
      maxWidth: 380,
      p: 4,
      outline: "none",
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
      Select a Gift
    </Typography>

    {/* Gift options */}
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box
          sx={{
            p: 2,
            backgroundColor: selectedGift === "Silver" ? "#fef3c7" : "#f8fafc",
            borderRadius: 2,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: selectedGift === "Silver" ? "2px solid #f59e0b" : "1px solid #e2e8f0",
            transition: "0.2s ease",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
          }}
          onClick={() => setSelectedGift("Silver")}
        >
          <img
            src="/gift1.svg"  // Path to the SVG file in the public folder
            alt="Silver Gift"
            style={{ width: 40, height: 40, marginRight: 8 }}  // Adjust size
          />
          <Typography variant="body2" sx={{ color: "#000" }}>Silver - 10 Tokens</Typography>
        </Box>
      </Grid>

      <Grid item xs={6}>
        <Box
          sx={{
            p: 2,
            backgroundColor: selectedGift === "Diamond" ? "#fef3c7" : "#f8fafc",
            borderRadius: 2,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: selectedGift === "Diamond" ? "2px solid #f59e0b" : "1px solid #e2e8f0",
            transition: "0.2s ease",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
          }}
          onClick={() => setSelectedGift("Diamond")}
        >
          <img
            src="/gift2.svg"  // Path to the SVG file in the public folder
            alt="Diamond Gift"
            style={{ width: 40, height: 40, marginRight: 8 }}  // Adjust size
          />
          <Typography variant="body2" sx={{ color: "#000" }}>Diamond - 20 Tokens</Typography>
        </Box>
      </Grid>

      <Grid item xs={6}>
        <Box
          sx={{
            p: 2,
            backgroundColor: selectedGift === "Gold" ? "#fef3c7" : "#f8fafc",
            borderRadius: 2,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: selectedGift === "Gold" ? "2px solid #f59e0b" : "1px solid #e2e8f0",
            transition: "0.2s ease",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
          }}
          onClick={() => setSelectedGift("Gold")}
        >
          <img
            src="/level.svg"  // Path to the SVG file in the public folder
            alt="Gold Gift"
            style={{ width: 40, height: 40, marginRight: 8 }}  // Adjust size
          />
          <Typography variant="body2" sx={{ color: "#000" }}>Gold - 50 Tokens</Typography>
        </Box>
      </Grid>


     
    </Grid>

    {/* Send Gift Button */}
    <Button
      variant="contained"
      fullWidth
      sx={{
        mt: 4,
        py: 1.5,
        fontWeight: "bold",
        fontSize: "16px",
        backgroundColor: "#000",
        color: "#fff",
        textTransform: "none",
        borderRadius: 2,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        "&:hover": {
          backgroundColor: "#2563eb",
        },
      }}
      onClick={handleGiftSend}
      disabled={!selectedGift}
    >
      Send Gift
    </Button>
  </Box>
</Modal>





              <IconButton
                onClick={() => setQuizOpen(true)}
                sx={{
                  backgroundColor: "gold",
                  "&:hover": { backgroundColor: "#b8860b" },
                  borderRadius: "50%",
                  padding: 2,
                }}
              >
                <ArrowDownwardIcon sx={{ color: "#000" }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Quiz Modal */}
        <Modal open={quizOpen} onClose={() => setQuizOpen(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "#ffffff",
      boxShadow: 8,
      borderRadius: 4,
      width: "90%",
      maxWidth: 380,
      p: 4,
      outline: "none",
    }}
  >
    {/* Header */}
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#94a3b8",
          fontWeight: 500,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Mentor:
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: "#0f172a",
          fontWeight: 600,
        }}
      >
        @{currentVideo.uploadedBy || "Anonymous"}
      </Typography>
    </Box>

    {/* Question */}
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        color: "#1e293b",
        mb: 3,
        lineHeight: 1.5,
      }}
    >
      {currentVideo.quiz}
    </Typography>

    {/* Options */}
    <RadioGroup
      value={selectedAnswer}
      onChange={(e) => setSelectedAnswer(e.target.value)}
    >
      {currentVideo.options.map((option, idx) => (
        <FormControlLabel
          key={idx}
          value={option}
          control={<Radio sx={{ display: "none" }} />}
          label={
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                fontWeight: 500,
                backgroundColor:
                  selectedAnswer === option ? "#fef3c7" : "#f8fafc",
                border:
                  selectedAnswer === option
                    ? "2px solid #f59e0b"
                    : "1px solid #e2e8f0",
                color: "#1e293b",
                transition: "0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  minWidth: 20,
                  color: "#64748b",
                }}
              >
                {idx + 1}.
              </Typography>
              <Typography variant="body2">{option}</Typography>
            </Box>
          }
          disabled={isCorrect}
          sx={{ mb: 1 }}
        />
      ))}
    </RadioGroup>
    {health === 0 && (
  <Typography
    sx={{
      mt: 2,
      color: "#ef4444",
      fontWeight: 500,
      textAlign: "center",
    }}
  >
    ❤️ Out of health. Next heart in: {countdown}
  </Typography>
)}


    {/* Submit Button */}
    {health === 0 ? (
  <Button
    variant="contained"
    fullWidth
    sx={{
      mt: 4,
      py: 1.5,
      fontWeight: "bold",
      fontSize: "16px",
      backgroundColor: "#000",
      color: "#fff",
      textTransform: "none",
      borderRadius: 2,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    }}
    onClick={() => {
      // Replace with your actual logic to request health
      alert("🚑 Request sent to your friend for more health!");
    }}
  >
    Request Health from Friend
  </Button>
) : (
  <Button
    variant="contained"
    onClick={handleAnswerSubmit}
    disabled={isCorrect || selectedAnswer === ""}
    fullWidth
    sx={{
      mt: 4,
      py: 1.5,
      fontWeight: "bold",
      fontSize: "16px",
      backgroundColor: "gold",
      color: "#000",
      textTransform: "none",
      borderRadius: 2,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      "&:hover": {
        backgroundColor: "#e6b800",
      },
    }}
  >
    Submit Answer
  </Button>
)}

  </Box>
</Modal>



      </Paper>
    </Box>
  );
};

export default page;

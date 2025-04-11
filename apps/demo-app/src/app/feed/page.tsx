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
}

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

  if (!currentVideo) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 2, backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 4, backgroundColor: "#fff" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", mb: 4, gap: 2 }}>
          <Typography fontSize="1rem" fontWeight={500}>
            Health: {renderHearts()}
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
                  background: `linear-gradient(90deg, #38bdf8, #6366f1)`,
                  transition: "all 0.5s ease-in-out",
                },
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ mt: 0.5, color: "#94a3b8", textAlign: "right" }}>
  XP: {xpCount}{" "}
  {xpCount < 5 ? (
    "🟢" // Green circle for lower XP levels
  ) : xpCount < 10 ? (
    "🟡" // Yellow circle for mid XP levels
  ) : (
    "🟠" // Orange circle for high XP levels
  )}
</Typography>

        </Box>

        {/* Video + Arrows Layout */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <Box
              sx={{
                width: 280,
                height: 500,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                boxShadow: 2,
                backgroundColor: "#000",
              }}
            >
              {!videoLoaded && <Skeleton variant="rectangular" width={280} height={500} />}
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
                  maxWidth: "90%",  // Limit width to fit within screen
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
                  backgroundColor: "#3b82f6",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                  borderRadius: "50%",
                  padding: 2,
                }}
              >
                <ArrowUpwardIcon sx={{ color: "#fff" }} />
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

              <IconButton
                onClick={() => setQuizOpen(true)}
                sx={{
                  backgroundColor: "#3b82f6",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                  borderRadius: "50%",
                  padding: 2,
                }}
              >
                <ArrowDownwardIcon sx={{ color: "#fff" }} />
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
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxWidth: 400,
              width: "90%",
            }}
          >
            <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
              @{currentVideo.username || "Anonymous"}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              {currentVideo.quiz}
            </Typography>
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
            >
              {currentVideo.options.map((option, idx) => (
                <FormControlLabel
                  key={idx}
                  value={option}
                  control={<Radio />}
                  label={option}
                  disabled={isCorrect}
                />
              ))}
            </RadioGroup>
            <Button
              variant="contained"
              onClick={handleAnswerSubmit}
              disabled={isCorrect || selectedAnswer === "" || health === 0}
              fullWidth
              sx={{ mt: 3 }}
            >
              Submit Answer
            </Button>
          </Box>
        </Modal>
      </Paper>
    </Box>
  );
};

export default page;

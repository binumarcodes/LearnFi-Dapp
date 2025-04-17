"use client";
import { useState, useEffect } from "react";
import { 
  Box, Card, Typography, CircularProgress, Grid, Paper, IconButton, Button 
} from "@mui/material";
import { VideoCameraFront, CloudOff } from "@mui/icons-material";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "../../components/util/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Define the expected shape of content
interface ContentData {
  id: string;
  title: string;
  subject: string;
  language: string;
  videoUrl: string;
  createdAt: Timestamp;
}

const MyContents = () => {
  const [contents, setContents] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const fetchContents = async (userId: string) => {
      try {
        const contentsRef = collection(db, "videos");
        const q = query(contentsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
    
        const fetchedContents: ContentData[] = querySnapshot.docs
          .map((doc) => {
            const data = doc.data() as Omit<ContentData, "id">;
            return { id: doc.id, ...data };
          })
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    
        setContents(fetchedContents);
        fetchQuizzes(fetchedContents);
      } catch (error) {
        console.error("Error fetching contents:", error);
      } finally {
        setLoading(false);
      }
    };
    

    const fetchQuizzes = async (videos: ContentData[]) => {
      const quizzesData: { [key: string]: any[] } = {};
      for (let video of videos) {
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, where("videoId", "==", video.id));
        const querySnapshot = await getDocs(q);
        quizzesData[video.id] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setQuizzes(quizzesData);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchContents(user.uid);
      } else {
        setContents([]);
        setQuizzes({});
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "600", color: "#012b11", mb: 3 }}>
        My Uploaded Contents
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : contents.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="50vh">
          <Card sx={{ p: 4, textAlign: "center", maxWidth: 400, borderRadius: 3 }}>
            <IconButton sx={{ fontSize: 60, color: '#FFD700' }}>
              <CloudOff fontSize="inherit" />
            </IconButton>
            <Typography variant="h6" sx={{ mt: 2 }}>
              No Content Found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You haven't uploaded any content yet.
            </Typography>
          </Card>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {contents.map((content) => (
            <Grid key={content.id}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <VideoCameraFront sx={{ fontSize: 40, color: "gold" }} />
                <Typography variant="h6" sx={{ mt: 1, textAlign: "center" }}>{content.title}</Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  {content.subject} - {content.language}
                </Typography>
                {content.videoUrl && (
                  <Box mt={1} width="100%">
                    <video width="100%" controls style={{ borderRadius: 10 }}>
                      <source src={content.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                )}
                
                {quizzes[content.id] && quizzes[content.id].length > 0 && (
                  <Box mt={2}>
                    <Button variant="contained" color="primary" size="small">
                      Take Quiz
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyContents;

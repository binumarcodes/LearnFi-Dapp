import { Modal, Box, Typography, Button, Stack } from "@mui/material";

const dummyFlashcards = [
  {
    id: "1",
    type: "Key Points / Summary",
    content: "AI extracts the most important points from a video's transcript.",
    example: "From a 30-second history lesson, AI identifies 2–3 key facts.",
  },
  {
    id: "2",
    type: "Multilingual Flashcards (Future)",
    content: "AI translate or localize flashcards for non-native learners.",
    note: "This feature is coming soon!",
  },
];

const FlashcardModal = ({ flashcardModalOpen, setFlashcardModalOpen, onUpgrade }) => {
  return (
    <Modal open={flashcardModalOpen} onClose={() => setFlashcardModalOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#fff",
          borderRadius: 3,
          width: "90%",
          maxWidth: 380,
          p: 3,
          boxShadow: 24,
          outline: "none",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="#333" mb={1.5} textAlign="center">
          AI Flashcards
        </Typography>
        <Typography variant="body2" textAlign="center" color="#777" lineHeight={1.6} mb={3}>
          AI Flashcards are available exclusively for premium learners. Upgrade to unlock smarter,
          faster learning!
        </Typography>

        <Stack spacing={2}>
          {dummyFlashcards.map((card) => (
            <Box
              key={card.id}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                border: "1px solid #ddd",
                p: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" color="#333" mb={0.5}>
                {card.type}
              </Typography>
              <Typography variant="body2" color="#555">
                {card.content}
              </Typography>
              {card.example && (
                <Typography variant="caption" color="#777" mt={1} display="block">
                  {card.example}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>

        <Button
          onClick={onUpgrade}
          variant="contained"
          sx={{
            backgroundColor: "gold",
            color: "black",
            fontWeight: "bold",
            mt: 3,
            borderRadius: 2,
            textTransform: "none",
            ":hover": { backgroundColor: "#ffcf33" },
          }}
          fullWidth
        >
          Upgrade to Premium
        </Button>

        <Button
          onClick={() => setFlashcardModalOpen(false)}
          variant="contained"
          sx={{
            backgroundColor: "#000",
            color: "gold",
            fontWeight: "bold",
            mt: 2,
            borderRadius: 2,
            textTransform: "none",
            ":hover": { backgroundColor: "#222" },
          }}
          fullWidth
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default FlashcardModal;

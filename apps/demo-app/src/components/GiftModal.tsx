import React from "react";
import { Modal, Box, Typography, Button, Grid } from "@mui/material";

const gifts = [
  {
    id: "Silver",
    label: "Silver - 10 Tokens",
    icon: "/gift1.svg",
  },
  {
    id: "Diamond",
    label: "Diamond - 20 Tokens",
    icon: "/gift2.svg",
  },
  {
    id: "Gold",
    label: "Gold - 50 Tokens",
    icon: "/level.svg",
  },
];

const GiftModal = ({
    open,
    onClose,
    selectedGift,
    setSelectedGift,
    handleGiftSend,
    recipientName,
  }: {
    open: boolean;
    onClose: () => void;
    selectedGift: string | null;
    setSelectedGift: (gift: string) => void;
    handleGiftSend: () => void;
    recipientName: string;
  }) => {
  
  return (
    <Modal open={open} onClose={onClose}>
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
       <Typography
  variant="h6"
  sx={{ mb: 2, textAlign: "center", color: "#000" }}
>
  🎁 Gift <strong>{recipientName}</strong> for this lesson
</Typography>



        <Grid container spacing={2}>
          {gifts.map((gift) => (
            <Grid key={gift.id}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: selectedGift === gift.id ? "#fef3c7" : "#f8fafc",
                  borderRadius: 2,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border:
                    selectedGift === gift.id
                      ? "2px solid #f59e0b"
                      : "1px solid #e2e8f0",
                  transition: "0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                  },
                }}
                onClick={() => setSelectedGift(gift.id)}
              >
                <img
                  src={gift.icon}
                  alt={`${gift.id} Gift`}
                  style={{ width: 40, height: 40, marginRight: 8 }}
                />
                <Typography variant="body2" sx={{ color: "#000" }}>
                  {gift.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

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
  );
};

export default GiftModal;

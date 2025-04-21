// components/NFTCertificateModal.tsx
import { Modal, Box, Typography, Button } from "@mui/material";
import { Player } from "@lottiefiles/react-lottie-player"; // Lottie Player
import successAnimation from "../../public/success.json"; // Your Lottie file

interface NFTCertificateModalProps {
  open: boolean;
  onClose: () => void;
  onMint: () => void;
}

const NFTCertificateModal: React.FC<NFTCertificateModalProps> = ({ open, onClose, onMint }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "#1e1e1e",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        textAlign: "center",
        color: "#ffffff"
      }}>
        {/* Lottie animation instead of logo */}
        <Box sx={{ mb: 2 }}>
          <Player
            autoplay
            loop
            src={successAnimation}
            style={{ height: '300px', width: '300px', margin: '0 auto' }}
          />
        </Box>

        <Typography variant="h5" sx={{ mb: 2 }}>
          🎉 Course Completed!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You’ve successfully completed the course. Claim your NFT certificate!
        </Typography>
        <Button
          variant="contained"
          onClick={onMint}
          sx={{
            backgroundColor: "#FFD700",
            color: "#000000",
            '&:hover': {
              backgroundColor: "#FFC300"
            }
          }}
        >
          Mint NFT Certificate
        </Button>
      </Box>
    </Modal>
  );
};

export default NFTCertificateModal;

"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Typography, Stack, Divider, IconButton } from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../components/util/firebase";
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SendIcon from '@mui/icons-material/Send';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';

const WalletPage = () => {
  const [videoCount, setVideoCount] = useState(0);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.00");
  const [usdValue, setUsdValue] = useState<string>("≈ $0.00 USD");
  const [transactions, setTransactions] = useState<any[]>([]);

  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  useEffect(() => {
    const fetchVideoCount = async (userId: string) => {
      try {
        const contentsRef = collection(db, "videos");
        const q = query(contentsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        setVideoCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching video count:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUid(user.uid);
        fetchVideoCount(user.uid);
      } else {
        setFirebaseUid(null);
        setVideoCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!account?.bech32Address || !client) {
        console.log("Wallet or client not ready yet");
        return;
      }

      try {
        const denom = "uxion";
        const balance = await client.getBalance(account.bech32Address, denom);
        const xionAmount = Number(balance.amount) / 1_000_000;
        setWalletBalance(xionAmount.toFixed(2));
        setUsdValue(`≈ $${(xionAmount * 0.05).toFixed(2)} USD`);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setWalletBalance("Error");
        setUsdValue("≈ $0.00 USD");
      }
    };

    fetchWalletBalance();
  }, [account?.bech32Address, client]);

  function shortenAddress(address: string, chars = 5) {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  const handleCopy = () => {
    if (account?.bech32Address) {
      navigator.clipboard.writeText(account.bech32Address);
      alert("Address copied!");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#15202B",
        p: 3,
        color: "white",
      }}
    >
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "white" }}>
        Wallet
      </Typography>

      {/* Wallet Card */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          p: 3,
          mb: 3,
          background: "#283F52",
          color: "white",
          border: "1px solid #333",
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}>
          Available Tokens
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: "white" }}>
              {walletBalance}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
              LEARN
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {usdValue}
          </Typography>
        </Box>

        {/* Address */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          backgroundColor: "#15202B",
          borderRadius: 2,
          p: 1.5,
          mb: 3
        }}>
          <Typography variant="body2" sx={{ 
            flexGrow: 1, 
            fontFamily: "monospace",
            color: "white"
          }}>
            {account?.bech32Address ? shortenAddress(account.bech32Address) : "Not connected"}
          </Typography>
          <IconButton onClick={handleCopy} size="small" sx={{ color: "white" }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<SwapHorizIcon />}
            sx={{
              flex: 1,
              backgroundColor: "#FFD700",
              color: "black",
              "&:hover": { backgroundColor: "#E6C200" },
              borderRadius: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Buy
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            sx={{
              flex: 1,
              backgroundColor: "#FBFFC1",
              color: "black",
              "&:hover": { backgroundColor: "#d7dba3ff" },
              borderRadius: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Send
          </Button>
        </Stack>
      </Paper>

      {/* Transaction History */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 4, 
          p: 3,
          background: "#283F52",
          border: "1px solid #333",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HistoryIcon sx={{ color: "#FFD700" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "white" }}>
            Recent Transactions
          </Typography>
        </Stack>

        {transactions.length === 0 ? (
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            py: 4,
            textAlign: "center"
          }}>
            <ReceiptIcon sx={{ fontSize: 50, color: "rgba(255,255,255,0.5)", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "white" }}>
              No Transactions
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              You haven't made any transactions yet. Your recent activity will show up here.
            </Typography>
          </Box>
        ) : (
          transactions.map((tx, index) => (
            <React.Fragment key={index}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 2 }}>
                <Box sx={{ 
                  backgroundColor: "#333", 
                  borderRadius: "50%", 
                  width: 40, 
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {tx.type === "send" ? (
                    <SendIcon sx={{ color: "#FF5252" }} />
                  ) : (
                    <ReceiptIcon sx={{ color: "#4CAF50" }} />
                  )}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "white" }}>
                    {tx.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {tx.date}
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: tx.type === "send" ? "#FF5252" : "#4CAF50"
                  }}
                >
                  {tx.type === "send" ? "-" : "+"}{tx.amount} LEARN
                </Typography>
              </Stack>
              {index < transactions.length - 1 && <Divider sx={{ borderColor: "#333" }} />}
            </React.Fragment>
          ))
        )}
      </Paper>

      {/* Claim Earnings Button */}
      {/* <Button
        variant="contained"
        size="large"
        disabled={!account?.bech32Address}
        onClick={() => alert("Claim functionality coming soon!")}
        sx={{
          mt: 3,
          py: 1.5,
          borderRadius: 3,
          backgroundColor: "#FFD700",
          color: "black",
          "&:hover": { backgroundColor: "#E6C200" },
          fontWeight: 600,
        }}
      >
        🚀 Claim Earnings
      </Button> */}
    </Box>
  );
};

export default WalletPage;
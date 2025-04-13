"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../components/util/firebase";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";

type MetricCardProps = {
  title: string;
  value: string | number;
  dark?: boolean;
};

const MetricCard = ({ title, value, dark = false }: MetricCardProps) => (
  <Paper
    elevation={4}
    sx={{
      height: "300px",
      width: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 4,
      backgroundColor: dark ? "#000" : "#fff",
      color: dark ? "#fff" : "#012b11",
      boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
      textAlign: "center",
    }}
  >
    <Typography
      variant="h6"
      sx={{ mb: 2, fontWeight: 500, color: dark ? "#ccc" : "#666" }}
    >
      {title}
    </Typography>
    <Typography variant="h3" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

function Page() {
  const [videoCount, setVideoCount] = useState(0);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("Loading...");

  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  // 🔹 Firebase: Get video count
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

  // 🔹 Wallet: Fetch balance once account + client ready
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!account?.bech32Address || !client) {
        console.log("Wallet or client not ready yet");
        return;
      }

      try {
        const denom = "uxion"; // If incorrect, try "uxiontest" or check testnet denom
        const balance = await client.getBalance(account.bech32Address, denom);
        const xionAmount = Number(balance.amount) / 1_000_000;
        setWalletBalance(`${xionAmount.toFixed(2)} XION`);
        console.log("Wallet balance:", balance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setWalletBalance("Error");
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
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'column',
        height: "100vh",
        px: { xs: 2, md: 5 },
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ width: "100%", maxWidth: "1200px" }}
      >
        <Grid item xs={12} sm={4} display="flex" justifyContent="center">
          <MetricCard title="Number of Tutorials" value={videoCount} />
        </Grid>
        <Grid item xs={12} sm={4} display="flex" justifyContent="center">
          <MetricCard
            title="Wallet Balance"
            value={walletBalance}
            dark
          />
        </Grid>
        <Grid item xs={12} sm={4} display="flex" justifyContent="center">
          <MetricCard title="Number of Likes" value={videoCount} />
        </Grid>
        <MetricCard
  title="Wallet Address"
  value={
    <span onClick={handleCopy} style={{ cursor: "pointer" }}>
      {shortenAddress(account.bech32Address)}
    </span>
  }
  dark
/>
<Grid item xs={12} sm={4} display="flex" justifyContent="center">
  <MetricCard title="Network" value="Xion Testnet" />
</Grid>

</Grid>
<Box
  mt={6}
  display="flex"
  justifyContent="center"
  alignItems="center"
>
  <Button
    variant="primary"
    size="lg"
    disabled={!account?.bech32Address || walletBalance === "Loading..."}
    onClick={() => {
      alert("Claim functionality coming soon!");
    }}
    sx={{
      px: 4,
      py: 2,
      fontSize: "1rem",
      borderRadius: 3,
      backgroundColor: "gold",
      color: "#000",
      "&:hover": {
        backgroundColor: "#b8860b",
      },
    }}
  >
    🚀 Claim Earnings
  </Button>
</Box>



    </Box>
  );
}

export default Page;

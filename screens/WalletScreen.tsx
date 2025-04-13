import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

function WalletScreen() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      const provider: any = await detectEthereumProvider();

      if (!provider) {
        alert("MetaMask or a Web3 provider is required.");
        return;
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);

      setWalletAddress(address);
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert("Failed to connect wallet.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>

      {/* Display wallet address */}
      {walletAddress ? (
        <>
          <Text style={styles.info}>Address: {walletAddress}</Text>
          <Text style={styles.info}>Balance: {balance} ETH</Text>
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={connectWallet}>
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default WalletScreen;

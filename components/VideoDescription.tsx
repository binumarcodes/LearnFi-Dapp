import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VideoDescription({ username, description }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.music}>🎵 Original Sound</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "5%",
    left: 10,
    width: "70%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10
  },
  username: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    color: "#fff",
    fontSize: 14,
  },
  music: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
});

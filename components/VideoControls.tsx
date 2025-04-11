import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VideoControls({ profile, likes, comments, shares }: any) {
  const [liked, setLiked] = useState(false);
  
  return (
    <View style={styles.container}>
      <Image source={{ uri: profile }} style={styles.profile} />
      
      <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.iconButton}>
        <Ionicons name={liked ? "heart" : "heart-outline"} size={30} color={liked ? "red" : "white"} />
        <Text style={styles.count}>{likes}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="chatbubble-outline" size={30} color="white" />
        <Text style={styles.count}>{comments}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="arrow-redo-outline" size={30} color="white" />
        <Text style={styles.count}>{shares}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="bookmark-outline" size={30} color="white" />
        <Text style={styles.count}>{shares}</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 10,
    alignItems: "center",
  },
  profile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: "white",
    borderWidth: 2,
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  count: {
    color: "white",
    fontSize: 12,
  },
});

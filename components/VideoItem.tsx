import React, { forwardRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Video } from "expo-av";
import VideoControls from "./VideoControls";
import VideoDescription from "./VideoDescription";

const { height, width } = Dimensions.get("window");

const VideoItem = forwardRef(({ uri, profile, username, description, likes, comments, shares }: any, ref) => {
  return (
    <View style={styles.container}>
      <Video
        ref={ref}
        source={{ uri }}
        style={styles.video}
        resizeMode="cover"
        isLooping
      />
      
      {/* Overlay UI */}
      <VideoDescription username={username} description={description} />
      <VideoControls profile={profile} likes={likes} comments={comments} shares={shares} />
    </View>
  );
});

export default VideoItem;

const styles = StyleSheet.create({
  container: {
    height,
    width,
    justifyContent: "center",
  },
  video: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});

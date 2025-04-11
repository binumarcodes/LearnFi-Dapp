import React, { useRef, useState } from "react";
import { View, Dimensions, StyleSheet, FlatList } from "react-native";
import { Video } from "expo-av";

const { height, width } = Dimensions.get("window");

// Sample video sources
const videos = [
  { id: "1", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "2", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "3", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
];

export default function VideoScreen() {
  const videoRefs = useRef<Video[]>([]); // Store video refs
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActiveIndex(newIndex);
      
      // Pause all videos except the one in view
      videoRefs.current.forEach((video, index) => {
        if (video) {
          if (index === newIndex) {
            video.playAsync();
          } else {
            video.pauseAsync();
          }
        }
      });
    }
  }).current;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      pagingEnabled
      horizontal={false}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      renderItem={({ item, index }) => (
        <View style={styles.videoContainer}>
          <Video
            ref={(ref) => (videoRefs.current[index] = ref!)}
            source={{ uri: item.uri }}
            style={styles.video}
            resizeMode="cover"
            isLooping
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height,
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    height,
    width,
  },
});

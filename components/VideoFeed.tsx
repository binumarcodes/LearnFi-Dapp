import React, { useRef, useState } from "react";
import { FlatList, Dimensions, View, StyleSheet } from "react-native";
import VideoItem from "./VideoItem";
const { height } = Dimensions.get("window");

const videos = [
    {
      id: "1",
      uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      profile: "https://randomuser.me/api/portraits/men/1.jpg",
      username: "@binumar",
      description: "Check out this amazing video! 🚀",
      likes: 1024,
      comments: 456,
      shares: 78,
    },
    {
      id: "2",
      uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      profile: "https://randomuser.me/api/portraits/women/2.jpg",
      username: "@francis",
      description: "Beautiful scenery 🌿",
      likes: 512,
      comments: 120,
      shares: 34,
    },
    {
      id: "3",
      uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      profile: "https://randomuser.me/api/portraits/men/3.jpg",
      username: "@johndoe",
      description: "This is an epic short film! 🎬",
      likes: 768,
      comments: 300,
      shares: 50,
    },
  ];
  

export default function VideoFeed() {
  const videoRefs = useRef<any[]>([]); // Store video refs
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActiveIndex(newIndex);

      videoRefs.current.forEach((video, index) => {
        if (video) {
          index === newIndex ? video.playAsync() : video.pauseAsync();
        }
      });
    }
  }).current;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      renderItem={({ item, index }) => (
        <VideoItem ref={(ref) => (videoRefs.current[index] = ref!)} {...item} />
      )}
    />
  );
}

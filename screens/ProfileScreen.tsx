import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import CustomButton from "../ui/CustomButton";

const { width } = Dimensions.get("window");

// Sample posts (video thumbnails)
const posts = [
  {
    id: "1",
    thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
  },
  {
    id: "2",
    thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
  },
  {
    id: "3",
    thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
  },
  {
    id: "4",
    thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
  },
];

function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* User Details */}
      <View style={styles.topCard}>
        <View style={styles.userDetails}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/2.jpg" }}
            style={styles.profile}
          />
          <View>
            <Text style={styles.username}>Mrs. Sofi</Text>
            <Text style={styles.bio}>Physics Teacher @Turkish</Text>
          </View>
        </View>

        {/* Numbers */}
        <View style={styles.numbers}>
          <View style={styles.numberRow}>
            <Text style={styles.number}>14</Text>
            <Text style={styles.numberTitle}>Lessons</Text>
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.number}>175</Text>
            <Text style={styles.numberTitle}>Likes</Text>
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.number}>99</Text>
            <Text style={styles.numberTitle}>Followers</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <CustomButton title="Subscribe" />
          <CustomButton title="Chat" variant="outline" />
        </View>
      </View>

      {/* User Posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3} // Grid layout with 3 columns
        renderItem={({ item }) => <PostItem thumbnail={item.thumbnail} />}
        contentContainerStyle={styles.postList}
      />
    </View>
  );
}

// Component for displaying a single post (thumbnail)
const PostItem = ({ thumbnail }: { thumbnail: string }) => (
  <View style={styles.postItem}>
    <Image source={{ uri: thumbnail }} style={styles.postImage} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topCard: {
    width: "100%",
    padding: 16,
    paddingTop: 48,
    backgroundColor: "#000",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profile: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderColor: "white",
    borderWidth: 2,
    marginRight: 16,
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  bio: {
    fontSize: 14,
    fontWeight: "400",
    color: "#fff",
  },
  numbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  numberRow: {
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  numberTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
  },
  postList: {
    padding: 5,
  },
  postItem: {
    width: width / 3 - 10, // Makes 3 equal columns
    height: width / 3 - 10,
    margin: 5,
    borderRadius: 5,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
});

export default ProfileScreen;

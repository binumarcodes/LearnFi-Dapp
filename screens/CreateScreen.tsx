import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

function CreateScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Function to pick a video
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  // Function to add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Function to remove a tag
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Function to handle post submission
  const handlePost = () => {
    if (!title || !description || !video) {
      alert("Please complete all fields before submitting.");
      return;
    }

    console.log("Post Created:", { title, description, video, tags });

    // Reset form
    setTitle("");
    setDescription("");
    setVideo(null);
    setTags([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a New Post</Text>

      {/* Video Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
        <Text style={styles.uploadText}>
          {video ? "Change Video" : "Upload Video"}
        </Text>
      </TouchableOpacity>

      {/* Video Preview */}
      {video && (
        <Image source={{ uri: video }} style={styles.videoPreview} resizeMode="cover" />
      )}

      {/* Title Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
      />

      {/* Description Input */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* Tags Input */}
      <View style={styles.tagContainer}>
        <TextInput
          style={styles.tagInput}
          placeholder="Enter a tag"
          value={tagInput}
          onChangeText={setTagInput}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
          <Text style={styles.addTagText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Display Tags */}
      <FlatList
        data={tags}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity onPress={() => removeTag(item)}>
              <Text style={styles.removeTag}> × </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Submit Button */}
      <Button title="Post" onPress={handlePost} color="#007bff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  uploadText: {
    color: "#fff",
    fontSize: 16,
  },
  videoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 8,
    borderRadius: 8,
  },
  addTagText: {
    color: "#fff",
    fontSize: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    marginRight: 5,
  },
  removeTag: {
    fontSize: 16,
    color: "#ff0000",
  },
});

export default CreateScreen;

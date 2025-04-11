import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const mockData = [
  { id: "1", title: "Mathematics - Quadratic Equations" },
  { id: "2", title: "English - Comprehension Passages" },
  { id: "3", title: "Physics - Laws of Motion" },
  { id: "4", title: "Biology - Photosynthesis" },
  { id: "5", title: "Chemistry - Organic Compounds" },
  { id: "6", title: "Government - Democracy & Constitution" },
  { id: "7", title: "Economics - Demand and Supply" },
];

function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState(mockData);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = mockData.filter((item) =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredResults(filtered);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects or topics..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Search Results */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem}>
            <Text style={styles.resultText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    fontSize: 16,
  },
});

export default ExploreScreen;

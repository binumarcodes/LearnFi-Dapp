import React from "react";
import { createStackNavigator } from "@react-navigation/stack"
import MainTabs from "./MainTabs";
import VideoDetailScreen from "../screens/VideoDetailScreen";

const stack = createStackNavigator()

export default function RootStack() {
    return (
        <stack.Navigator screenOptions={{ headerShown: false }}>
            <stack.Screen name="main" component={MainTabs} />
            <stack.Screen name="videoDetail" component={VideoDetailScreen} />
        </stack.Navigator>
    )
}
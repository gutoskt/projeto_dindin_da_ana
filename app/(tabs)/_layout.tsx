import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function TabsLayout() {
  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            height: 80,
            backgroundColor: "#0081CC",
          },
          headerTintColor: "#fff",
          headerLeft: () => (
            <Image
              source={require("../imagens/imagem2.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Dindin da Ana</Text>
            </View>
          ),
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#B9E3F7",
          tabBarStyle: {
            alignSelf: "center",
            backgroundColor: "#0081CC",
            borderTopColor: "#63BCE5",
            height: 76,
            paddingBottom: 10,
            paddingTop: 10,
            marginBottom: 16,
            width: 320,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "800",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Histórico",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="sabor"
          options={{
            title: "Sabor",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="color-palette" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="receitas"
          options={{
            title: "Receitas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  logo: { borderRadius: 20, height: 48, marginLeft: 12, width: 48 },
  headerRight: { marginRight: 16 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
});

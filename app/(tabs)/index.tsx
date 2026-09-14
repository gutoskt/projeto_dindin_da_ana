import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { styles } from "./styles/stylesHome";

export default function HomeScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, bem-vindo ao</Text>

      <Text style={styles.title}>Dindin</Text>
    </View>
  );
}

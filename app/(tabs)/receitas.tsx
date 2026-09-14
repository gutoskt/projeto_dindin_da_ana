import { StyleSheet, Text, View } from 'react-native';

export default function ReceitasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PLANEJAMENTO</Text>
      <Text style={styles.title}>Receitas</Text>
      <Text style={styles.description}>Visualize e organize todas as suas entradas.</Text>
      <View style={styles.summary}>
        <Text style={styles.label}>TOTAL DE RECEITAS</Text>
        <Text style={styles.value}>R$ 0,00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F6', padding: 24, paddingTop: 72 },
  eyebrow: { color: '#1D6B5B', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#17342D', fontSize: 34, fontWeight: '800', marginTop: 8 },
  description: { color: '#66736D', fontSize: 16, lineHeight: 23, marginTop: 8 },
  summary: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 32, padding: 20 },
  label: { color: '#78837E', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  value: { color: '#1D6B5B', fontSize: 28, fontWeight: '800', marginTop: 10 },
});
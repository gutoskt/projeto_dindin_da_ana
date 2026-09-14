import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>DINDIN</Text>
      <Text style={styles.title}>Histórico</Text>
      <Text style={styles.description}>Acompanhe aqui suas movimentações financeiras.</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhuma movimentação ainda</Text>
        <Text style={styles.emptyDescription}>Suas entradas e saídas aparecerão nesta página.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F6', padding: 24, paddingTop: 72 },
  eyebrow: { color: '#1D6B5B', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#17342D', fontSize: 34, fontWeight: '800', marginTop: 8 },
  description: { color: '#66736D', fontSize: 16, lineHeight: 23, marginTop: 8 },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 32, padding: 20 },
  emptyTitle: { color: '#17342D', fontSize: 17, fontWeight: '700' },
  emptyDescription: { color: '#78837E', fontSize: 14, lineHeight: 20, marginTop: 6 },
});
import { StyleSheet, Text, View } from 'react-native';

export default function RelatorioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>VISÃO GERAL</Text>
      <Text style={styles.title}>Relatório</Text>
      <Text style={styles.description}>Entenda como seu dinheiro está sendo usado.</Text>
      <View style={styles.report}>
        <Text style={styles.reportTitle}>Resumo do mês</Text>
        <View style={styles.row}><Text style={styles.itemLabel}>Receitas</Text><Text style={styles.itemValue}>R$ 0,00</Text></View>
        <View style={styles.row}><Text style={styles.itemLabel}>Despesas</Text><Text style={styles.itemValue}>R$ 0,00</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F6', padding: 24, paddingTop: 72 },
  eyebrow: { color: '#1D6B5B', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#17342D', fontSize: 34, fontWeight: '800', marginTop: 8 },
  description: { color: '#66736D', fontSize: 16, lineHeight: 23, marginTop: 8 },
  report: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 32, padding: 20 },
  reportTitle: { color: '#17342D', fontSize: 17, fontWeight: '700', marginBottom: 18 },
  row: { borderTopColor: '#E3E9E5', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  itemLabel: { color: '#66736D', fontSize: 15 },
  itemValue: { color: '#17342D', fontSize: 15, fontWeight: '700' },
});
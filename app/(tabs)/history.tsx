import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { assinarAtualizacao } from "../lib/dados-atualizados";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

type Movimento = {
  dindin_id: number;
  nomedindin: string;
  entradas: number;
  saidas: number;
};

type Historico = {
  mes_ano: string;
  total_entradas_mes: number;
  total_saidas_mes: number;
  custo_mes: number;
  lucro_mes: number;
  faturamento_mes: number;
  sabores: Movimento[];
};

const moeda = (valor: number) =>
  Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const numero = (valor: number) => Number(valor ?? 0).toLocaleString("pt-BR");

type JsPdfConstructor = new () => {
  setTextColor: (r: number, g: number, b: number) => void;
  setFontSize: (size: number) => void;
  text: (value: string, x: number, y: number) => void;
  addPage: () => void;
  save: (filename: string) => void;
};

declare global {
  interface Window {
    jspdf?: { jsPDF: JsPdfConstructor };
  }
}

const carregarJsPdf = async () => {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Não foi possível carregar o gerador de PDF."));
    document.head.appendChild(script);
  });
  if (!window.jspdf?.jsPDF) throw new Error("Gerador de PDF indisponível.");
  return window.jspdf.jsPDF;
};

const nomeDoMes = (data: string) => {
  const dataLocal = new Date(`${data}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  })
    .format(dataLocal)
    .replace(/^./, (letra) => letra.toUpperCase());
};

export default function HistoryScreen() {
  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [selecionado, setSelecionado] = useState<Historico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const deslocamento = useRef(new Animated.Value(420)).current;

  const carregarHistorico = useCallback(async () => {
    try {
      setErro(null);
      const resposta = await fetch(`${API_URL}/historico-por-mes`);
      if (!resposta.ok) throw new Error("Falha ao carregar o histórico.");
      const dados = (await resposta.json()) as Historico[];
      setHistoricos(dados);
      setSelecionado((atual) =>
        atual
          ? (dados.find((item) => item.mes_ano === atual.mes_ano) ?? atual)
          : null,
      );
    } catch {
      setErro("Não foi possível carregar o histórico. Confira o backend.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  useEffect(() => assinarAtualizacao(carregarHistorico), [carregarHistorico]);

  const abrirDetalhe = (item: Historico) => {
    setSelecionado(item);
    deslocamento.setValue(420);
    Animated.timing(deslocamento, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const fecharDetalhe = () => {
    Animated.timing(deslocamento, {
      toValue: 420,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSelecionado(null);
    });
  };

  const baixarRelatorio = async () => {
    if (!selecionado) return;
    try {
      setGerandoPdf(true);
      const mes = nomeDoMes(selecionado.mes_ano);
      const linhas = selecionado.sabores
        .map(
          (sabor) =>
            `<tr><td>${sabor.nomedindin}</td><td>${numero(sabor.entradas)}</td><td>${numero(sabor.saidas)}</td></tr>`,
        )
        .join("");
      const html = `
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>body{font-family:Arial;color:#12344A;padding:28px}h1{color:#0081CC} .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}.box{background:#F0F8FD;padding:14px;border-radius:8px}.label{font-size:13px;color:#527A91;text-transform:uppercase}.value{font-size:20px;font-weight:bold;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{text-align:left;padding:10px;border-bottom:1px solid #B7DFF2}th{color:#0081CC}</style></head>
        <body><h1>Relatório Dindin</h1><p>${mes}</p>
        <div class="grid"><div class="box"><div class="label">Lucro</div><div class="value">${moeda(selecionado.lucro_mes)}</div></div><div class="box"><div class="label">Gasto</div><div class="value">${moeda(selecionado.custo_mes)}</div></div><div class="box"><div class="label">Faturamento</div><div class="value">${moeda(selecionado.faturamento_mes)}</div></div><div class="box"><div class="label">Movimentação</div><div class="value">${numero(selecionado.total_entradas_mes)} entradas / ${numero(selecionado.total_saidas_mes)} saídas</div></div></div>
        <h2>Movimentação por sabor</h2><table><tr><th>Sabor</th><th>Entradas</th><th>Saídas</th></tr>${linhas}</table></body></html>`;
      if (Platform.OS === "web") {
        const JsPDF = await carregarJsPdf();
        const pdf = new JsPDF();
        let y = 20;

        pdf.setTextColor(0, 129, 204);
        pdf.setFontSize(20);
        pdf.text("Relatório Dindin", 18, y);
        y += 10;
        pdf.setTextColor(18, 52, 74);
        pdf.setFontSize(13);
        pdf.text(mes, 18, y);
        y += 14;
        pdf.setFontSize(11);
        pdf.text(`Lucro: ${moeda(selecionado.lucro_mes)}`, 18, y);
        pdf.text(`Gasto: ${moeda(selecionado.custo_mes)}`, 105, y);
        y += 8;
        pdf.text(`Faturamento: ${moeda(selecionado.faturamento_mes)}`, 18, y);
        pdf.text(
          `Entradas: ${numero(selecionado.total_entradas_mes)} un.`,
          105,
          y,
        );
        y += 8;
        pdf.text(`Saídas: ${numero(selecionado.total_saidas_mes)} un.`, 18, y);
        y += 16;
        pdf.setTextColor(0, 129, 204);
        pdf.setFontSize(13);
        pdf.text("Movimentação por sabor", 18, y);
        y += 10;
        pdf.setTextColor(18, 52, 74);
        pdf.setFontSize(10);
        pdf.text("Sabor", 18, y);
        pdf.text("Entradas", 115, y);
        pdf.text("Saídas", 155, y);
        y += 7;
        selecionado.sabores.forEach((sabor) => {
          if (y > 275) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(sabor.nomedindin, 18, y);
          pdf.text(numero(sabor.entradas), 115, y);
          pdf.text(numero(sabor.saidas), 155, y);
          y += 7;
        });
        pdf.save(`relatorio-dindin-${selecionado.mes_ano.slice(0, 7)}.pdf`);
        return;
      }

      const arquivo = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(arquivo.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Relatório de ${mes}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        setErro(
          "O compartilhamento de PDF não está disponível neste dispositivo.",
        );
      }
    } catch {
      setErro("Não foi possível gerar o relatório em PDF.");
    } finally {
      setGerandoPdf(false);
    }
  };

  const renderMes = ({ item }: { item: Historico }) => (
    <TouchableOpacity
      style={styles.monthCard}
      onPress={() => abrirDetalhe(item)}
    >
      <View style={styles.monthCardTop}>
        <View>
          <Text style={styles.monthName}>{nomeDoMes(item.mes_ano)}</Text>
          <Text style={styles.monthHint}>
            Toque para ver o relatório completo
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#0081CC" />
      </View>
      <View style={styles.monthDivider} />
      <View style={styles.monthStats}>
        <View>
          <Text style={styles.statLabel}>Lucro</Text>
          <Text style={styles.profit}>{moeda(item.lucro_mes)}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Gasto</Text>
          <Text style={styles.statValue}>{moeda(item.custo_mes)}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Faturamento</Text>
          <Text style={styles.statValue}>{moeda(item.faturamento_mes)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={historicos}
        renderItem={renderMes}
        keyExtractor={(item) => item.mes_ano}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>DINDIN</Text>
            <Text style={styles.title}>Histórico</Text>
            <Text style={styles.description}>
              Consulte seus resultados mês a mês.
            </Text>
            {erro ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{erro}</Text>
                <TouchableOpacity onPress={carregarHistorico}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {carregando ? (
              <ActivityIndicator color="#0081CC" style={styles.loader} />
            ) : null}
          </>
        }
        ListEmptyComponent={
          !carregando && !erro ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum mês registrado</Text>
              <Text style={styles.emptyDescription}>
                As movimentações aparecerão aqui quando houver entradas ou
                vendas.
              </Text>
            </View>
          ) : null
        }
      />

      {selecionado ? (
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={fecharDetalhe} />
          <Animated.View
            style={[
              styles.detailPanel,
              { transform: [{ translateX: deslocamento }] },
            ]}
          >
            <View style={styles.detailHeader}>
              <TouchableOpacity
                onPress={fecharDetalhe}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#12344A" />
              </TouchableOpacity>
              <Text style={styles.detailEyebrow}>RELATÓRIO MENSAL</Text>
              <Text style={styles.detailTitle}>
                {nomeDoMes(selecionado.mes_ano)}
              </Text>
            </View>
            <FlatList
              data={selecionado.sabores}
              style={styles.detailList}
              keyExtractor={(item) => String(item.dindin_id)}
              contentContainerStyle={styles.detailContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <>
                  <View style={styles.heroMetric}>
                    <Text style={styles.heroLabel}>LUCRO DO MÊS</Text>
                    <Text style={styles.heroValue}>
                      {moeda(selecionado.lucro_mes)}
                    </Text>
                  </View>
                  <View style={styles.detailGrid}>
                    <Metric
                      label="Gasto"
                      value={moeda(selecionado.custo_mes)}
                    />
                    <Metric
                      label="Faturamento"
                      value={moeda(selecionado.faturamento_mes)}
                    />
                    <Metric
                      label="Entradas"
                      value={`${numero(selecionado.total_entradas_mes)} un.`}
                    />
                    <Metric
                      label="Saídas"
                      value={`${numero(selecionado.total_saidas_mes)} un.`}
                    />
                  </View>
                  <Text style={styles.detailSectionTitle}>
                    Movimentação por sabor
                  </Text>
                </>
              }
              renderItem={({ item }) => (
                <View style={styles.flavorLine}>
                  <Text style={styles.flavorName}>{item.nomedindin}</Text>
                  <Text style={styles.flavorMovement}>
                    Entraram {numero(item.entradas)} · Saíram{" "}
                    {numero(item.saidas)}
                  </Text>
                </View>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={baixarRelatorio}
                  disabled={gerandoPdf}
                >
                  {gerandoPdf ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="download-outline"
                        size={19}
                        color="#FFFFFF"
                      />
                      <Text style={styles.pdfText}>
                        Baixar relatório em PDF
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              }
            />
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3FAFE" },
  container: { padding: 20, paddingBottom: 110 },
  eyebrow: {
    color: "#0081CC",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: { color: "#12344A", fontSize: 36, fontWeight: "800", marginTop: 8 },
  description: {
    color: "#66736D",
    fontSize: 18,
    lineHeight: 23,
    marginBottom: 24,
    marginTop: 8,
  },
  monthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 14,
    padding: 18,
  },
  monthCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthName: { color: "#12344A", fontSize: 21, fontWeight: "800" },
  monthHint: { color: "#6D9AB3", fontSize: 14, marginTop: 4 },
  monthDivider: { backgroundColor: "#E5EEE9", height: 1, marginVertical: 15 },
  monthStats: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { color: "#527A91", fontSize: 13 },
  statValue: {
    color: "#12344A",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
  },
  profit: { color: "#0081CC", fontSize: 16, fontWeight: "800", marginTop: 5 },
  errorBox: {
    backgroundColor: "#FFF1ED",
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
  },
  errorText: { color: "#A34432", fontSize: 14 },
  retryText: {
    color: "#A34432",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },
  loader: { marginVertical: 20 },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    padding: 20,
  },
  emptyTitle: { color: "#12344A", fontSize: 19, fontWeight: "700" },
  emptyDescription: {
    color: "#78837E",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(23,52,45,0.35)",
  },
  detailPanel: {
    backgroundColor: "#F3FAFE",
    elevation: 12,
    flex: 1,
    marginLeft: "auto",
    shadowColor: "#12344A",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    width: "91%",
  },
  detailList: { flex: 1 },
  detailHeader: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 20,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  closeButton: { alignSelf: "flex-end", padding: 2 },
  detailEyebrow: {
    color: "#0081CC",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 8,
  },
  detailTitle: {
    color: "#12344A",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 5,
  },
  detailContent: { padding: 18, paddingBottom: 38 },
  heroMetric: { backgroundColor: "#0081CC", borderRadius: 14, padding: 18 },
  heroLabel: {
    color: "#DDF3FF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 18,
  },
  metric: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 13,
    width: "48%",
  },
  metricLabel: { color: "#527A91", fontSize: 13 },
  metricValue: {
    color: "#12344A",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },
  detailSectionTitle: {
    color: "#12344A",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 9,
  },
  flavorLine: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 8,
    padding: 13,
  },
  flavorName: { color: "#12344A", fontSize: 17, fontWeight: "800" },
  flavorMovement: { color: "#527A91", fontSize: 14, marginTop: 4 },
  pdfButton: {
    alignItems: "center",
    backgroundColor: "#0081CC",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  pdfText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", marginLeft: 8 },
});

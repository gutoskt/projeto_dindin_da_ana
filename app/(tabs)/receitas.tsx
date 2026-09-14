import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  assinarAtualizacao,
  avisarDadosAtualizados,
} from "../lib/dados-atualizados";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";
type Receita = {
  id: number;
  nomedindin: string;
  cor?: string;
  receita: string;
};

export default function ReceitasScreen() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [selecionada, setSelecionada] = useState<Receita | null>(null);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const deslocamento = useRef(new Animated.Value(500)).current;

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const resposta = await fetch(`${API_URL}/receitas`);
      if (!resposta.ok) throw new Error("Falha ao carregar receitas.");
      setReceitas((await resposta.json()) as Receita[]);
    } catch {
      setErro("Não foi possível carregar as receitas. Confira o backend.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);
  useEffect(() => assinarAtualizacao(carregar), [carregar]);

  const abrirReceita = (item: Receita) => {
    setSelecionada(item);
    setTexto(item.receita ?? "");
    deslocamento.setValue(500);
    Animated.timing(deslocamento, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const fecharReceita = () => {
    Animated.timing(deslocamento, {
      toValue: 500,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSelecionada(null);
    });
  };

  const salvar = async () => {
    if (!selecionada) return;
    try {
      setSalvando(true);
      setErro(null);
      const resposta = await fetch(`${API_URL}/receitas/${selecionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receita: texto }),
      });
      if (!resposta.ok) {
        const detalhe = (await resposta.json()) as {
          mensagem?: string;
          detalhe?: string;
        };
        throw new Error(
          [detalhe.mensagem, detalhe.detalhe].filter(Boolean).join(" ") ||
            "Não foi possível salvar a receita.",
        );
      }
      const atualizada = (await resposta.json()) as Receita;
      setReceitas((atuais) =>
        atuais.map((item) => (item.id === atualizada.id ? atualizada : item)),
      );
      setSelecionada(atualizada);
      avisarDadosAtualizados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a receita.",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={receitas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => abrirReceita(item)}
          >
            <View
              style={[
                styles.colorBar,
                { backgroundColor: item.cor || "#0081CC" },
              ]}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{item.nomedindin}</Text>
                <Ionicons name="arrow-forward" size={20} color="#0081CC" />
              </View>
              <Text
                style={item.receita ? styles.preview : styles.emptyPreview}
                numberOfLines={2}
              >
                {item.receita ||
                  "Nenhuma receita cadastrada. Toque para escrever."}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>PLANEJAMENTO</Text>
            <Text style={styles.title}>Receitas</Text>
            <Text style={styles.description}>
              Guarde o modo de preparo de cada sabor em um só lugar.
            </Text>
            {erro ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{erro}</Text>
                <TouchableOpacity onPress={carregar}>
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
              <Text style={styles.emptyTitle}>Nenhum sabor cadastrado</Text>
              <Text style={styles.emptyText}>
                Cadastre um sabor para começar a escrever suas receitas.
              </Text>
            </View>
          ) : null
        }
      />
      {selecionada ? (
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={fecharReceita} />
          <Animated.View
            style={[
              styles.panel,
              { transform: [{ translateX: deslocamento }] },
            ]}
          >
            <View style={styles.panelHeader}>
              <TouchableOpacity
                onPress={fecharReceita}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#12344A" />
              </TouchableOpacity>
              <Text style={styles.panelEyebrow}>RECEITA DO SABOR</Text>
              <Text style={styles.panelTitle}>{selecionada.nomedindin}</Text>
            </View>
            <View style={styles.editorContent}>
              <Text style={styles.label}>Modo de preparo</Text>
              <TextInput
                value={texto}
                onChangeText={setTexto}
                multiline
                textAlignVertical="top"
                placeholder="Escreva ingredientes, quantidades e o modo de preparo..."
                placeholderTextColor="#6D9AB3"
                style={styles.recipeInput}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={salvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={19} color="#FFFFFF" />
                    <Text style={styles.saveText}>Salvar receita</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
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
    marginBottom: 22,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    marginBottom: 12,
    minHeight: 100,
    overflow: "hidden",
  },
  colorBar: { width: 6 },
  cardContent: { flex: 1, padding: 16 },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardName: { color: "#12344A", fontSize: 20, fontWeight: "800" },
  preview: { color: "#527A91", fontSize: 15, lineHeight: 21, marginTop: 10 },
  emptyPreview: {
    color: "#0081CC",
    fontSize: 15,
    lineHeight: 19,
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: "#FFF1ED",
    borderRadius: 10,
    marginBottom: 14,
    padding: 12,
  },
  errorText: { color: "#A34432", fontSize: 14 },
  retryText: { color: "#A34432", fontWeight: "800", marginTop: 8 },
  loader: { marginVertical: 20 },
  emptyState: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 20 },
  emptyTitle: { color: "#12344A", fontSize: 19, fontWeight: "800" },
  emptyText: { color: "#527A91", fontSize: 15, marginTop: 6 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(23,52,45,0.35)",
  },
  panel: {
    backgroundColor: "#F3FAFE",
    elevation: 12,
    flex: 1,
    marginLeft: "auto",
    shadowColor: "#12344A",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    width: "91%",
  },
  panelHeader: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 20,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  closeButton: { alignSelf: "flex-end", padding: 2 },
  panelEyebrow: {
    color: "#0081CC",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 8,
  },
  panelTitle: {
    color: "#12344A",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 5,
  },
  editorContent: { flex: 1, padding: 20 },
  label: {
    color: "#52645B",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  recipeInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#B7DFF2",
    borderRadius: 12,
    borderWidth: 1,
    color: "#12344A",
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 260,
    padding: 15,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#0081CC",
    borderRadius: 10,
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    marginTop: 16,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
});

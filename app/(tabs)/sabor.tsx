import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
const CORES = [
  "#8B5CF6",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#0081CC",
  "#78350F",
];
type Sabor = {
  id: number;
  nomedindin: string;
  quantidadesabor: number;
  cor: string;
};

export default function SaborScreen() {
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Sabor | null>(null);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [cor, setCor] = useState(CORES[0]);
  const [entrada, setEntrada] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<Sabor | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const resposta = await fetch(`${API_URL}/sabores`);
      if (!resposta.ok) throw new Error("Falha ao buscar sabores.");
      setSabores((await resposta.json()) as Sabor[]);
    } catch {
      setErro("Não foi possível carregar os sabores.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => assinarAtualizacao(carregar), [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setNome("");
    setQuantidade("");
    setCor(CORES[0]);
    setModalAberto(true);
  };

  const abrirEdicao = (sabor: Sabor) => {
    setEditando(sabor);
    setNome(sabor.nomedindin);
    setQuantidade(String(sabor.quantidadesabor));
    setCor(sabor.cor || CORES[0]);
    setModalAberto(true);
  };

  const salvar = async () => {
    const valor = Number(quantidade);
    if (!nome.trim() || !Number.isInteger(valor) || valor < 0) {
      setErro("Informe um nome e uma quantidade inteira válida.");
      return;
    }
    try {
      setSalvando(true);
      setErro(null);
      const resposta = await fetch(
        editando
          ? `${API_URL}/editarSabor/${editando.id}`
          : `${API_URL}/novo-sabor`,
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomedindin: nome.trim(),
            quantidadesabor: valor,
            cor,
          }),
        },
      );
      if (!resposta.ok) {
        const detalhe = (await resposta.json()) as {
          mensagem?: string;
          detalhe?: string;
        };
        throw new Error(
          [detalhe.mensagem, detalhe.detalhe].filter(Boolean).join(" ") ||
            "Não foi possível salvar o sabor.",
        );
      }
      setModalAberto(false);
      await carregar();
      avisarDadosAtualizados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o sabor.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const adicionarEntrada = async (sabor: Sabor) => {
    const valor = Number(entrada[sabor.id]);
    if (!Number.isInteger(valor) || valor <= 0) {
      setErro("Informe uma entrada maior que zero.");
      return;
    }
    try {
      setErro(null);
      const resposta = await fetch(`${API_URL}/adicionar-entrada/${sabor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entradas: valor }),
      });
      if (!resposta.ok) {
        const detalhe = (await resposta.json()) as {
          mensagem?: string;
          detalhe?: string;
        };
        throw new Error(
          [detalhe.mensagem, detalhe.detalhe].filter(Boolean).join(" ") ||
            "Não foi possível adicionar a entrada.",
        );
      }
      setEntrada((atual) => ({ ...atual, [sabor.id]: "" }));
      await carregar();
      avisarDadosAtualizados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a entrada.",
      );
    }
  };

  const confirmarExclusao = (sabor: Sabor) => {
    setExcluindo(sabor);
  };

  const excluirSabor = async (sabor: Sabor) => {
    try {
      setErro(null);
      const resposta = await fetch(`${API_URL}/dindin/${sabor.id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        const detalhe = (await resposta.json()) as {
          mensagem?: string;
          detalhe?: string;
        };
        throw new Error(
          [detalhe.mensagem, detalhe.detalhe].filter(Boolean).join(" ") ||
            "Não foi possível excluir o sabor.",
        );
      }
      await carregar();
      avisarDadosAtualizados();
      setExcluindo(null);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o sabor.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={sabores}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>CADASTRO</Text>
            <Text style={styles.title}>Sabores</Text>
            <Text style={styles.description}>
              Cadastre, edite e reponha o estoque dos seus dindins.
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={abrirNovo}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adicionar sabor</Text>
            </TouchableOpacity>
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
        renderItem={({ item }) => (
          <View
            style={[styles.card, { borderLeftColor: item.cor || CORES[6] }]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: item.cor || CORES[6] },
                ]}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.nomedindin}</Text>
                <Text style={styles.cardStock}>
                  {item.quantidadesabor} unidades em estoque
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => abrirEdicao(item)}
                  style={styles.cardAction}
                >
                  <Ionicons name="create-outline" size={21} color="#0081CC" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmarExclusao(item)}
                  style={styles.cardAction}
                >
                  <Ionicons name="trash-outline" size={21} color="#B4493B" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.entryRow}>
              <TextInput
                value={entrada[item.id] ?? ""}
                onChangeText={(valor) =>
                  setEntrada((atual) => ({
                    ...atual,
                    [item.id]: valor.replace(/[^0-9]/g, ""),
                  }))
                }
                keyboardType="number-pad"
                placeholder="Qtd."
                placeholderTextColor="#6D9AB3"
                style={styles.entryInput}
              />
              <TouchableOpacity
                style={styles.entryButton}
                onPress={() => adicionarEntrada(item)}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.entryText}>Adicionar entrada</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !carregando && !erro ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhum sabor cadastrado</Text>
              <Text style={styles.emptyText}>
                Use o botão acima para criar o primeiro.
              </Text>
            </View>
          ) : null
        }
      />
      <Modal
        visible={modalAberto}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editando ? "Editar sabor" : "Novo sabor"}
              </Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <Ionicons name="close" size={24} color="#12344A" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Nome do sabor</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: Uva"
              placeholderTextColor="#6D9AB3"
              style={styles.input}
            />
            <Text style={styles.label}>Quantidade inicial</Text>
            <TextInput
              value={quantidade}
              onChangeText={(valor) =>
                setQuantidade(valor.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#6D9AB3"
              style={styles.input}
            />
            <Text style={styles.label}>Cor do card</Text>
            <View style={styles.colors}>
              {CORES.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCor(item)}
                  style={[
                    styles.colorChoice,
                    { backgroundColor: item },
                    cor === item && styles.selectedColor,
                  ]}
                  accessibilityLabel={`Escolher cor ${item}`}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={salvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>
                  {editando ? "Salvar alterações" : "Cadastrar sabor"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={Boolean(excluindo)}
        transparent
        animationType="fade"
        onRequestClose={() => setExcluindo(null)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmBox}>
            <Ionicons name="warning-outline" size={30} color="#B4493B" />
            <Text style={styles.confirmTitle}>Excluir sabor?</Text>
            <Text style={styles.confirmText}>
              {excluindo?.nomedindin} e todo o histórico mensal dele serão
              apagados.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setExcluindo(null)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => excluindo && excluirSabor(excluindo)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 18,
    marginTop: 8,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#0081CC",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 5,
    borderRadius: 12,
    marginTop: 14,
    padding: 16,
  },
  cardHeader: { alignItems: "center", flexDirection: "row" },
  cardActions: { alignItems: "center", flexDirection: "row", gap: 12 },
  cardAction: { padding: 4 },
  swatch: { borderRadius: 14, height: 28, width: 28 },
  cardInfo: { flex: 1, marginLeft: 11 },
  cardName: { color: "#12344A", fontSize: 19, fontWeight: "800" },
  cardStock: { color: "#527A91", fontSize: 14, marginTop: 4 },
  entryRow: { alignItems: "center", flexDirection: "row", marginTop: 15 },
  entryInput: {
    backgroundColor: "#F0F8FD",
    borderColor: "#B7DFF2",
    borderRadius: 8,
    borderWidth: 1,
    color: "#12344A",
    height: 42,
    paddingHorizontal: 12,
    width: 76,
  },
  entryButton: {
    alignItems: "center",
    backgroundColor: "#0081CC",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    height: 42,
    justifyContent: "center",
    marginLeft: 8,
  },
  entryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  errorBox: {
    backgroundColor: "#FFF1ED",
    borderRadius: 10,
    marginTop: 14,
    padding: 12,
  },
  errorText: { color: "#A34432", fontSize: 14 },
  retryText: { color: "#A34432", fontWeight: "800", marginTop: 8 },
  loader: { marginVertical: 20 },
  empty: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 14,
    padding: 20,
  },
  emptyTitle: { color: "#12344A", fontSize: 19, fontWeight: "800" },
  emptyText: { color: "#527A91", fontSize: 15, marginTop: 6 },
  modalBackdrop: {
    backgroundColor: "rgba(23,52,45,0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { color: "#12344A", fontSize: 25, fontWeight: "800" },
  label: {
    color: "#52645B",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F0F8FD",
    borderColor: "#B7DFF2",
    borderRadius: 8,
    borderWidth: 1,
    color: "#12344A",
    height: 46,
    paddingHorizontal: 12,
  },
  colors: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  colorChoice: { borderRadius: 18, height: 32, width: 32 },
  selectedColor: { borderColor: "#12344A", borderWidth: 3 },
  confirmBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(23,52,45,0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  confirmBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 22,
    width: "100%",
  },
  confirmTitle: {
    color: "#12344A",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },
  confirmText: { color: "#66736D", fontSize: 14, lineHeight: 20, marginTop: 8 },
  confirmActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelButton: {
    alignItems: "center",
    borderColor: "#B7DFF2",
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  cancelText: { color: "#52645B", fontSize: 14, fontWeight: "800" },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#B4493B",
    borderRadius: 9,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  deleteText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#0081CC",
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    marginTop: 24,
  },
  saveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});

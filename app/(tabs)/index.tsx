import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  assinarAtualizacao,
  avisarDadosAtualizados,
} from "../lib/dados-atualizados";
import { styles } from "./styles/stylesHome";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

type Sabor = {
  id: number;
  nomedindin: string;
  quantidadesabor: number;
  cor?: string;
};
type Movimento = { dindin_id: number; entradas: number; saidas: number };
type Historico = {
  total_entradas_mes: number;
  custo_mes: number;
  lucro_mes: number;
  faturamento_mes: number;
  sabores: Movimento[];
};

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function HomeScreen() {
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [resumo, setResumo] = useState({
    total: 0,
    custo: 0,
    lucro: 0,
    faturamento: 0,
  });
  const [movimentos, setMovimentos] = useState<Record<number, Movimento>>({});
  const [quantidades, setQuantidades] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      setErro(null);
      const [saboresResponse, historicoResponse] = await Promise.all([
        fetch(`${API_URL}/sabores`),
        fetch(`${API_URL}/historico-por-mes`),
      ]);
      if (!saboresResponse.ok || !historicoResponse.ok)
        throw new Error("Falha ao carregar os dados.");
      const saboresRecebidos = (await saboresResponse.json()) as Sabor[];
      const historicos = (await historicoResponse.json()) as Historico[];
      const mesAtual = historicos[0];
      setSabores(saboresRecebidos);
      setResumo({
        total: Number(mesAtual?.total_entradas_mes ?? 0),
        custo: Number(mesAtual?.custo_mes ?? 0),
        lucro: Number(mesAtual?.lucro_mes ?? 0),
        faturamento: Number(mesAtual?.faturamento_mes ?? 0),
      });
      setMovimentos(
        Object.fromEntries(
          (mesAtual?.sabores ?? []).map((movimento) => [
            movimento.dindin_id,
            movimento,
          ]),
        ),
      );
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Confira se o backend está ligado.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => assinarAtualizacao(carregarDados), [carregarDados]);

  const registrarVenda = async (sabor: Sabor) => {
    const quantidade = Number(quantidades[sabor.id]);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }
    try {
      setSalvandoId(sabor.id);
      setErro(null);
      const response = await fetch(`${API_URL}/adicionar-saida/${sabor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saidas: quantidade }),
      });
      if (!response.ok) {
        const resposta = (await response.json()) as {
          mensagem?: string;
          detalhe?: string;
        };
        throw new Error(
          [resposta.mensagem, resposta.detalhe].filter(Boolean).join(" ") ||
            "Não foi possível registrar a venda.",
        );
      }
      setQuantidades((atual) => ({ ...atual, [sabor.id]: "" }));
      await carregarDados();
      avisarDadosAtualizados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a venda.",
      );
    } finally {
      setSalvandoId(null);
    }
  };

  const mesAtual = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .replace(/^./, (letra) => letra.toUpperCase());
  const renderSabor = ({ item }: { item: Sabor }) => {
    const movimento = movimentos[item.id] ?? { entradas: 0, saidas: 0 };
    const salvando = salvandoId === item.id;
    return (
      <View
        style={[
          styles.flavorRow,
          { borderLeftColor: item.cor ?? "#0081CC", borderLeftWidth: 5 },
        ]}
      >
        <View style={styles.flavorInfo}>
          <Text style={styles.flavorName}>{item.nomedindin}</Text>
          <Text style={styles.flavorMeta}>
            Entraram {movimento.entradas} · Saíram {movimento.saidas} no mês
          </Text>
        </View>
        <View style={styles.stockBadge}>
          <Text style={styles.stockValue}>{item.quantidadesabor}</Text>
          <Text style={styles.stockLabel}>un.</Text>
        </View>
        <View style={styles.saleAction}>
          <TextInput
            value={quantidades[item.id] ?? ""}
            onChangeText={(valor) =>
              setQuantidades((atual) => ({
                ...atual,
                [item.id]: valor.replace(/[^0-9]/g, ""),
              }))
            }
            keyboardType="number-pad"
            placeholder="Qtd."
            placeholderTextColor="#6D9AB3"
            style={styles.quantityInput}
            accessibilityLabel={`Quantidade de vendas de ${item.nomedindin}`}
          />
          <TouchableOpacity
            style={[styles.saleButton, salvando && styles.saleButtonDisabled]}
            onPress={() => registrarVenda(item)}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saleButtonText}>Registrar venda</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={sabores}
      renderItem={renderSabor}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <Text style={styles.eyebrow}>Visão geral</Text>
          <Text style={styles.title}>Seu mês em movimento</Text>
          <View style={styles.monthRow}>
            <Text style={styles.monthText}>{mesAtual}</Text>
            <Text style={styles.monthHint}>Atualizado agora</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryLabel}>LUCRO DO MÊS</Text>
                <Text style={styles.summaryValue}>{moeda(resumo.lucro)}</Text>
              </View>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>↗</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Faturamento</Text>
                <Text style={styles.summaryStatValue}>
                  {moeda(resumo.faturamento)}
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Gasto do mês</Text>
                <Text style={styles.summaryStatValue}>
                  {moeda(resumo.custo)}
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Produção</Text>
                <Text style={styles.summaryStatValue}>{resumo.total} un.</Text>
              </View>
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sabores em estoque</Text>
              <Text style={styles.sectionSubtitle}>
                Registre as vendas do dia
              </Text>
            </View>
            <Text style={styles.flavorCount}>{sabores.length} sabores</Text>
          </View>
          {erro ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erro}</Text>
              <TouchableOpacity onPress={carregarDados}>
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
        !carregando ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum sabor cadastrado</Text>
            <Text style={styles.emptyText}>
              Cadastre seu primeiro sabor para acompanhar o estoque por aqui.
            </Text>
          </View>
        ) : null
      }
    />
  );
}

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

const API_URL = "http://10.234.156.181:3000";

export default function Saida({ navigation, route }) {
  const usuarioId = route.params?.usuarioId;
  const item = route.params?.item;

  const [quantidade, setQuantidade] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function registrarSaida() {
    const quantidadeNumerica = Number(quantidade);

    if (
      quantidade === "" ||
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      Alert.alert("Atenção", "Digite uma quantidade inteira maior que zero.");
      return;
    }

    if (quantidadeNumerica > item.quantidade) {
      Alert.alert(
        "Atenção",
        `O estoque possui apenas ${item.quantidade} unidade(s).`,
      );
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/itens/${item.id}/saida`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          quantidade: quantidadeNumerica,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao registrar saída.");
      }

      Alert.alert("Sucesso", "Saída registrada com sucesso.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (erro) {
      Alert.alert("Erro", erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saída de item</Text>

      <View style={styles.card}>
        <Text style={styles.nome}>{item?.nome}</Text>

        <Text style={styles.estoque}>Estoque atual: {item?.quantidade}</Text>
      </View>

      <Text style={styles.label}>Quantidade de saída</Text>

      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        placeholder="Digite a quantidade"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
      />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.cancelar}
          onPress={() => navigation.goBack()}
          disabled={carregando}
        >
          <Text style={styles.cancelarText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saida}
          onPress={registrarSaida}
          disabled={carregando}
        >
          <Text style={styles.saidaText}>
            {carregando ? "Registrando..." : "Registrar saída"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 18,
    marginBottom: 25,
  },
  nome: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  estoque: {
    color: "#94a3b8",
    fontSize: 16,
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#334155",
    color: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  cancelar: {
    flex: 1,
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  saida: {
    flex: 1,
    backgroundColor: "#F28C28",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saidaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

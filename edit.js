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

export default function Edit({ navigation, route }) {
  const usuarioId = route.params?.usuarioId;
  const item = route.params?.item;

  const [nome, setNome] = useState(item?.nome || "");
  const [quantidade, setQuantidade] = useState(String(item?.quantidade ?? ""));
  const [carregando, setCarregando] = useState(false);

  async function salvarAlteracoes() {
    const nomeLimpo = nome.trim();
    const quantidadeNumerica = Number(quantidade);

    if (!nomeLimpo) {
      Alert.alert("Atenção", "Digite o nome do item.");
      return;
    }

    if (
      quantidade === "" ||
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica < 0
    ) {
      Alert.alert(
        "Atenção",
        "Digite uma quantidade inteira maior ou igual a zero.",
      );
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/itens/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          nome: nomeLimpo,
          quantidade: quantidadeNumerica,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao editar item.");
      }

      Alert.alert("Sucesso", "Item atualizado com sucesso.", [
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
      <Text style={styles.title}>Editar item</Text>

      <Text style={styles.label}>Nome do item</Text>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome"
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.label}>Quantidade</Text>

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
          style={styles.salvar}
          onPress={salvarAlteracoes}
          disabled={carregando}
        >
          <Text style={styles.salvarText}>
            {carregando ? "Salvando..." : "Salvar"}
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
  salvar: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  salvarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

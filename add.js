import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import colors from "./src/style/colors";
import { useState } from "react";

const API_URL = "http://10.66.157.181:3000";

export default function Add({ navigation, route }) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [carregando, setCarregando] = useState(false);

  const usuarioId = route.params?.usuarioId;

  async function cadastrarItem() {
    const nomeLimpo = nome.trim();

    if (!usuarioId) {
      Alert.alert("Erro", "Não foi possível identificar o usuário.");
      return;
    }

    if (!nomeLimpo || quantidade.trim() === "") {
      Alert.alert("Atenção", "Preencha o nome e a quantidade.");
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (!Number.isSafeInteger(quantidadeNumero) || quantidadeNumero < 0) {
      Alert.alert(
        "Quantidade inválida",
        "Informe um número inteiro igual ou maior que zero.",
      );
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/itens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          nome: nomeLimpo,
          quantidade: quantidadeNumero,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível cadastrar o item.");
      }

      Alert.alert("Sucesso", dados.mensagem, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);

      setNome("");
      setQuantidade("");
    } catch (erro) {
      console.error("Erro ao cadastrar item:", erro);

      Alert.alert(
        "Erro",
        erro.message === "Network request failed"
          ? "Não foi possível conectar à API."
          : erro.message || "Ocorreu um erro ao cadastrar o item.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={estilo.tela}>
      <Text style={estilo.titulo}>Adicionar item</Text>

      <Text style={estilo.rotulo}>Nome do item</Text>

      <TextInput
        style={estilo.campo}
        placeholder="Nome do item"
        placeholderTextColor="#888888"
        value={nome}
        onChangeText={setNome}
        editable={!carregando}
      />

      <Text style={estilo.rotulo}>Quantidade</Text>

      <TextInput
        style={estilo.campo}
        placeholder="Quantidade"
        placeholderTextColor="#888888"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        editable={!carregando}
      />

      <View style={estilo.botoes}>
        <TouchableOpacity
          style={estilo.botaoCancelar}
          onPress={() => navigation.goBack()}
          disabled={carregando}
        >
          <Text style={estilo.textoBotao}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilo.botao}
          onPress={cadastrarItem}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilo.textoBotao}>Adicionar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilo = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  titulo: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
  },

  rotulo: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },

  campo: {
    backgroundColor: colors.cardBackground,
    color: colors.text,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },

  botoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 25,
  },

  botaoCancelar: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },

  botao: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

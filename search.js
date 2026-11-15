import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import colors from "./src/style/colors";
import { StatusBar } from "expo-status-bar";

const API_URL = "http://10.66.157.181:3000";

export default function Search({ route }) {
  const usuarioId = route.params?.usuarioId;
  const [itens, setItens] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);

  const buscarItens = useCallback(async () => {
    if (!usuarioId) {
      Alert.alert("Erro", "Usuário não identificado.");
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/itens?usuario_id=${usuarioId}`);

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível carregar os itens.",
        );
      }

      setItens(dados);
    } catch (erro) {
      Alert.alert(
        "Erro",
        erro.message || "Não foi possível carregar os itens.",
      );
    } finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      buscarItens();
    }, [buscarItens]),
  );

  const itensFiltrados = itens.filter((item) =>
    item.nome.toLowerCase().includes(pesquisa.trim().toLowerCase()),
  );

  function renderItem({ item }) {
    return (
      <View style={estilo.item}>
        <Text style={estilo.nomeItem}>{item.nome}</Text>

        <Text style={estilo.quantidadeItem}>{item.quantidade} unidades</Text>
      </View>
    );
  }

  return (
    <View style={estilo.tela}>
      <View style={estilo.cabecalho}>
        <Text style={estilo.titulo}>Pesquisar</Text>
      </View>

      <TextInput
        style={estilo.campoPesquisa}
        placeholder="Pesquisar item..."
        placeholderTextColor={colors.textSecondary}
        value={pesquisa}
        onChangeText={setPesquisa}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {carregando ? (
        <View style={estilo.carregando}>
          <ActivityIndicator size="large" color={colors.text} />

          <Text style={estilo.textoCarregando}>Carregando itens...</Text>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            itensFiltrados.length === 0 ? estilo.listaVazia : estilo.lista
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={estilo.nenhumItem}>
              {pesquisa.trim()
                ? "Nenhum item encontrado."
                : "Nenhum item cadastrado."}
            </Text>
          }
        />
      )}

      <StatusBar style="light" />
    </View>
  );
}

const estilo = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },

  cabecalho: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  titulo: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "bold",
  },

  campoPesquisa: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    color: colors.text,
    fontSize: 15,
  },

  lista: {
    paddingBottom: 20,
  },

  listaVazia: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
  },

  nomeItem: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },

  quantidadeItem: {
    color: colors.text,
    fontSize: 14,
  },

  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textoCarregando: {
    color: colors.text,
    fontSize: 15,
    marginTop: 10,
  },

  nenhumItem: {
    color: colors.text,
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
});
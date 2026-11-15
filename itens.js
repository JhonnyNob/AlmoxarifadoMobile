import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import colors from "./src/style/colors";
import { StatusBar } from "expo-status-bar";

const API_URL = "http://10.66.157.181:3000";

export default function Itens({ navigation, route }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const usuarioId = route.params?.usuarioId;

  const buscarItens = useCallback(async () => {
    if (!usuarioId) {
      setCarregando(false);

      Alert.alert("Erro", "Não foi possível identificar o usuário logado.");

      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/itens?usuario_id=${usuarioId}`);

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao buscar itens.");
      }

      setItens(dados);
    } catch (erro) {
      console.error("Erro ao carregar itens:", erro);

      Alert.alert("Erro", "Não foi possível carregar os itens.");
    } finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      buscarItens();
    }, [buscarItens]),
  );

  function abrirAdicionar() {
    navigation.navigate("Add", {
      usuarioId,
    });
  }

  return (
    <View style={estilo.tela}>
      <View style={estilo.cabecalho}>
        <Text style={estilo.titulo}>Itens</Text>

        <TouchableOpacity style={estilo.adicionar} onPress={abrirAdicionar}>
          <Text style={estilo.mais}>+</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={estilo.carregando}>
          <ActivityIndicator size="large" color={colors.text} />

          <Text style={estilo.textoCarregando}>Carregando itens...</Text>
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={estilo.lista}
          renderItem={({ item }) => (
            <View style={estilo.item}>
              <Text style={estilo.nomeItem}>{item.nome}</Text>

              <Text style={estilo.quantidadeItem}>
                {item.quantidade} unidades
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={estilo.nenhumItem}>Nenhum item cadastrado.</Text>
          }
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const estilo = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },

  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  titulo: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "bold",
  },

  adicionar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  mais: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 30,
  },

  lista: {
    paddingBottom: 20,
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

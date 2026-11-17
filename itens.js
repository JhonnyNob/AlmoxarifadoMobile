import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://10.234.156.181:3000";

export default function Itens({ navigation, route }) {
  const usuarioId = route.params?.usuarioId;

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarItens = useCallback(async () => {
    if (!usuarioId) {
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/itens?usuario_id=${usuarioId}`);

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao carregar itens.");
      }

      setItens(dados);
    } catch (erro) {
      Alert.alert("Erro", erro.message);
    } finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      carregarItens();
    }, [carregarItens]),
  );

  function abrirSaida(item) {
    navigation.navigate("Saida", {
      usuarioId,
      item,
    });
  }

  function abrirEdicao(item) {
    navigation.navigate("Edit", {
      usuarioId,
      item,
    });
  }

  function confirmarExclusao(item) {
    Alert.alert("Excluir item", `Deseja realmente excluir "${item.nome}"?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => excluirItem(item.id),
      },
    ]);
  }

  async function excluirItem(id) {
    try {
      const resposta = await fetch(
        `${API_URL}/itens/${id}?usuario_id=${usuarioId}`,
        {
          method: "DELETE",
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao excluir item.");
      }

      setItens((anteriores) => anteriores.filter((item) => item.id !== id));

      Alert.alert("Sucesso", "Item excluído com sucesso.");
    } catch (erro) {
      Alert.alert("Erro", erro.message);
    }
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.informacoes}>
          <Text style={styles.nome}>{item.nome}</Text>

          <Text style={styles.quantidade}>Quantidade: {item.quantidade}</Text>
        </View>

        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.botaoSaida}
            onPress={() => abrirSaida(item)}
          >
            <Text style={styles.textoAcao}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => abrirEdicao(item)}
          >
            <Text style={styles.textoAcao}>✎</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => confirmarExclusao(item)}
          >
            <Text style={styles.textoAcao}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Itens</Text>

        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() =>
            navigation.navigate("Add", {
              usuarioId,
            })
          }
        >
          <Text style={styles.textoAdicionar}>+</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={
            itens.length === 0 ? styles.listaVazia : styles.lista
          }
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum item cadastrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  titulo: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },
  botaoAdicionar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  textoAdicionar: {
    color: "#ffffff",
    fontSize: 30,
    lineHeight: 32,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  informacoes: {
    flex: 1,
  },
  nome: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  quantidade: {
    color: "#94a3b8",
    fontSize: 15,
  },
  acoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginLeft: 10,
  },
  botaoSaida: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F28C28",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoEditar: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoExcluir: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  textoAcao: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "bold",
  },
  vazio: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
  },
  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

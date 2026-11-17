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

const API_URL = "http://10.234.156.181:3000";

export default function Search({ route }) {
  const usuarioId = route.params?.usuarioId;

  const [pesquisa, setPesquisa] = useState("");
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

  const itensFiltrados = itens.filter((item) =>
    item.nome.toLowerCase().includes(pesquisa.trim().toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pesquisar</Text>

      <TextInput
        style={styles.input}
        value={pesquisa}
        onChangeText={setPesquisa}
        placeholder="Pesquisar item"
        placeholderTextColor="#94a3b8"
      />

      {carregando ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={
            itensFiltrados.length === 0 ? styles.listaVazia : styles.lista
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.informacoes}>
                <Text style={styles.nome}>{item.nome}</Text>

                <Text style={styles.quantidade}>
                  Quantidade: {item.quantidade}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum item encontrado.</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titulo: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#334155",
    color: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 15,
  },
  lista: {
    paddingBottom: 20,
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
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

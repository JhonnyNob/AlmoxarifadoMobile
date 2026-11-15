import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import colors from "./src/style/colors";
import { StatusBar } from "expo-status-bar";

const API_URL = "http://10.66.157.181:3000";

export default function Cadastro({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    const nome = nomeUsuario.trim();

    if (!nome || !senha) {
      Alert.alert("Atenção", "Preencha o nome de usuário e a senha.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_usuario: nome,
          senha: senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        Alert.alert("Não foi possível cadastrar", dados.mensagem);
        return;
      }

      Alert.alert("Cadastro concluído", "Usuário cadastrado com sucesso!", [
        {
          text: "Ir para o login",
          onPress: () => navigation.navigate("Login"),
        },
      ]);

      setNomeUsuario("");
      setSenha("");
    } catch (erro) {
      Alert.alert(
        "Erro de conexão",
        "Não foi possível acessar a API. Verifique a conexão com o notebook.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={style.tela}>
      <Image
        source={require("./assets/images/Lettering_transparent.png")}
        style={style.lettering}
      />

      <TextInput
        style={style.botao}
        placeholder="Nome de usuário"
        placeholderTextColor={colors.text}
        value={nomeUsuario}
        onChangeText={setNomeUsuario}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={style.botao}
        placeholder="Senha"
        placeholderTextColor={colors.text}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={style.botaoEnter}
        onPress={cadastrar}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={style.textobotao}>Cadastrar!!!</Text>
        )}
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const style = StyleSheet.create({
  tela: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  lettering: {
    width: 400,
    height: 90,
    marginBottom: 100,
  },
  botao: {
    width: "90%",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    color: colors.text,
    fontSize: 15,
    fontWeight: "bold",
  },
  botaoEnter: {
    width: "90%",
    backgroundColor: colors.secondary,
    borderRadius: 15,
    padding: 15,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textobotao: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "bold",
  },
});

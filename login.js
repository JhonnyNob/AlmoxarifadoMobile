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

export default function Login({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    const nome = nomeUsuario.trim();

    if (!nome || !senha) {
      Alert.alert("Atenção", "Informe seu nome de usuário e senha.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/login`, {
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
        Alert.alert(
          "Não foi possível entrar",
          dados.mensagem || "Usuário ou senha inválidos.",
        );
        return;
      }

      navigation.navigate("Principal", {
        usuarioId: dados.usuario.id,
      });
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
        source={require("./assets/images/Logo2.png")}
        style={style.logo2}
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
        onPress={entrar}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={style.textobotao}>Entrar!!!</Text>
        )}
      </TouchableOpacity>

      <Text
        style={style.cadastro}
        onPress={() => navigation.navigate("Cadastro")}
      >
        Não tem Cadastro? Cadastre-se!!!
      </Text>

      <StatusBar style="light" />
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

  logo2: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 30,
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

  cadastro: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 15,
  },
});

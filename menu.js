import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import colors from "./src/style/colors";
import { StatusBar } from "expo-status-bar";

export default function Menu({ navigation }) {
  function sair() {
    Alert.alert("Sair", "Tem certeza que deseja sair da conta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  }

  return (
    <View style={estilo.tela}>
      <Text style={estilo.titulo}>Menu</Text>

      <TouchableOpacity style={estilo.botaoSair} onPress={sair}>
        <Text style={estilo.textoSair}>Sign out</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const estilo = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 30,
  },

  botaoSair: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  textoSair: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
});

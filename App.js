import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import Login from "./login";
import Cadastro from "./cadastro";
import Itens from "./itens";
import Search from "./search";
import Menu from "./menu";
import Add from "./add";
import Edit from "./edit";
import Saida from "./saida";

import colors from "./src/style/colors";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function NavegacaoPrincipal({ route }) {
  const usuarioId = route.params?.usuarioId;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: "#888888",
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: "#444444",
          height: 70,
          paddingBottom: 5,
          paddingTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Item"
        component={Itens}
        initialParams={{ usuarioId }}
        options={{
          tabBarLabel: "Item",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>▣</Text>,
        }}
      />

      <Tab.Screen
        name="Search"
        component={Search}
        initialParams={{ usuarioId }}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: () => <Text style={{ fontSize: 25 }}>⌕</Text>,
        }}
      />

      <Tab.Screen
        name="Menu"
        component={Menu}
        initialParams={{ usuarioId }}
        options={{
          tabBarLabel: "Menu",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>☰</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Principal" component={NavegacaoPrincipal} />
        <Stack.Screen name="Add" component={Add} />
        <Stack.Screen name="Edit" component={Edit} />
        <Stack.Screen name="Saida" component={Saida} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

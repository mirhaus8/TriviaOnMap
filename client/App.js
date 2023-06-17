import { useContext, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider, TextInput } from 'react-native-paper';
import { LoginScreen } from './app/screen/login/login';
import { RegisterScreen } from './app/screen/register/register';
import { theme } from './App.style';
import AppNavigator from './app/app.navigator';
import AppAuthNavigator from './app/appAuth.navigation';
import { AuthProvider } from './app/context/AuthContext';
import { QuestionsContext } from './app/context/QuestionsContext';
import { authContext } from "./app/context/AuthContext"; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';



export default function App() {
  const [ userTokenn, setUserTokenn ] = useState()
  
  return (
    
    <AuthProvider userTokenn={userTokenn} setUserTokenn={setUserTokenn}>
      <PaperProvider theme={theme}>
        <QuestionsContext>
          {/* {userTokenn?<AppAuthNavigator />:<AppNavigator />} */}
          <AppNavigator />
        </QuestionsContext>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

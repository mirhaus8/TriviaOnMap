//import { process_params } from "express/lib/router";
import { Formik } from "formik";
import React, { useContext } from "react";
import { SafeAreaView, View, TouchableOpacity, ImageBackground } from "react-native";
import { Button, Card, TextInput, Text } from "react-native-paper";
import { loginForm } from "./login.form";
import { loginStyle } from "./login.style";
import { FancyAlert } from 'react-native-expo-fancy-alerts';
import Alert from "./../../components/Alert";
import { authContext } from "../../context/AuthContext";
import jwtDecode from "jwt-decode";
import socket from "../../../utils/socketio";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RegisterScreen } from "../register/register";




const axios = require('axios')



export const LoginScreen = (props) => {
    const Tab = createBottomTabNavigator()
    const TabNavigator = () => {
        return (
            <Tab.Navigator>
                <Tab.Screen name="feed" component={RegisterScreen}></Tab.Screen>

            </Tab.Navigator>)
    }

    const { setUserToken, loginHandler, userToken, setUser } = useContext(authContext);
    const [visible, setVisible] = React.useState(false);
    const [error, setError] = React.useState(null);
    const register = () => props.navigation.navigate("Register");
    const login = async (username, password) => {
        //console.log("hiiii login")
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/login",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {
                username: username,
                password: password
            }
        };
        try {
            let response = await axios(options);
            if (response.data === "") {
                setVisible(true);
            }
            let responseOK = response && response.status === 200;
            if (responseOK) {
                let data = response.data;
                //console.log("login res", data)
                //console.log("jwtttttt", jwtDecode(data["accessToken"]));
                setUserToken(data["accessToken"])
                setUser(jwtDecode(data["accessToken"]))
                loginHandler(data["accessToken"], data["refreshToken"])
                //console.log("before navigate to group selection")
                props.navigation.navigate("GroupSelection", { school: data["school"], username: username, role: data["role"] })


                //console.log("jwtttttt", jwtDecode(userToken));
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data;
                //console.log("loginError", errorMessage)
                setError("Invalid credentials", errorMessage);
            } else {
                // Handle other errors
                setError("Something went wrong");
            }
        }
        // if (response.data != "")
        //     props.navigation.navigate("Settings",{username: username})

    };
    const toggleVisible = () => {
        setVisible(false);
    }

    return (
        <ImageBackground
        source={require('/Users/hausmann/conquerTheWorld4/assets/worldMapGame.jpg')}
        style={{flex: 1,
            resizeMode: 'cover',opacity: 1}}>
        <SafeAreaView style={loginStyle.content}>
            <View style={loginStyle.view}>
                {/* <Tab.Navigator>
                    <Tab.Screen name="feed" component={RegisterScreen}></Tab.Screen>

                </Tab.Navigator> */}
                <Card style={{backgroundColor: "#f4decb"}}>
                    <Card.Title
                        title="Conquer The World"
                        titleStyle={loginStyle.cardTitle}>
                    </Card.Title>
                    {error ? <Text style={{ marginLeft: 16, marginRight: 16, color: "white", backgroundColor: "red" }}>
                        {error}
                    </Text> : ""}
                    <Card.Content>
                        <Formik
                            initialValues={{ username: "", password: "" }}
                            onSubmit={(values, action) => {
                                login(values["username"], values["password"]);

                            }}
                            validationSchema={loginForm}>
                            {({ handleSubmit, handleChange, errors, setFieldTouched, touched, values }) => (
                                <>

                                    <TextInput
                                        label="Username"
                                        onChangeText={handleChange('username')}
                                        onFocus={() => setFieldTouched('username')} />
                                    {
                                        touched.username && errors.username ?
                                            <Text style={{ color: "white", backgroundColor: "red" }}>
                                                errors.username
                                            </Text>
                                            : null

                                    }
                                    <TextInput
                                        label="Password"
                                        secureTextEntry={true}
                                        onChangeText={handleChange('password')}
                                        onFocus={() => setFieldTouched('password')} />
                                    {
                                        touched.password && errors.password ?
                                            <Text style={{ color: "white", backgroundColor: "red" }}>
                                                errors.password
                                            </Text>
                                            : null

                                    }
                                    <Button
                                        uppercase={false}
                                        style={loginStyle.cardButton}
                                        mode="text" textColor="#b07154"
                                        disabled={values.username == '' || errors.username ? true : false}>
                                        Forgot password
                                    </Button>
                                    <Button
                                        onPress={handleSubmit}
                                        mode="contained"
                                        style={[loginStyle.cardButton, {backgroundColor:"#b07154"}]}>
                                        Login
                                    </Button>
                                    <Button
                                        mode="text" textColor="#b07154"
                                        onPress={register}>
                                        Register
                                    </Button>
                                </>
                            )}

                        </Formik>
                    </Card.Content>
                </Card>
                <FancyAlert
                    visible={visible}
                    icon={<View style={loginStyle.icon}><Text>❌</Text></View>}
                    style={{ backgroundColor: 'white' }}
                >
                    <View >
                        <Text>You are not registered!</Text>

                        <TouchableOpacity style={loginStyle.btn} onPress={toggleVisible}>
                            <Text>OK</Text>
                        </TouchableOpacity>
                    </View>
                </FancyAlert>
            </View>
        </SafeAreaView >
        </ImageBackground>
    )
}
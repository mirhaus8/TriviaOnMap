import React from "react";
import { Text, SafeAreaView, ScrollView, View } from "react-native";
import { TextInput, Button, Appbar, Title } from "react-native-paper";
import { HeaderComponent } from "../../components/header";
import { registerStyle } from "./register.style";
import {Picker} from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';
import ListItemSeparator from "../../components/ListItemSeparator";



const axios = require('axios')

export const RegisterScreen = (props) => {
    const classes = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth']

    const [name, setName] = React.useState('');
    const [schoolName, setSchoolName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [role, setRole] = React.useState('');
    const [grade, setGrade] = React.useState("");
    const [error, setError] = React.useState('');


    const register = async () => {
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/register",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {
                username: name,
                password: password,
                role: role,
                school:schoolName,
                grade:grade
            }
        };
        try {
        let response = await axios(options);
      //  console.log(response);
        let responseOK = response && response.status === 200;
        if (responseOK) {
            let data = await response.data;
            props.navigation.navigate("Login");
        }
    }catch (error) {
        if (error.response && error.response.status === 409) {
          //  console.log("errorrrrrrrrr in registerationnnnn2222222", error)
            setError('Username already exists');
        } else {
         //   console.log("errorrrrrrrrr in registerationnnnn", error)
            setError('Registration failed');
        }

    }
    }



    return (
        <SafeAreaView>
            <ScrollView>
                <HeaderComponent title="Register"
                    navigation={props.navigation} />
                <View style={registerStyle.content}>
                    <TextInput label="Name"
                        onChangeText={newName => setName(newName)} />
                    <TextInput label="School Name"
                        onChangeText={newName => setSchoolName(newName)} />
                    
                    <TextInput
                        label="Password"
                        secureTextEntry={true}
                        right={<TextInput.Icon
                            name="eye-off-outline" />}
                        color={registerStyle.icon.color}
                        onChangeText={newPass => setPassword(newPass)} />
                    <TextInput
                        label="Confirm password"
                        secureTextEntry={true}
                        right={<TextInput.Icon
                            name="eye-off-outline" />}
                        color={registerStyle.icon.color}
                        onChangeText={newConfirm => setConfirmPassword(newConfirm)} />
                    <View style={registerStyle.picker}>
                        <View style={{flex:1}}>
                        <Text style={{  marginLeft:15,marginTop:15,fontSize: 18, }}>class Selection:  </Text>
                        </View>
                        <View style={{flex:1}}>
                        <SelectDropdown
                                data={classes}
                                onSelect={(selectedItem, index) => {
                                    setGrade(selectedItem);
                            
                                }}
                                defaultButtonText={'Class'}
                                buttonTextAfterSelection={(selectedItem, index) => {
                                    // text represented after item is selected
                                    // if data array is an array of objects then return selectedItem.property to render after item is selected

                                    return selectedItem;
                                }}

                        />
                        </View>
                    </View>
                    <ListItemSeparator></ListItemSeparator>
                    <Text style={{fontSize: 18, marginTop:10, justifyContent: "center",display: "flex",flexDirection: 'row', }}>Level Selection:</Text>
                    <Picker
                        selectedValue={role !== '' ? role : 'regular'}
                        //style={styles.picker}
                        onValueChange={(itemValue, itemIndex) =>
                            setRole(itemValue)
                        }>
                        
                        <Picker.Item label="student" value="student" />
                        <Picker.Item label="teacher" value="teacher" />
                    </Picker>
                    {error !== '' && <Text style={registerStyle.errorText}>{error}</Text>}
                    <Button
                        mode="contained"
                        style={registerStyle.button}
                        onPress={register}>
                        Register
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

export const authContext = createContext();

export const AuthProvider = ({ userTokenn, setUserTokenn, children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userRefreshToken, setUserRefreshToken] = useState(null);
    const [user, setUser] = React.useState(null);

    const loginHandler =(token, refreshToken)=>{
        //console.log("in loginHandler");
        setUserToken(token);
        setUserRefreshToken(refreshToken)
        setUserTokenn(token)
        AsyncStorage.setItem('userToken', token);
        AsyncStorage.setItem('userRefToken', refreshToken);
    }

    const setTokens =async(token)=>{

        setUserToken(token);
        setUserTokenn(token)
        await AsyncStorage.setItem('userToken', token);
        let u=await AsyncStorage.getItem('userToken');
    }


    const logout = () =>{
        setUserToken(null);
        setUserRefreshToken(null)
        setUserTokenn(null)
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userRefToken');
    }

    const isLoggedIn= async()=>{
        try{
            let userToken =  await AsyncStorage.getItem('userToken');
            setUserToken(userToken);
        }catch(e){
 //           console.log("isLoggenIn errer", e);
        }
    }
    useEffect(()=>{
        //isLoggedIn();
   //     console.log('userToken updated:', userToken);
    },[userToken])

    return (
        <authContext.Provider value={{user, setUserToken, loginHandler,setTokens, logout, userToken, userRefreshToken, setUser}}>
            {children}
        </authContext.Provider>
    )
};
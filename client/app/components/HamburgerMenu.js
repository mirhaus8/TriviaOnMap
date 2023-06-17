import {useContext} from 'react'
import { authContext } from '../context/AuthContext';
import { Feather } from "@expo/vector-icons";

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';


export const HamburgerMenu = (props) => {
    const { logout } = useContext(authContext);
  
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Logout"
          onPress={logout}
          icon={() => (
            <Feather name="log-out" size={18} color={"red"} />
          )}
        />
      </DrawerContentScrollView>
    );
  };
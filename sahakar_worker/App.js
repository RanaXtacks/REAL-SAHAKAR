import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ActiveJobScreen from './screens/ActiveJobScreen';
import CustomerHomeScreen from './screens/CustomerHomeScreen';
import BookingScreen from './screens/BookingScreen';
import CustomerTrackingScreen from './screens/CustomerTrackingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        checkSession();
    }, []);

    async function checkSession() {
        const token = await AsyncStorage.getItem('workerToken');
        const activeMode = await AsyncStorage.getItem('activeMode');

        if (!token) {
            setInitialRoute('Login');
        } else if (activeMode === 'customer') {
            setInitialRoute('CustomerHome');
        } else {
            setInitialRoute('Home');
        }
    }

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, backgroundColor: '#07090E', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            >
                {/* Auth Stack */}
                <Stack.Screen name="Login" component={LoginScreen} />

                {/* Worker Mode Stack */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />

                {/* Customer Mode Stack */}
                <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
                <Stack.Screen name="Booking" component={BookingScreen} />
                <Stack.Screen name="CustomerTracking" component={CustomerTrackingScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

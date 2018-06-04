import React, {Component} from 'react';
import {} from 'react-native';
import Login from './src/activities/Login';
import TestsList from './src/activities/TestsList';
import TestPage from './src/activities/TestPage';
import { StackNavigator } from 'react-navigation';

export default MyProject = StackNavigator(
    {
        Login: {screen: Login, headerMode: 'screen'},
        TestsList: {screen: TestsList},
        TestPage: {screen: TestPage},
    },
    {headerMode: 'screen'},
);
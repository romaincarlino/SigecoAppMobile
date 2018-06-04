import React, {Component} from 'react';
import {
    Platform,
    ActivityIndicator,
    ScrollView,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import Colors from '../constants/Colors';
import Images from '../constants/Images';

class Login extends Component {

    static navigationOptions = {title: 'Login', header: null};

    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            isLoading: 3,
            tests: null,
            contenu_tests: null,
            points_cle: null,
        };
    }

    tryLogin() {
        fetch('https://app.sigeco.fr', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body:
            "forms[id_client_identification]=" + this.state.login + "&" +
            "forms[pass_identification]=" + this.state.password + "&" +
            "robot=1972&" +
            "tab_mobile=1",
        })
            .then((response) => response.text())
            .then((responseText) => {
                //If  android, there is an invisible character in the beginning
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) == '{') {
                        //message = error
                        this.refs.toast.show('Identifiant ou mot de passe incorrect', DURATION.LENGTH_LONG);
                        this.setState({
                            password: '',
                        })
                    }
                    else {
                        message = JSON.parse(responseText.substring(1)).message;
                        if (message == 'fail') {
                            this.refs.toast.show('Pas de tests à charger', DURATION.LENGTH_LONG);
                        } else {
                            this.loadDatas();
                            this.goToTests();
                        }

                    }
                }
                //if iOS no invisible charater
                else {
                    message = JSON.parse(responseText).message;
                    if (message == 'fail') {
                        this.refs.toast.show('Pas de tests à charger', DURATION.LENGTH_LONG);
                    } else if (message == 'error'){
                        this.refs.toast.show('Identifiant ou mot de passe incorrect', DURATION.LENGTH_LONG);
                        this.setState({
                            password: '',
                        })
                    }
                    else {
                        this.loadDatas();
                        this.goToTests();
                    }

                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

    loadDatas() {

        //100ms between each fetch to not receive error
        setTimeout(function() {this.getTests()}.bind(this),100);
        setTimeout(function() {this.getContenuTests()}.bind(this),100);
        setTimeout(function() {this.getPointCles()}.bind(this),100);

        this.setState({
            isLoading: 0
        });
    }

    //get tests (tab_mobile = 1)
    getTests() {
        fetch('https://app.sigeco.fr', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body:
            "forms[id_client_identification]=" + this.state.login + "&" +
            "forms[pass_identification]=" + this.state.password + "&" +
            "robot=1972&" +
            "tab_mobile=1",
        })
            .then((response) => response.text())
            .then((responseText) => {
                //If  android, there is an invisible character in the beginning
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) == '{') {
                        //{message : error}
                        this.getTests();
                    }
                    else {
                        responseText = responseText.substring(1);
                        json = JSON.parse(responseText);
                        this.setState({
                            isLoading: this.state.isLoading + 1,
                            tests: json.tests
                        })
                    }
                }
                //if iOS no invisible character
                else {
                    message = JSON.parse(responseText).message;
                    if (message == 'error') {
                        this.getTests();
                    } else {
                        json = JSON.parse(responseText);
                        this.setState({
                            isLoading: this.state.isLoading + 1,
                            tests: json.tests
                        })
                    }
                }

            })
            .catch((error) => {
                console.error(error);
            })
    }

    //get contenu_tests (tab_mobile = 2)
    getContenuTests() {
        fetch('https://app.sigeco.fr', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body:
            "forms[id_client_identification]=" + this.state.login + "&" +
            "forms[pass_identification]=" + this.state.password + "&" +
            "robot=1972&" +
            "tab_mobile=2",
        })
            .then((response) => response.text())
            .then((responseText) => {
                //If  android, there is an invisible character in the beginning
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) == '{') {
                        //{message : error}
                        this.getContenuTests();
                    }
                    else {
                        responseText = responseText.substring(1);
                        json = JSON.parse(responseText);
                        this.setState({
                            isLoading: this.state.isLoading + 1,
                            contenu_tests: json.contenu_tests,
                        })
                    }
                }
                //if iOS no invisible character
                else {
                    message = JSON.parse(responseText).message;
                    if (message == 'error') {
                        this.getContenuTests();
                    } else {
                        json = JSON.parse(responseText);
                        this.setState({
                            isLoading: this.state.isLoading + 1,
                            contenu_tests: json.contenu_tests,
                        })
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

    //get point cles (tab_mobile = 3)
    getPointCles() {
        fetch('https://app.sigeco.fr', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body:
            "forms[id_client_identification]=" + this.state.login + "&" +
            "forms[pass_identification]=" + this.state.password + "&" +
            "robot=1972&" +
            "tab_mobile=3",
        })
            .then((response) => response.text())
            .then((responseText) => {

                //If  android, there is an invisible character in the beginning
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) == '{') {
                        //{message : error}
                        this.getPointCles();
                    }
                    else {
                        responseText = responseText.substring(1);
                        json = JSON.parse(responseText);
                        this.setState({
                            isLoading: this.state.isLoading + 1,
                            points_cle: json.points_cle,
                        })
                    }
                }
                //if iOS no invisible character
                else {
                    message = JSON.parse(responseText).message;
                    if (message == 'error') {
                        this.getPointCles();
                    } else {
                        json = JSON.parse(responseText);

                        this.setState({
                            isLoading: this.state.isLoading + 1,
                            points_cle: json.points_cle
                        })
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

    goToTests() {
        if (this.state.isLoading < 3) {
            window.setTimeout(() => this.goToTests(), 10);
        } else {
            this.props.navigation.navigate('TestsList', {
                    tests: this.state.tests,
                    contenu_tests: this.state.contenu_tests,
                    points_cle: this.state.points_cle,
                    login: this.state.login,
                    password: this.state.password,
                }
            );
        }
    }

    render() {

        return (
            <View style={styles.container} >
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <Image
                        source={Images.logo}
                        style={styles.logo}
                    />
                    <TextInput
                        style={styles.input}
                        underlineColorAndroid='transparent'
                        placeholder="Login"
                        placeholderTextColor={Colors.gray}
                        autoCapitalize = 'none'
                        onChangeText={(login) => this.setState({login})}>
                        {this.state.login}
                    </TextInput>
                    <TextInput
                        style={styles.input}
                        underlineColorAndroid='transparent'
                        placeholder="Mot de passe"
                        placeholderTextColor={Colors.gray}
                        autoCapitalize = 'none'
                        secureTextEntry
                        onChangeText={(password) => this.setState({password})}>
                        {this.state.password}
                    </TextInput>
                    <TouchableOpacity style={styles.loginButtonContainer} onPress={this.tryLogin.bind(this)}>
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                    {this.state.isLoading < 3 ?
                        <View style={styles.isLoadingContainer}>
                            <Text style={styles.isLoadingText}> Chargement en cours</Text>
                            <ActivityIndicator color={'white'}/>
                        </View>
                        : null
                    }
                </ScrollView>
                <Toast ref="toast"/>
            </View>
        );
    }
}

const styles = {
    container: {
        backgroundColor: Colors.darkgray,
        flex: 1,
    },
    logo: {
        width: 100,
        height: 100,
        marginTop: 100,
        marginBottom: 70,
        alignSelf: 'center'
    },
    input: {
        borderRadius: 5,
        marginRight: 40,
        marginLeft: 40,
        height: 40,
        backgroundColor: 'white',
        marginBottom: 20,
        color: Colors.black,
        paddingHorizontal: 15,
    },
    loginButtonContainer: {
        borderRadius: 5,
        marginRight: 40,
        marginLeft: 40,
        justifyContent: 'center',
        backgroundColor: Colors.blue,
        paddingVertical: 7

    },
    loginButtonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 20
    },
    isLoadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    isLoadingText: {
        color: 'white',
        marginBottom: 10,
    },
}

export default Login;
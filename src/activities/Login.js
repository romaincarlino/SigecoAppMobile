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
            isLoading: false,
            tests: null,
            contenu_tests: null,
            points_cle: null,
        };
    }

    loadDatas() {
        this.setState({
            isLoading: true
        });

        //getTests(try to log) -> getContenuTest -> getPointCles
        this.getTests();

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
                //If  android, there is an invisible character in the beginning, but not if message=error
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) === '{') {
                        //{message : error}
                        this.refs.toast.show('Identifiant ou mot de passe incorrect', DURATION.LENGTH_LONG);
                        this.setState({
                            password: '',
                            isLoading: false,
                        })
                    }
                    else {
                        responseText = responseText.substring(1);
                        let json = JSON.parse(responseText);
                        if (json.message === 'fail') {
                            this.refs.toast.show('Pas de test à charger', DURATION.LENGTH_LONG);
                            this.setState({
                                isLoading: false,
                            });
                        } else {
                            this.setState({
                                tests: json.tests
                            });
                            this.getContenuTests();
                        }
                    }
                }
                //if iOS no invisible character
                else {
                    let json = JSON.parse(responseText);
                    if (json.message === 'fail') {
                        this.refs.toast.show('Pas de test à charger', DURATION.LENGTH_LONG);
                        this.setState({
                            isLoading: false,
                        });
                    } else if (json.message === 'error'){
                        this.refs.toast.show('Identifiant ou mot de passe incorrect', DURATION.LENGTH_LONG);
                        this.setState({
                            password: '',
                            isLoading: false,
                        })
                    }else {
                        this.setState({
                            tests: json.tests
                        });
                        this.getContenuTests();
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
                //If  android, there is an invisible character in the beginning, but not if message=error
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) === '{') {
                        //{message : error}
                        this.refs.toast.show('Données non chargées, veuillez recommencer', DURATION.LENGTH_LONG);
                        this.setState({
                            isLoading: false,
                        });
                    }
                    else {
                        responseText = responseText.substring(1);
                        let json = JSON.parse(responseText);
                        this.setState({
                            contenu_tests: json.contenu_tests,
                        });
                        this.getPointCles();
                    }
                }
                //if iOS no invisible character
                else {
                    let json = JSON.parse(responseText);
                    if (json.message === 'error') {
                        this.refs.toast.show('Données non chargées, veuillez recommencer', DURATION.LENGTH_LONG);
                        this.setState({
                            isLoading: false,
                        });

                    } else {
                        this.setState({
                            contenu_tests: json.contenu_tests,
                        });
                        this.getPointCles();
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

                //If  android, there is an invisible character in the beginning, but not if message=error
                if (Platform.OS === 'android') {
                    if (responseText.charAt(0) === '{') {
                        //{message : error}
                        this.refs.toast.show('Données non chargées, veuillez recommencer', DURATION.LENGTH_LONG);
                        this.setState({
                            isLoading: false,
                        });
                    }
                    else {
                        responseText = responseText.substring(1);
                        let json = JSON.parse(responseText);
                        this.setState({
                            isLoading: false,
                            points_cle: json.points_cle,
                        });
                        this.goToTestsList();
                    }
                }
                //if iOS no invisible character
                else {
                    let json = JSON.parse(responseText);
                    if (json.message === 'error') {
                        this.refs.toast.show('Données non chargées, veuillez recommencer', DURATION.LENGTH_LONG);
                        this.setState({
                            isLoading: false,
                        });
                    } else {
                        this.setState({
                            isLoading: false,
                            points_cle: json.points_cle
                        });
                        this.goToTestsList();
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

    goToTestsList() {
        this.props.navigation.navigate('TestsList', {
            tests: this.state.tests,
            contenu_tests: this.state.contenu_tests,
            points_cle: this.state.points_cle,
            login: this.state.login,
            password: this.state.password,
        });
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
                    <TouchableOpacity style={styles.loginButtonContainer} onPress={this.loadDatas.bind(this)}>
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                    {this.state.isLoading ?
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
};

export default Login;
import React, {Component} from 'react';
import {Dimensions, BackHandler, Alert, FlatList, View, TouchableOpacity, Platform} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import ListItem_TestsList from '../components/ListItem_TestsList';
import Images from '../constants/Images';
import NavBar from '../components/NavBar';


class TestsList extends Component {

    static navigationOptions = {header: null};

    params = this.props.navigation.state.params;

    constructor(props) {
        super(props);
        this.state = {
            tests: null,
            contenu_tests: null,
            points_cle: null,
            login: null,
            password: null,
        }
    }

    componentDidMount() {
        this.setState({
            tests: this.params.tests,
            contenu_tests: this.params.contenu_tests,
            points_cle: this.params.points_cle,
            login: this.params.login,
            password: this.params.password,
        })

        //block hardware back button
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        //block hardware back button
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    //refresh the flatlist after a validation
    componentDidUpdate(prevProps) {

        if (this.props.navigation !== prevProps.navigation) {
            this.setState({
                tests: this.params.tests,
                contenu_tests: this.params.contenu_tests,
                points_cle: this.params.points_cle,
                login: this.params.login,
                password: this.params.password,
            })
        }
    }

    //block hardware black button
    handleBackButton() {
        return true; //instead of default function for hardware back button
    }

    renderItem(item, index) {
        for (var i = 0; i < this.state.contenu_tests.length; i++) {
            var ct = this.state.contenu_tests[i];
            if (ct.id_test == item.id_test) {
                return (
                    <TouchableOpacity onPress={() => this.onItemClick(item, index)}>
                        <ListItem_TestsList
                            item={item}
                            contenu_test={ct}
                            validateTest={this.validateTest}
                        />
                    </TouchableOpacity>
                );

            }
        }
    }

    onItemClick(item, positionInTests) {
        if (item.fait == '1') {
            Alert.alert(
                'Ce test a été validé',
                'Voulez-vous invalider et modifier ce test?',
                [
                    {text: 'Annuler'},
                    {
                        text: 'Effacer', onPress: () => {
                            //validation

                            Alert.alert(
                                'Effacer',
                                'Etes vous certain de vouloir effacer le contenu de ce test?',
                                [
                                    {text: 'Non'},
                                    {
                                        text: 'Oui', onPress: () => {
                                            //changer le "fait" et le commentaire
                                            tests = this.state.tests;
                                            tests[positionInTests].fait = '0';
                                            tests[positionInTests].commentaire = '';
                                            this.setState({
                                                tests: tests
                                            });

                                            //on remet les points cle a zero
                                            for (i = 0; i < this.state.points_cle.length; i++) {
                                                point_cle = this.state.points_cle[i];
                                                if (point_cle.id_test == item.id_test) {
                                                    point_cle.value = null;
                                                }
                                            }
                                        }
                                    },
                                ],
                            );
                        }
                    },
                    {
                        text: 'Modifier', onPress: () => {
                            //changer le "fait"
                            tests = this.state.tests;
                            tests[positionInTests].fait = '0';
                            this.setState({
                                tests: tests
                            });

                            this.goToTestPage(item, positionInTests);
                        }
                    }
                ],
            );
        } else {
            this.goToTestPage(item, positionInTests);
        }

    }

    goToTestPage(item, positionInTests) {
        //go to TestPage

        this.props.navigation.navigate('TestPage', {
            positionInTests: positionInTests,
            item: item,
            points_cle: this.state.points_cle,
            tests: this.state.tests,
            contenu_tests: this.state.contenu_tests,
            login: this.state.login,
            password: this.state.password
        })
    }

    sendDatas(context) {
        tab5 = [];
        tab4 = [];

        //on cree les donnees a envoyer
        for (var i = 0; i < context.state.tests.length; i++) {
            test = context.state.tests[i];
            if (test.fait == '1') {
                //complete tab 5
                tab5.push({
                    id: test.id,
                    token: test.token,
                    commentaire: test.commentaire,
                    fait: test.fait
                })

                // complete tab 4
                for (var j = 0; j < context.state.points_cle.length; j++) {
                    point_cle = context.state.points_cle[j];
                    if (point_cle.id_test == test.id_test) {

                        tab4.push({
                            id: test.id,
                            token: test.token,
                            id_point_cle: point_cle.id_point_cle,
                            score: point_cle.value
                        })
                    }
                }
            }
        }

        //mise en forme des donnees
        retour4 = '{\"retour\":' + JSON.stringify(tab4) + '}';
        retour5 = '{\"retour\":' + JSON.stringify(tab5) + '}';

        //envoi des donness

        //tab5
        fetch('https://app.sigeco.fr?', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body:
            "forms[id_client_identification]=" + context.state.login + "&" +
            "forms[pass_identification]=" + context.state.password + "&" +
            "robot=1972&" +
            "tab_mobile=5&" +
            "retour=" + retour5,
        })
            .then((response) => response.text())
            .then((responseText) => {
                //If  android, there is an invisible character in the beginning
                if (Platform.OS === 'android') {
                    //if {message : error} ou fail
                    if (responseText.charAt(0) == '{') {
                        context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                    }
                    else {
                        message = JSON.parse(responseText.substring(1)).message;
                        if (message == 'ok') {
                            //tab 4
                            fetch('https://app.sigeco.fr?', {
                                method: 'POST',
                                headers: new Headers({
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                }),
                                body:
                                "forms[id_client_identification]=" + context.state.login + "&" +
                                "forms[pass_identification]=" + context.state.password + "&" +
                                "robot=1972&" +
                                "tab_mobile=4&" +
                                "retour=" + retour4,
                            })
                                .then((response) => response.text())
                                .then((responseText) => {
                                    //if {message : error} ou fail
                                    if (responseText.charAt(0) == '{') {
                                        context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                                    }
                                    else {
                                        message = JSON.parse(responseText.substring(1)).message;
                                        if (message == 'ok') {
                                            context.refs.toast.show('Données synchronisées', DURATION.LENGTH_LONG);

                                            //on supprime les test validés
                                            tests = context.state.tests;
                                            for (var i = 0; i < tests.length; i++) {
                                                test = tests[i];
                                                if (test.fait == '1') {
                                                    tests.splice(i, 1);
                                                    i = i - 1;
                                                }
                                            }
                                            context.setState({
                                                tests: tests
                                            })
                                        }
                                        else {
                                            this.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                                        }
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                })
                        }
                        else {
                            context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                        }
                    }
                }
                //if iOS no invisible charater
                else {
                    message = JSON.parse(responseText).message;
                    if (message == 'error') {
                        context.refs.toast.show('Echec de la synchronisation1', DURATION.LENGTH_LONG);
                    }
                    else {
                            //tab 4
                            fetch('https://app.sigeco.fr?', {
                                method: 'POST',
                                headers: new Headers({
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                }),
                                body:
                                "forms[id_client_identification]=" + context.state.login + "&" +
                                "forms[pass_identification]=" + context.state.password + "&" +
                                "robot=1972&" +
                                "tab_mobile=4&" +
                                "retour=" + retour4,
                            })
                                .then((response) => response.text())
                                .then((responseText) => {
                                    message = JSON.parse(responseText).message;
                                    if (message == 'error') {
                                        context.refs.toast.show('Echec de la synchronisation2', DURATION.LENGTH_LONG);
                                    }
                                    else {
                                            context.refs.toast.show('Données synchronisées', DURATION.LENGTH_LONG);

                                            //on supprime les test validés
                                            tests = context.state.tests;
                                            for (var i = 0; i < tests.length; i++) {
                                                test = tests[i];
                                                if (test.fait == '1') {
                                                    tests.splice(i, 1);
                                                    i = i - 1;
                                                }
                                            }
                                            context.setState({
                                                tests: tests
                                            })
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                })
                        }
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

    back(context) {
        Alert.alert(
            'Déconnexion',
            'Voulez vous vraiment vous déconnecter? Toute sauvegarde non synchronisée sera perdue ',
            [
                {text: 'Oui', onPress: () => context.props.navigation.navigate("Login")},
                {text: 'Non'},
            ],
        );
    }

    render() {
        return (
            <View>
                <NavBar
                    title={'Choisir un Test'}
                    imageFunction={this.sendDatas}
                    context={this}
                    image={Images.cloud}
                    backFunction={this.back}
                />
                <View style={styles.list}>
                    <FlatList
                        extraData={this.state} //refresh the flatlist after a validation
                        data={this.state.tests}
                        renderItem={({item, index}) => this.renderItem(item, index)}
                        keyExtractor={item => item.id}
                    />
                </View>
                <Toast ref="toast"/>
            </View>
        );
    }
}

let { height } = Dimensions.get("window");

const styles = {
    list: {
        height: height - 70
    }
};

export default TestsList;


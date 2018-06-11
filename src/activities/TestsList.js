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
        });

        //block hardware back button
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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
        for (let i = 0; i < this.state.contenu_tests.length; i++) {
            let ct = this.state.contenu_tests[i];
            if (ct.id_test === item.id_test) {
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
        if (item.fait === '1') {
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
                                            //change  "fait" and the commentary
                                            tests = this.state.tests;
                                            tests[positionInTests].fait = '0';
                                            tests[positionInTests].commentaire = '';
                                            this.setState({
                                                tests: tests
                                            });

                                            //initiate again points cle
                                            for (i = 0; i < this.state.points_cle.length; i++) {
                                                point_cle = this.state.points_cle[i];
                                                if (point_cle.id_test === item.id_test) {
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

        //create datas to send
        for (let i = 0; i < context.state.tests.length; i++) {
            let test = context.state.tests[i];
            if (test.fait === '1') {
                //complete tab 5
                tab5.push({
                    id: test.id,
                    token: test.token,
                    commentaire: test.commentaire,
                    fait: test.fait
                });

                //complete tab 4
                for (let j = 0; j < context.state.points_cle.length; j++) {
                    let point_cle = context.state.points_cle[j];
                    if (point_cle.id_test === test.id_test) {

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

        //put datas in the good format
        retour4 = '{\"retour\":' + JSON.stringify(tab4) + '}';
        retour5 = '{\"retour\":' + JSON.stringify(tab5) + '}';

        //send datas

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
                    //if {message : error} or {message : fail}
                    if (responseText.charAt(0) === '{') {
                        context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                    }
                    else {
                        let message = JSON.parse(responseText.substring(1)).message;
                        if (message === 'ok') {
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
                                    //if {message : error} or {message : fail}
                                    if (responseText.charAt(0) === '{') {
                                        context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                                    }
                                    else {
                                        message = JSON.parse(responseText.substring(1)).message;
                                        if (message === 'ok') {
                                            context.refs.toast.show('Données synchronisées', DURATION.LENGTH_LONG);

                                            //delete validated tests in the list
                                            let tests = context.state.tests;
                                            for (let i = 0; i < tests.length; i++) {
                                                let test = tests[i];
                                                if (test.fait === '1') {
                                                    tests.splice(i, 1);
                                                    i = i - 1;
                                                }
                                            }
                                            context.setState({
                                                tests: tests
                                            })
                                        }
                                        else {
                                            //{message : fail}
                                            this.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                                        }
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                })
                        }
                        else {
                            //{message : fail}
                            context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                        }
                    }
                }
                //if iOS no invisible character
                else {
                    let message = JSON.parse(responseText).message;

                    if(message === 'ok'){
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
                                    if (message === 'ok') {
                                        context.refs.toast.show('Données synchronisées', DURATION.LENGTH_LONG);

                                        //delete validated tests of the list
                                        let tests = context.state.tests;
                                        for (let i = 0; i < tests.length; i++) {
                                            let test = tests[i];
                                            if (test.fait === '1') {
                                                tests.splice(i, 1);
                                                i = i - 1;
                                            }
                                        }
                                        context.setState({
                                            tests: tests
                                        })
                                    }
                                    else{
                                        //if {message : error} or {message : fail}
                                        context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                })
                        }
                        else {
                        //if {message : error} or {message : fail}
                        context.refs.toast.show('Echec de la synchronisation', DURATION.LENGTH_LONG);
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
            'Voulez-vous vraiment vous déconnecter? Toute sauvegarde non synchronisée sera perdue ',
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

//flatlist will not touch the bottom of the window
let { height } = Dimensions.get("window");

const styles = {
    list: {
        height: height - 70
    }
};

export default TestsList;


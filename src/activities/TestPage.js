import React, {Component} from 'react';
import {
    BackHandler,
    ScrollView,
    FlatList,
    TextInput,
    Text,
    View,
} from 'react-native';
import Colors from '../constants/Colors';
import Images from '../constants/Images';
import ListItem_TestPage from '../components/ListItem_TestPage';
import NavBar from '../components/NavBar';
import Toast, {DURATION} from 'react-native-easy-toast'

class TestPage extends Component {

    params = this.props.navigation.state.params;
    positionsInPointsCle = [];

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            commentaire: null,
            tests: null,
            contenu_tests: null,
            points_cle: null,
            points_cle_test: null,
            login: null,
            password: null,
        }
    }

    componentDidMount() {
        //Separate points cle from the tests than the other
        points_cle_test = [];

        for (var i = 0; i < this.params.points_cle.length; i++) {
            point_cle = this.params.points_cle[i];
            if (point_cle.id_test == this.params.item.id_test) {
                //add to the list of point_cle we will see
                points_cle_test.push(point_cle);
                //get the position of the point_cle in the total list
                point_cle['positionInPointsCle'] = i;
                this.positionsInPointsCle.push(i);
            }
        }

        //get commentaire

        if (this.params.tests[this.params.positionInTests].commentaire == undefined) {
            this.params.tests[this.params.positionInTests]['commentaire'] = '';
        }

        this.setState({
            commentaire: this.params.tests[this.params.positionInTests].commentaire,
            tests: this.params.tests,
            contenu_tests: this.params.contenu_tests,
            points_cle: this.params.points_cle,
            points_cle_test: points_cle_test,
            login: this.params.login,
            password: this.params.password
        })
        //block hardware back button
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        //block hardware back button
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    //block hardware black button
    handleBackButton() {
        return true; //instead of default function for hardware back button
    }

    renderItem(item, index) {
        return (
            <ListItem_TestPage
                item={item}
                changeValueItem={this.changeValueItem}
                context={this}
            />
        );
    }

    changeValueItem(value, positionInPointsCle, context) {
        //on change la case "value" du tableau 3 (case rajoutée)
        context.state.points_cle[positionInPointsCle]['value'] = value;
    }

    backToTestsList(context) {

        //charger les nouvelles donnees
        context.state.tests[context.params.positionInTests].commentaire = context.state.commentaire;

        context.props.navigation.navigate("TestsList", {
            points_cle: context.state.points_cle,
            tests: context.state.tests,
            contenu_tests: context.state.contenu_tests,
            login: context.state.login,
            password: context.state.password
        });
    }

    validateTest(context) {
        validate = true;

        for (var i = 0; i < context.positionsInPointsCle.length; i++) {
            pos = context.positionsInPointsCle[i];
            if (context.state.points_cle[pos].value == undefined ) {
                validate = false;
            }
        }

        if (validate) {
            //changer le "fait"
            context.state.tests[context.params.positionInTests].fait = '1';

            //changer de page et envoyer donnees modifiees
            context.backToTestsList(context);
        } else {
            context.refs.toast.show('Tous les points clés ne sont pas remplis', DURATION.LENGTH_LONG);

        }
    }

    render() {
        return (
            <View>
                <NavBar
                    title={this.params.item.Nom_prenom + " - " + this.params.item.Titre_du_test}
                    imageFunction={this.validateTest}
                    image={Images.doneWhite}
                    context={this}
                    backFunction={this.backToTestsList}/>
                <ScrollView>
                    <View style={styles.titleView}>
                        <Text style={styles.point}>Point</Text>
                        <Text style={styles.expectedResult}>Résultat attendu</Text>
                        <Text style={styles.validate}>Atteint</Text>
                    </View>
                    <FlatList
                        data={this.state.points_cle_test}
                        renderItem={({item, index}) => this.renderItem(item, index)}
                        keyExtractor={item => item.id_point_cle}
                    />
                    <Text style={styles.comment}>Commentaires</Text>
                    <TextInput
                        underlineColorAndroid='transparent'
                        multiline={true}
                        style={styles.input}
                        onChangeText={(commentaire) => {
                            this.setState({commentaire})
                        }}>
                        {this.state.commentaire}
                    </TextInput>
                </ScrollView>
                <Toast ref="toast"/>
            </View>
        );
    }
}

const styles = {
    titleView: {
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        borderBottomColor: Colors.gray,
        borderBottomWidth: 1,
    },
    point: {
        flex: 3,
        color: Colors.black,
        fontWeight: 'bold'
    },
    expectedResult: {
        flex: 6,
        marginLeft: 10,
        color: Colors.black,
        fontWeight: 'bold'
    },
    validate: {
        flex: 3,
        color: Colors.black,
        fontWeight: 'bold'
    },
    comment: {
        color: Colors.black,
        fontWeight: 'bold',
        margin: 10,
    },
    input: {
        marginRight: 10,
        marginLeft: 10,
        backgroundColor: 'white',
        height: 100,
        marginBottom: 100,
        textAlignVertical: 'top',
    }


};

export default TestPage;
import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import MenuButtonBack from "./../../components/MenuButtonBack/MenuButtonBack";
import { Container } from "native-base";

// const { width: WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  allCont: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ededed"
  },
  text: {
    fontSize: 30
  }
});

class HomeNewIncome extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container>
        <MenuButtonBack navigation={this.props.navigation} />
        <View style={styles.allCont}>
          <Text style={styles.text}>Receita</Text>
        </View>
      </Container>
    );
  }
}

export default HomeNewIncome;

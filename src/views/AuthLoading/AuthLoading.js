import React, { Component } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import { FA } from "../../Firebase";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

class AuthLoading extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    FA.onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? "Home" : "Auth");
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }
}

export default AuthLoading;

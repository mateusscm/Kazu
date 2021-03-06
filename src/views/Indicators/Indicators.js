import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import MenuButton from "./../../components/MenuButton/MenuButton";
import { Container, Button, Text, Spinner } from "native-base";
import { theme } from "../../config/_theme";
import ChartHeader from "../../components/ChartHeader/ChartHeader";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import PureChart from "react-native-pure-chart";
import { FFS, FA } from "../../Firebase";
import Reactotron from "reactotron-react-native";
import palette from "google-palette";

// const { width: WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  allCont: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: theme.palette.backgroundMain
  },
  text: {
    fontSize: 30,
    color: theme.palette.txtPrimary
  },
  mainTitle: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 5,
    fontWeight: "700",
    color: "#6e6e6e"
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.backgroundMain
  }
});
const Indicators = props => {
  const [data_final, setData_final] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0]
  );
  const [data_, setData_] = useState(new Date().toISOString().split("T")[0]);
  const [data_inicial, setData_inicial] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [dataPie, setDataPie] = useState([]);
  const [dataPie2, setDataPie2] = useState([]);
  const [dataLine, setDataLine] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [trigger1, setTrigger1] = useState(false);
  const [loading, setLoading] = React.useState(false);

  // const [chart, setChart] = useState(null);
  // const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setTrigger(true);
  }, []);

  const getC = async () => {
    function year(date) {
      return (
        Math.ceil(new Date(date).getTime() / 86400000) -
        Math.floor(
          new Date().setFullYear(new Date().getFullYear(), 0, 1) / 86400000
        )
      );
    }
    const user = FA.currentUser;
    let kpinfo = {};
    let movimentacoes = [];
    const ref = await FFS.collection("user_movimentacao")
      .doc(user.uid)
      .collection("movimentacoes")
      .get();
    if (!ref.empty) {
      ref.forEach(doc => {
        movimentacoes.push(doc.data());
      });
    }

    for (let i = 0; i < movimentacoes.length; i++) {
      try {
        const obj = movimentacoes[i];
        let graphs = ["Categoria", "Conta", "Tipo"];
        // eslint-disable-next-line
        graphs.forEach(g => {
          if (kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]]) {
            if (
              kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]][
                obj[g.toLowerCase()]
              ]
            ) {
              kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]][
                obj[g.toLowerCase()]
              ].forEach((item, index) => {
                if (index === 0 || index < year(obj.data)) {
                  return;
                }
                kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]][
                  obj[g.toLowerCase()]
                ][index] += parseFloat(obj.balance);
              });
            } else {
              kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]][
                obj[g.toLowerCase()]
              ] = Array(366)
                .fill(0, 0, year(obj.data))
                .fill(parseFloat(obj.balance), year(obj.data));
            }
          } else {
            kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]] = {};
            kpinfo[g.toLowerCase() + "_" + obj.data.split("-")[0]][
              obj[g.toLowerCase()]
            ] = Array(366)
              .fill(0, 0, year(obj.data))
              .fill(parseFloat(obj.balance), year(obj.data));
          }
        });
      } catch (err) {
        console.log("Err");
      }
    }
    const docRef = await FFS.collection("user_kpi")
      .doc(user.uid)
      .collection("kpis");
    Object.keys(kpinfo).forEach(async kpi => {
      await docRef.doc(kpi).set(kpinfo[kpi]);
    });
    console.log("Graficos gerados");
    setTrigger(!trigger);
  };

  React.useEffect(() => {
    async function getGraph() {
      setLoading(true);
      let graph = {
        pie: [],
        pie2: []
      };
      let testeLine = [];
      let line = {
        labels: [],
        datasets: [
          {
            data: []
          }
        ]
      };

      const user = await FA.currentUser;
      const ref = await FFS.collection("user_kpi")
        .doc(user.uid)
        .collection("kpis")
        .get();

      let kpinfo = {};

      let count_categoria = {};
      let count_tipo = {};

      // let count_conta = {};
      // let count_classe = {};

      const getPercento = info => {
        let tmp = info.map(i => i.population);
        let tot = tmp.reduce((t, i) => {
          return t + i;
        });
        Reactotron.log(tot);
        return info.map(i => {
          return (i.population * 100) / tot;
        });
      };
      const getNumber = info => {
        const idx_ini =
          Math.ceil(new Date(data_inicial).getTime() / 86400000) -
          Math.floor(
            new Date().setFullYear(new Date().getFullYear(), 0, 1) / 86400000
          );
        const idx_final =
          Math.ceil(new Date(data_final).getTime() / 86400000) -
          Math.floor(
            new Date().setFullYear(new Date().getFullYear(), 0, 1) / 86400000
          );
        Reactotron.log(JSON.stringify(info[idx_final]));
        Reactotron.log(
          JSON.stringify(info[idx_ini - 1 === -1 ? 0 : idx_ini - 1])
        );

        return info[idx_final] - info[idx_ini - 1 === -1 ? 0 : idx_ini - 1];
      };

      const idxToDate = idx => {
        return new Date(
          Math.ceil(
            idx +
              Math.floor(
                new Date().setFullYear(new Date().getFullYear(), 0, 1) /
                  86400000
              )
          ) * 86400000
        )
          .toISOString()
          .split("T")[0];
      };

      if (!ref.empty) {
        ref.forEach(doc => {
          kpinfo = { ...kpinfo, [doc.id]: doc.data() };
        });
        Object.keys(kpinfo).forEach(kpi => {
          if (
            kpi.split("_")[0] === "categoria" &&
            (kpi.split("_")[1] === data_inicial.split("-")[0] ||
              kpi.split("_")[1] === data_final.split("-")[0])
          ) {
            Object.keys(kpinfo[kpi]).forEach(k => {
              count_categoria = {
                ...count_categoria,
                [k]: getNumber(kpinfo[kpi][k])
              };
            });
          } else if (
            kpi.split("_")[0] === "tipo" &&
            (kpi.split("_")[1] === data_inicial.split("-")[0] ||
              kpi.split("_")[1] === data_final.split("-")[0])
          ) {
            Object.keys(kpinfo[kpi]).forEach(k => {
              count_tipo = {
                ...count_tipo,
                [k]: getNumber(kpinfo[kpi][k])
              };
            });
          }
          if (
            kpi.split("_")[0] === "tipo" &&
            (kpi.split("_")[1] === data_inicial.split("-")[0] ||
              kpi.split("_")[1] === data_final.split("-")[0])
          ) {
            const idx =
              Math.ceil(new Date(data_).getTime() / 86400000) -
              Math.floor(
                new Date().setFullYear(new Date().getFullYear(), 0, 1) /
                  86400000
              ) +
              1;

            for (let i = idx - 3; i <= idx; i++) {
              line.labels.push(idxToDate(i));
            }

            function ret(_kpinfo, _kpi, a, i) {
              if (_kpinfo && _kpi && _kpinfo[_kpi] && _kpinfo[_kpi][a] && i) {
                return _kpinfo[_kpi][a][i] - _kpinfo[_kpi][a][i - 1];
              }
              return 0;
            }

            let temp = [];
            kpinfo[kpi].receita.forEach((info, i) => {
              if (i >= idx - 3 && i <= idx) {
                testeLine.push({
                  x: idxToDate(i),
                  y:
                    ret(kpinfo, kpi, "receita", i) +
                    ret(kpinfo, kpi, "despesa", i)
                });
                temp.push(
                  ret(kpinfo, kpi, "receita", i) +
                    ret(kpinfo, kpi, "despesa", i)
                );
              }
            });
            line.datasets[0].data = temp;
          }
        });
        Object.keys(count_categoria).forEach((a, i) => {
          graph.pie.push({
            label: a,
            value: count_categoria[a],
            color: "#" + palette("tol-dv", 15)[i]
            // legendFontColor: "#7F7F7F",
            // legendFontSize: 15
          });
        });
        Object.keys(count_tipo).forEach((a, i) => {
          graph.pie2.push({
            label: a,
            value: count_tipo[a],
            color: "#" + palette("tol-dv", 15)[i]
            // legendFontColor: "#7F7F7F",
            // legendFontSize: 15
          });
        });
      }

      setDataLine(testeLine);
      setDataPie2(graph.pie2);
      setDataPie(graph.pie);
      setLoading(false);
    }
    getGraph();
    // eslint-disable-next-line
  }, [data_inicial, data_final, trigger]);

  const screenWidth = Dimensions.get("window").width - 20;

  const dataStack = [
    {
      month: new Date(2015, 0, 1),
      apples: 3840,
      bananas: 1920,
      cherries: 960,
      dates: 400,
      oranges: 400
    },
    {
      month: new Date(2015, 1, 1),
      apples: 1600,
      bananas: 1440,
      cherries: 960,
      dates: 400
    },
    {
      month: new Date(2015, 2, 1),
      apples: 640,
      bananas: 960,
      cherries: 3640,
      dates: 400
    },
    {
      month: new Date(2015, 3, 1),
      apples: 3320,
      bananas: 480,
      cherries: 640,
      dates: 400
    }
  ];

  const colors = ["#7b4173", "#a55194", "#ce6dbd", "#de9ed6"];
  const keys = ["apples", "bananas", "cherries", "dates"];

  return (
    <Container>
      <MenuButton view="Indicadores" navigation={props.navigation} />
      {!loading ? (
        <>
          <ScrollView style={styles.allCont}>
            {/* <ChartHeader /> */}
            <Text style={styles.mainTitle}>DESPESA E RECEITA TOTAIS</Text>
            {dataPie2.length > 0 ? (
              <View
                style={{
                  width: screenWidth,
                  backgroundColor: "white",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 15
                }}
              >
                <PureChart
                  width={"100%"}
                  height={220}
                  data={dataPie2}
                  type="pie"
                />
              </View>
            ) : null}
            <Text style={styles.mainTitle}>GASTOS POR CATEGORIA</Text>
            {dataPie.length > 0 ? (
              <View
                style={{
                  width: screenWidth,
                  backgroundColor: "white",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 15
                }}
              >
                <PureChart
                  width={"100%"}
                  height={220}
                  data={dataPie}
                  type="pie"
                />
              </View>
            ) : null}
            <Text style={styles.mainTitle}>
              MOVIMENTAÇÕES DOS ÚLTIMOS 4 DIAS
            </Text>
            {dataLine.length > 0 ? (
              <View
                style={{
                  width: screenWidth,
                  backgroundColor: "white",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 15
                }}
              >
                <PureChart
                  width={"100%"}
                  height={220}
                  data={dataLine}
                  type="line"
                />
              </View>
            ) : null}

            {/* <PieChart
              data={dataPie2}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#1E2923",
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: "#08130D",
                backgroundGradientToOpacity: 0.5,
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                strokeWidth: 3, // optional, default 3
                barPercentage: 0.5
              }}
              accessor="population"
              backgroundColor="#fff"
              absolute={true}
              style={{
                marginVertical: 4,
                borderRadius: 16
              }}
            />
            <PieChart
              data={dataPie}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#1E2923",
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: "#08130D",
                backgroundGradientToOpacity: 0.5,
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                strokeWidth: 3, // optional, default 3
                barPercentage: 0.5
              }}
              accessor="population"
              backgroundColor="#fff"
              absolute={true}
              style={{
                marginVertical: 4,
                borderRadius: 16
              }}
            /> */}
            {/* {dataLine < 2 ? null : (
              <BarChart
                data={dataLine}
                width={screenWidth}
                height={220}
                chartConfig={{
                  // backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#d3d3d3",
                  // decimalPlaces: 2, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                style={{
                  marginVertical: 4,
                  borderRadius: 16
                }}
              />
            )} */}
          </ScrollView>
        </>
      ) : (
        <Spinner style={styles.spinner} color="green" />
      )}
      <Button
        style={{
          height: 54,
          width: 54,
          backgroundColor: theme.palette.button,
          borderRadius: 27,
          position: "absolute",
          bottom: 25,
          right: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 12
          },
          shadowOpacity: 0.58,
          shadowRadius: 16.0,

          elevation: 24
        }}
        onPress={getC}
      >
        <Icon name="reload" size={24} color="#FFF" />
      </Button>
    </Container>
  );
};

export default Indicators;

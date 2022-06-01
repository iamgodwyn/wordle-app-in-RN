import { View, Text, SafeAreaView, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import React, {useState, useEffect} from 'react'
import { colors, CLEAR, ENTER, colorsToEmoji } from './src/constants';
import Keyboard from './src/components/Keyboard'
import Clipboard from '@react-native-clipboard/clipboard';

const App = () => {
  const word  = "hello";
  const letters = word.split('');
  const number_of_tries = 6;
  const [rows,setRows] = useState(new Array(number_of_tries).fill(new Array(letters.length).fill("")));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [gameState, setGameState] = useState('playing');

  useEffect(()=> {
    if(currentRow > 0){
      checkGameState();
    }
  },[currentRow])


  const checkGameState = () => {
    if(checkIfWon()){
      Alert.alert("Huraaay", "You won!", [
        {
          text: "Share",
          onPress: shareScore
        }
      ]);
      setGameState("won");
    }else if(checkIfLost()){
      Alert.alert("Meh", "Try again tomorrow");
      setGameState("lost");
    }
  }

  const checkIfWon = () => {
    const row = rows[currentRow - 1];
    return row.every((letter, i) => letter === letters[i]); 
  }

  const checkIfLost = () => {
    return currentRow === rows.length
  }

  const copyArray = arr => {
    return [...arr.map((rows) => [...rows])];
  };
  
  const onKeyPressed = key => {
    if(gameState !== 'playing'){
      return;
    }
    
    const updatedRows = copyArray(rows);
    if(key === CLEAR){
      const prevCol = currentColumn-1;
      if(prevCol >= 0){
        updatedRows[currentRow][prevCol] = "";
        setRows(updatedRows);
        setCurrentColumn(prevCol);
      }
      return;
    }

    if(key === ENTER){
      if(currentColumn === rows[0].length){
        setCurrentRow(currentRow+1);
        setCurrentColumn(0);
      }
      return;
    }

    if(currentColumn < rows[0].length){
      updatedRows[currentRow][currentColumn] = key;
      setRows(updatedRows);
      setCurrentColumn(currentColumn+1)
    }
  }

  const isCellActive = (row, col) => {
    return currentRow === row && currentColumn === col;
  }

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col]
    if(row >= currentRow){
      return colors.black;
    }
    if(letter === letters[col]){
      return colors.primary;
    }
    if(letters.includes(letter)){
      return colors.secondary;
    }else{
      return colors.darkgrey;
    }
  }

  const getAllLettersWithColors = color => {
    return rows.flatMap((row, i) => 
    row.filter((letter, j) => getCellBGColor(i,j) === color)
  );
  }

  const greenCaps = getAllLettersWithColors(colors.primary);
  const yellowCaps = getAllLettersWithColors(colors.secondary);
  const blackCaps = getAllLettersWithColors(colors.darkgrey);

  const shareScore = () => {
    console.log(rows);
    const textShare = rows.map((r, i) => rows.slice(0,5).map((cell, j) => colorsToEmoji[getCellBGColor(i, j)]).join(""))
    .filter(row => row)
    .join("\n");
    Clipboard.setString(textShare);
    Alert.alert("Score copied", "Share your score on social media");
  }



  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar style="light"/>

      <View style={styles.container}>
        <Text style={styles.title}>Wordle</Text>
        <ScrollView style={styles.map}>
          {
            rows.map((row, r) => (
              <View key={r} style={styles.row}>
                {
                  row.map((l, col)=> (
                    <View key={col} style={[
                      styles.cell, 
                      {
                        borderColor: isCellActive(r, col) ? colors.grey : colors.darkgrey,
                        backgroundColor: getCellBGColor(r, col)
                      }
                      ]}>
                      <Text style={styles.cellText}>{l.toUpperCase()}</Text>
                    </View>
                  ))
                }
                </View>
            ))
          }
        </ScrollView>
        <Keyboard onKeyPressed={onKeyPressed} greenCaps={greenCaps} yellowCaps={yellowCaps} greyCaps={blackCaps} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7
  },
  map:{
    marginVertical: 20,
    alignSelf: "stretch"
  },
  row:{
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center"
  },
  cell:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderWidth: 3,
    margin: 3,
    maxWidth: 60,
    borderColor: colors.darkgrey
  },
  cellText:{
    color: colors.lightgrey,
    fontWeight: "bold",
    fontSize: 28
  }
});

export default App
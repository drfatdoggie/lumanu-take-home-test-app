import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ButtonProps, View } from 'react-native';

interface StyleProps {
  backgroundColor?: string;
  textColor?: string;
}

type Props = ButtonProps & StyleProps


const Button: React.FC<Props> = ({
  title,
  textColor,
  backgroundColor,
  ...rest}) => {

  return (
    <TouchableOpacity style={styles.touchableOpacity} {...rest}>
      <View style={styles.textContainer}>
        <Text>{title}</Text>
      </View>
    </TouchableOpacity>
  )

}

const styles = StyleSheet.create({
  textContainer: {
    height: '50%',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  touchableOpacity: {
    width: '100%',
    height: 50,
    backgroundColor: '#CCCCFF',
    borderRadius: 20,
    justifyContent: 'center'
  }
});

export default Button;
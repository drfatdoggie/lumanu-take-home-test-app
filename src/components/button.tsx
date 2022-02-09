import React from 'react';
import { ButtonProps } from 'react-native';
import styled from 'styled-components/native';

interface ContainerProps {
  backgroundColor?: string;
  fill: boolean;
}

interface TextProps {
  fontColor?: string;
  fontSize?: number;
  fontWeight?: string
}

type Props = ButtonProps & ContainerProps & TextProps

const ButtonContainer = styled.TouchableOpacity<ContainerProps>`
  width: 100%;
  background-color: ${({backgroundColor, fill}) =>
    fill ? backgroundColor : 'transparent'};
  borderRadius: 18px;
  height: 48px;
  justify-content: center;
  align-items: center;
  margin: 5px;
`

const TextContainer = styled.View`
  height: 50%;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
`

const ButtonText = styled.Text<TextProps>`
  color: ${({fontColor}) => fontColor ? fontColor : '#000000'};
  font-size: ${({fontSize}) => fontSize ? `${fontSize}px` : '16px'}
  font-weight: ${({fontWeight}) => fontWeight ? fontWeight : 'bold'}
`


const Button: React.FC<Props> = ({
  title,
  fontColor,
  fontSize,
  fontWeight,
  backgroundColor,
  fill,
  ...rest}) => {

  return (
    <ButtonContainer {...rest} fill={fill} backgroundColor={backgroundColor}>
      <TextContainer>
        <ButtonText fontColor={fontColor} fontSize={fontSize} fontWeight={fontWeight}> {title} </ButtonText>
      </TextContainer>
    </ButtonContainer>
  )

}

export default Button;
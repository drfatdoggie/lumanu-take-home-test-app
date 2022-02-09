import React, { useState, useCallback } from 'react';
import { View, Text, Linking, ScrollView, Alert} from 'react-native';
import styled from 'styled-components/native';
import Button from './button';
import ToggleSeen from './toggleSeen';
import {Repo} from '../api/githubAPI';

interface CardProps {
  toggleSeen: (repoName: string) => void;
  handleRemoveRepo: (repoName: string) => void;
  handleUpdateRepoSeen: (repoName: string) => void;
}

interface StyleProps {
  markedSeen: boolean;
  newRelease: boolean;
}

type Props = Repo & CardProps

//KNOWN BUG: Color does not change from transparent when there is a new release or the release is marked as seen
const CardContainer = styled.View<StyleProps>`
  background-color = ${({markedSeen, newRelease}) => {
    if(markedSeen && newRelease) {
      return '#ADE292'
    }
    if(!markedSeen) {
      return '#A16AE8'
    }
    return 'transparent'
  }};
  border: 1px solid black;
  width: 100%;
  margin: 5px;
`

const RepoCard: React.FC<Props> = ({
  markedSeen,
  newRelease,
  name,
  url,
  latestReleaseDate,
  latestReleaseVersion,
  releaseNotes,
  handleUpdateRepoSeen,
  handleRemoveRepo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toggleEnabled, updateToggleEnabled] = useState(false);

  const releaseDate = new Date(latestReleaseDate).toLocaleDateString('en-US');

  const handleExpandPress = () => {
    setIsExpanded(isExpanded => !isExpanded)
  }

  const handleToggle = () => {
    updateToggleEnabled(toggleEnabled => !toggleEnabled)
    handleUpdateRepoSeen(name)
  }

  const handleGitHubLinkPress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Uhoh, Dr. WatchDoggie can't find a supported browser on your device for this url: ${url}`);
    }
  }, [url]);

  return(
    <CardContainer markedSeen={markedSeen} newRelease={newRelease}>
      <View>
        <Text>{name}</Text>
        <Text>{releaseDate}</Text>
        <Text>{latestReleaseVersion}</Text>
        <Button title={isExpanded ? '⬆️' : '⬇️'} onPress={handleExpandPress} fill={false} fontSize={24} fontWeight='bold'/>
      </View>

      {isExpanded && (
          <ScrollView>
            <Text>{releaseNotes}</Text>
            <Button title='Go to GitHub' onPress={handleGitHubLinkPress} fill={true} backgroundColor='#CCCCFF'/>
            <Button title='Remove Repo from List' onPress={() => {handleRemoveRepo(name)}} fill={true} backgroundColor='#CCCCFF'/>
            <Text>Mark as seen</Text>
            <ToggleSeen isEnabled={toggleEnabled} toggleSwitch={handleToggle}/>
          </ScrollView>
      )}

    </CardContainer>
  )
}

export default RepoCard;

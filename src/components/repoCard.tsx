import React, { useState, useCallback } from 'react';
import { View, Text, Linking, ScrollView, Alert, StyleSheet} from 'react-native';
import Button from './button';
import ToggleSeen from './toggleSeen';
import {Repo} from '../api/githubAPI';

interface CardProps {
  toggleSeen: (repoName: string) => void
  handleRemoveRepo: (repoName: string) => void
  handleUpdateRepoSeen: (repoName: string) => void
}

type Props = Repo & CardProps;

const RepoCard: React.FC<Props> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toggleEnabled, updateToggleEnabled] = useState(false)

  const handleExpandPress = () => {
    setIsExpanded(isExpanded => !isExpanded)
  }

  const handleToggle = () => {
    updateToggleEnabled(toggleEnabled => !toggleEnabled)
    props.handleUpdateRepoSeen(props.name)
  }

  const handleGitHubLinkPress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(props.url);

    if (supported) {
      await Linking.openURL(props.url);
    } else {
      Alert.alert(`Uhoh, Dr. WatchDoggie can't find a supported browser on your device for this url: ${props.url}`);
    }
  }, [props.url]);

  return(
    <View style={
      (props.markedSeen && !props.newRelease && styles.seen) || 
      (props.markedSeen && props.newRelease && styles.newRelease) ||
      (!props.markedSeen && styles.unseen)
      }>
      <View>
        <Text>{props.name}</Text>
        <Text>{props.latestReleaseDate}</Text>
        <Text>{props.latestReleaseVersion}</Text>
        <Button title='Read More' onPress={handleExpandPress}/>
      </View>

      {isExpanded && (
          <ScrollView>
            <Text>{props.releaseNotes}</Text>
            <Button title='Go to GitHub' onPress={handleGitHubLinkPress}/>
            <Button title='Remove Repo from List' onPress={() => {props.handleRemoveRepo(props.name)}}/>
            <Text>Mark as seen</Text>
            <ToggleSeen isEnabled={toggleEnabled} toggleSwitch={handleToggle}/>
          </ScrollView>
      )}

    </View>
  )
}

export default RepoCard;

const styles = StyleSheet.create({
  seen: {
    backgroundColor: '#A16AE8'
  },
  unseen: {
    backgroundColor: '#FEC437'
  },
  newRelease: {
    backgroundColor: '#ADE292',
  }
})

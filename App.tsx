import { useEffect, useState } from 'react';
import { View, TextInput, ScrollView, FlatList, Alert } from 'react-native';
import styled from 'styled-components/native';
import { getNewRepoForStorage, Repo, getUpdatedRepos } from './src/api/githubAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from './src/components/button';
import RepoCard from './src/components/repoCard';

const AppContainter = styled.SafeAreaView`
  flex: 1;
  background-color: #F6D4D2;
  align-items: center;
  width: 100%
`

const HeaderText = styled.Text`
  font-family: Arial;
  font-size: 30;
  font-weight: bold;
`

const AddRepoContainer = styled.View`
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: center;
`

const ButtonContainer = styled.View`
  width: 30%;
`

const FlatListContainer = styled.View`
  width: 95%;
  margin: 3px;

`

export default function App() {
  const [text, onChangeText] = useState('');
  const [repoList, updateRepoList]= useState<Repo[]>([]);

  //Async Storage Management

  ///retrieve any stored repos and add them to state
  ///KNOWN BUG: aync storage does not work properly on web!
  const retrieveStoredRepos = async () => {
    try {
      const repos = await AsyncStorage.getItem('repos');
      return repos !== null ? updateRepoList(JSON.parse(repos)) : null
    } catch (error) {
      console.error('There was a problem fetching your repos: ', error)
    }
  }

  ///update the list of stored repos when a repo is added
  const updateStoredRepos = async (repos: Repo[]) => {
    try {
      await AsyncStorage.setItem(
        'repos',
        JSON.stringify(repos)
      );
    } catch (error) {
      console.error('There was a problem storing your repos: ', error)
    }
  }

  //Lifecycle Hooks
  ///retrieve stored repos upon first app render and check for new releases
  useEffect(() => {
    retrieveStoredRepos();
    handleNewReleases();
  },[])


  //UI handlers
  const handleNewReleases = async() => {
    let newRepoList = repoList;
    const newReleases = await getUpdatedRepos(repoList);
    newReleases.forEach((newRepo: Repo) => {
      let repoIndex = newRepoList.findIndex(repo => repo.name === newRepo.name);
      newRepoList.splice(repoIndex, 1, newRepo);
    })
    updateRepoList(newRepoList);
    updateStoredRepos(newRepoList);
  }

  const handleAddRepoPress = async (text: string) => {
    const newRepo = await getNewRepoForStorage(text);
    if (repoList.find(repo => repo.name === newRepo.name)) {
      Alert.alert(`👀 Dr. Watch Doggie is already keeping an eye on ${newRepo.name}!`);
      return
    }
    const newRepoList: Repo[] = [...repoList, newRepo]
    updateRepoList(newRepoList);
    updateStoredRepos(newRepoList);
  }

  const handleRemoveRepoPress = async (repoName: string) => {
    let newRepoList = repoList;
    const repoIndex = newRepoList.findIndex(repo => repo.name === repoName);
    newRepoList.splice(repoIndex, 1);
    updateRepoList(newRepoList);
    updateStoredRepos(newRepoList);
  }

  const handleUpdateRepoSeen = (repoName: string) => {
    let newRepoList = repoList;
    let repo = newRepoList.find(repo => repo.name === repoName);
    const repoIndex = newRepoList.findIndex(repo => repo.name === repoName);
    if (repo) {
      repo.markedSeen = !repo.markedSeen;
      repo.newRelease = false;
      newRepoList.splice(repoIndex, 1, repo);
    }
    updateRepoList(newRepoList);
    updateStoredRepos(newRepoList);
  }

  const renderSingleRepo = ({item} : {item: Repo}) => (
    <ScrollView>
      <RepoCard 
        name={item.name}
        latestReleaseDate={item.latestReleaseDate}
        latestReleaseVersion={item.latestReleaseVersion}
        url={item.url}
        markedSeen={item.markedSeen}
        releaseNotes={item.releaseNotes}
        toggleSeen={handleUpdateRepoSeen}
        newRelease={item.newRelease}
        handleRemoveRepo={handleRemoveRepoPress}
        ownerAvatar={item.ownerAvatar}
        handleUpdateRepoSeen={handleUpdateRepoSeen}
        owner={item.owner}
      />
      </ScrollView>
  );

  return (
    <AppContainter>
      <View>
        <HeaderText>Dr. WatchDoggie's Library Monitor</HeaderText>
      </View>
    
      <AddRepoContainer>
        <TextInput placeholder='Add the link to a GitHub repo' onChangeText={onChangeText}/>
        <ButtonContainer>
          <Button title='Add Repo' onPress={() => handleAddRepoPress(text)} backgroundColor='#CCCCFF' fill={true}/>
        </ButtonContainer>
      </AddRepoContainer>
      <FlatListContainer>
        <FlatList 
          data={repoList}
          renderItem={renderSingleRepo}
          extraData={repoList}
        />
      </FlatListContainer>
    </AppContainter>
  );
}

import { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, Text, ScrollView, FlatList, Image, Alert } from 'react-native';
import { getNewRepoForStorage, Repo, getUpdatedRepos } from './src/api/githubAPI';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Button from './src/components/button'
import RepoCard from './src/components/repoCard';

export default function App() {
  //State Management
  const [text, onChangeText] = useState('');
  const [repoList, updateRepoList]= useState<Repo[]>([]);

  //Async Storage Management
  //retrieve any stored repos and add them to state
  const retrieveStoredRepos = async () => {
    try {
      const repos = await AsyncStorage.getItem('repos');
      return repos !== null ? updateRepoList(JSON.parse(repos)) : null
    } catch (error) {
      console.error('There was a problem fetching your repos: ', error)
    }
  };

  //update the list of stored repos when a repo is added
  const updateStoredRepos = async (repos: Repo[]) => {
    try {
      await AsyncStorage.setItem(
        'repos',
        JSON.stringify(repos)
      );
    } catch (error) {
      console.error('There was a problem storing your repos: ', error)
    }
  };

  //Lifecycle Hooks
  //retrieve stored repos upon first app render
  useEffect(() => {
    retrieveStoredRepos()
  },[])

  //check for new releases
  useEffect(() => {
    handleNewReleases()
  }, [])

  const handleNewReleases = async() => {
    let newRepoList = repoList
    const newReleases = await getUpdatedRepos(repoList);
    newReleases.forEach((newRepo: Repo) => {
      let repoIndex = newRepoList.findIndex(repo => repo.name === newRepo.name)
      newRepoList.splice(repoIndex, 1, newRepo)
    })
    updateRepoList(newRepoList)
    updateStoredRepos(newRepoList)
  }


  //Interaction Methods
  const handleAddRepoPress = async (text: string) => {
    const newRepo = await getNewRepoForStorage(text)
    if (repoList.find(repo => repo.name === newRepo.name)) {
      Alert.alert(`👀 Dr. Watch Doggie is already keeping an eye on ${newRepo.name}!`)
      return;
    }
    const newRepoList: Repo[] = [...repoList, newRepo]
    updateRepoList(newRepoList)
    updateStoredRepos(newRepoList)
  }

  const handleRemoveRepoPress = async (repoName: string) => {
    let newRepoList = repoList
    const indexOfRepo = newRepoList.findIndex(repo => repo.name === repoName)
    newRepoList.splice(indexOfRepo, 1)
    updateRepoList(newRepoList)
    updateStoredRepos(newRepoList)
  }

  const handleUpdateRepoSeen = (repoName: string) => {
    let newRepoList = repoList
    let repo = newRepoList.find(repo => repo.name === repoName)
    const repoIndex = newRepoList.findIndex(repo => repo.name === repoName)
    if (repo) {
      repo.markedSeen = !repo.markedSeen
      repo.newRelease = false
      newRepoList.splice(repoIndex, 1, repo)
    }
    updateRepoList(newRepoList)
    updateStoredRepos(newRepoList)
  }

  const renderSingleRepo = (item: Repo) => (
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
    <SafeAreaView style={styles.container}>
      <View style={styles.input}>
        <Image source={require('./assets/drWatchDoggie.png')} style={{width: '30%', height:'100%'}} />
        <Text style={styles.header}>Dr. WatchDoggie's Library Monitor</Text>
      </View>
    
      <View style={styles.input}>
        <TextInput placeholder='Add the link to a GitHub repo' onChangeText={onChangeText}/>
        <View style={styles.buttonContainer}>
          <Button title='Add Repo' onPress={() => handleAddRepoPress(text)} backgroundColor='green' textColor='white'/>
        </View>
      </View>
      <ScrollView>
        {repoList.map((repo: Repo, key: number) => {
          return renderSingleRepo(repo)
        })}
      </ScrollView>
        {/* <FlatList 
          data={repoList}
          renderItem={renderSingleRepo}
          extraData={repoList}
        /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6D4D2',
    alignItems: 'center',
  },
  input: {
    flexDirection: 'row',
  },
  buttonContainer: {
    width: '30%',
    margin: '5%',
  },
  header: {
    fontFamily: 'Arial',
    fontSize: 30,
    fontWeight: 'bold',
  }
});

const API_BASE_URL = 'https://api.github.com';


//Types
export interface Repo {
  name: string;
  latestReleaseDate: Date;
  latestReleaseVersion: string;
  url: string;
  releaseNotes: string;
  markedSeen: boolean;
  newRelease: boolean;
  ownerAvatar: string;
  owner: string;
}

//GitHub API calls

const getGitHubRepo = async(apiURL: string) => {
  try {
    const response = await fetch(apiURL);
    const json = await response.json();
    return json;
  }
  catch (error) {
    console.error(`Something went wrong retrieving GitHub repo ${apiURL}:`, error);
  }
}

const getGitHubLatestRelease = async (apiURL: string) => {
  try {
    const response = await fetch(apiURL);
    const json = await response.json();
    return json;
  }
  catch (error) {
    console.error(`Something went wrong retrieving GitHub release information for ${apiURL}:`, error);
  }
}

//Action Helpers
export const getUpdatedRepos = async (repoList: Repo[])  => {
  let updatedRepos: Repo[] = [];

  repoList.forEach(async (repo: Repo) => {
    let copyRepo = repo;
    const fetchedRelease = await getGitHubLatestRelease(`${API_BASE_URL}/repos/${repo.owner}/${repo.name}/releases/latest`);
    if (fetchedRelease.published_at !== repo.latestReleaseDate) {
      copyRepo.latestReleaseDate = fetchedRelease.published_at;
      copyRepo.latestReleaseVersion = fetchedRelease.name;
      if (repo.markedSeen) {
        copyRepo.markedSeen = false;
        copyRepo.newRelease = true;
      }
      updatedRepos.push(copyRepo);
    }
  })

  return updatedRepos;
}

export const getNewRepoForStorage = async(repoURL: string): Promise<Repo> => {
  const splitRepoURL = repoURL.split('/');
  const repoName = splitRepoURL[splitRepoURL.length - 1];
  const repoOwner = splitRepoURL[splitRepoURL.length - 2];
  const repoInfo = await getGitHubRepo(`${API_BASE_URL}/repos/${repoOwner}/${repoName}`);
  const releaseInfo = await getGitHubLatestRelease(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/releases/latest`);
  
  return {
    name: repoInfo.name, 
    latestReleaseDate: releaseInfo.published_at, 
    url: repoInfo.html_url, 
    latestReleaseVersion: releaseInfo.name, 
    releaseNotes: releaseInfo.body, 
    markedSeen:false, 
    newRelease: false,
    ownerAvatar: repoInfo.owner.avatar_url,
    owner: repoOwner
  };
}
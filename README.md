# APIX

Command line interface tool for calling apis, persist and sharing them.

# What is it ?

It's a command line tool replacement for :
- postman
- curl / wget ...

## Warning
This package is not yet ready to be used.  it's in conception phase.

## Usage

He is an example of how you'll be able to use it.

```bash
mkdir myrepo
cd myrepo
git init # optional, but it's better to make a project with git to share it
apix init # create a project with a default name
ls -al
drwxrwxr-x 4 user user  4096 mars  27 20:06 .
drwxrwxr-x 8 user user  4096 mars  27 20:43 ..
-rw-rw-r-- 1 user user   223 mars  27 20:04 apix.api.resource.yml
-rw-rw-r-- 1 user user   258 mars  27 20:04 apix.endpoint.resource.yml
-rw-rw-r-- 1 user user   186 mars  27 20:04 apix.resource.resource.yml
# import swagger openapi definition file that will be saved in kubernetes like format that is easier to edit than openapi
apix import github https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml
# new github directory added
ls -al
drwxrwxr-x 4 user user  4096 mars  27 20:06 .
drwxrwxr-x 8 user user  4096 mars  27 20:43 ..
-rw-rw-r-- 1 user user   223 mars  27 20:04 apix.api.resource.yml
-rw-rw-r-- 1 user user   258 mars  27 20:04 apix.endpoint.resource.yml
-rw-rw-r-- 1 user user   186 mars  27 20:04 apix.resource.resource.yml
drwxrwxr-x 2 user user 65536 mars  27 20:06 github
# 745 new api endpoints added, one kubernetes like file for each
ls github | wc -l
745
# share your imported api
git add .
git commit -m "chore: imported github api"
# executing requests
apix request get https://api.github.com/users/torvalds
# same as : request by swagger operation id
apix exec users.get-by-username 
Enter 'username': torvalds # automaticaly ask for missing parameters

Executing request: 'apix request get https://api.github.com/users/torvalds'
Status: 200 OK

{
  login: 'torvalds',
  id: 1024025,
  node_id: 'MDQ6VXNlcjEwMjQwMjU=',
  avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/torvalds',
  html_url: 'https://github.com/torvalds',
  followers_url: 'https://api.github.com/users/torvalds/followers',
  following_url: 'https://api.github.com/users/torvalds/following{/other_user}',
  gists_url: 'https://api.github.com/users/torvalds/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/torvalds/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/torvalds/subscriptions',
  organizations_url: 'https://api.github.com/users/torvalds/orgs',
  repos_url: 'https://api.github.com/users/torvalds/repos',
  events_url: 'https://api.github.com/users/torvalds/events{/privacy}',
  received_events_url: 'https://api.github.com/users/torvalds/received_events',
  type: 'User',
  site_admin: false,
  name: 'Linus Torvalds',
  company: 'Linux Foundation',
  blog: '',
  location: 'Portland, OR',
  email: null,
  hireable: null,
  bio: null,
  twitter_username: null,
  public_repos: 6,
  public_gists: 0,
  followers: 132343,
  following: 0,
  created_at: '2011-09-03T15:26:22Z',
  updated_at: '2021-01-10T19:36:11Z'
}
```
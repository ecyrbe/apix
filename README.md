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
git init
apix init
apix import github https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml
# request by swagger operation id
apix exec repos.list-for-user
Enter 'username': ecyrbe # automaticaly ask for missing parameters

[
  {
    "id": 347777555,
    "node_id": "MDEwOlJlcG9zaXRvcnkzNDc3Nzc1NTU=",
    "name": "apix",
    "full_name": "ecyrbe/apix",
    "private": false,
    "owner": {
      "login": "ecyrbe",
      "id": 633115,
      "node_id": "MDQ6VXNlcjYzMzExNQ==",
      "avatar_url": "https://avatars.githubusercontent.com/u/633115?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/ecyrbe",
      "html_url": "https://github.com/ecyrbe",
      "followers_url": "https://api.github.com/users/ecyrbe/followers",
      "following_url": "https://api.github.com/users/ecyrbe/following{/other_user}",
      "gists_url": "https://api.github.com/users/ecyrbe/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/ecyrbe/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/ecyrbe/subscriptions",
      "organizations_url": "https://api.github.com/users/ecyrbe/orgs",
      "repos_url": "https://api.github.com/users/ecyrbe/repos",
      "events_url": "https://api.github.com/users/ecyrbe/events{/privacy}",
      "received_events_url": "https://api.github.com/users/ecyrbe/received_events",
      "type": "User",
      "site_admin": false
    },
    "html_url": "https://github.com/ecyrbe/apix",
    "description": "command line interface tool for calling apis, persist and sharing them",
    "fork": false,
    "url": "https://api.github.com/repos/ecyrbe/apix",
    "forks_url": "https://api.github.com/repos/ecyrbe/apix/forks",
    "keys_url": "https://api.github.com/repos/ecyrbe/apix/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/ecyrbe/apix/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/ecyrbe/apix/teams",
    "hooks_url": "https://api.github.com/repos/ecyrbe/apix/hooks",
    "issue_events_url": "https://api.github.com/repos/ecyrbe/apix/issues/events{/number}",
    "events_url": "https://api.github.com/repos/ecyrbe/apix/events",
    "assignees_url": "https://api.github.com/repos/ecyrbe/apix/assignees{/user}",
    "branches_url": "https://api.github.com/repos/ecyrbe/apix/branches{/branch}",
    "tags_url": "https://api.github.com/repos/ecyrbe/apix/tags",
    "blobs_url": "https://api.github.com/repos/ecyrbe/apix/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/ecyrbe/apix/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/ecyrbe/apix/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/ecyrbe/apix/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/ecyrbe/apix/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/ecyrbe/apix/languages",
    "stargazers_url": "https://api.github.com/repos/ecyrbe/apix/stargazers",
    "contributors_url": "https://api.github.com/repos/ecyrbe/apix/contributors",
    "subscribers_url": "https://api.github.com/repos/ecyrbe/apix/subscribers",
    "subscription_url": "https://api.github.com/repos/ecyrbe/apix/subscription",
    "commits_url": "https://api.github.com/repos/ecyrbe/apix/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/ecyrbe/apix/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/ecyrbe/apix/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/ecyrbe/apix/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/ecyrbe/apix/contents/{+path}",
    "compare_url": "https://api.github.com/repos/ecyrbe/apix/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/ecyrbe/apix/merges",
    "archive_url": "https://api.github.com/repos/ecyrbe/apix/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/ecyrbe/apix/downloads",
    "issues_url": "https://api.github.com/repos/ecyrbe/apix/issues{/number}",
    "pulls_url": "https://api.github.com/repos/ecyrbe/apix/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/ecyrbe/apix/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/ecyrbe/apix/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/ecyrbe/apix/labels{/name}",
    "releases_url": "https://api.github.com/repos/ecyrbe/apix/releases{/id}",
    "deployments_url": "https://api.github.com/repos/ecyrbe/apix/deployments",
    "created_at": "2021-03-14T23:13:10Z",
    "updated_at": "2021-03-27T13:15:27Z",
    "pushed_at": "2021-03-27T13:15:25Z",
    "git_url": "git://github.com/ecyrbe/apix.git",
    "ssh_url": "git@github.com:ecyrbe/apix.git",
    "clone_url": "https://github.com/ecyrbe/apix.git",
    "svn_url": "https://github.com/ecyrbe/apix",
    "homepage": null,
    "size": 35,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "TypeScript",
    "has_issues": true,
    "has_projects": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "forks_count": 0,
    "mirror_url": null,
    "archived": false,
    "disabled": false,
    "open_issues_count": 0,
    "license": {
      "key": "mit",
      "name": "MIT License",
      "spdx_id": "MIT",
      "url": "https://api.github.com/licenses/mit",
      "node_id": "MDc6TGljZW5zZTEz"
    },
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "main"
  }
]
```
>apix init
>apix config repository ~/.apix
>apix api create myapi --swagger=https://localhost:8080/api/swagger.json
>apix get apis
  myapi https://localhost:8080/api/swagger.json
  github https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml
>apix config api myapi
  default api set to myapi
>apix get resources
  apis (the list of all declared apis)
  endpoints (list of all declared endpoints for an api)
  queries (queries are requests not tied to an enpoint)
  requests (like kubernetes pod)
  secrets (in .gitignore)
  configmaps
  aliases

>apix get endpoints
  authenticate get /api/authenticate
  getUsers get /api/users
  addUser post /api/users
  getUser get /api/users/{id}
  setUser put /api/users/{id}
  updateUser patch /api/users/{id}
  deleteUser delete /api/users/{id}

apix edit <resource> (edit given resource as yaml in default editor)


apix exec authenticate -o jsonpath='$.token' --save-secret myapi-token

apix create alias <name> <command>

apix create alias auth exec authenticate -o jsonpath='$.token' --save-secret myapi-token
apix auth

apix exec getUsers
  [
    {
      "id": 0,
      "name": "test"
    }
  ]

apix request -m post https://localhost:8080/api/auth -e token=$.token
apix apply -f req.json

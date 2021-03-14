apix config repository ~/.apix
apix ctx create myapi https://localhost:8080/api/swagger.json
apix ctx
  * axios 
  myapi https://localhost:8080/api/swagger.json
apix ctx myapi

apix operations
  getUsers get /api/users
  addUser post /api/users
  getUser get /api/users/{id}
  setUser put /api/users/{id}
  updateUser patch /api/users/{id}
  deleteUser delete /api/users/{id}

apix getUsers
  [
    {
      "id": 0,
      "name": "test"
    }
  ]

apix ctx axios
apix post https://localhost:8080/api/auth -e token=$.token
apix apply -f req.json

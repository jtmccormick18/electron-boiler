require('dotenv').config();

const microsoft = {
  "development": {
    "username": process.env.DB_USER || "dev",
    "password": process.env.DB_PASSWORD || "secret123",
    "host": process.env.DB_HOST || "localhost",
    "database": process.env.DB_DATABASE || 'AY2019',
    "dialect": "mssql",
    "port": process.env.PORT || 1433,
    "options": {
      "instanceName": process.env.INSTANCE || 'SQLEXPRESS',
      "database": process.env.DB_DATABASE || 'AY2019', //the username above should have granted permissions in order to access this DB.
      "debug": {
        "packet": false,
        "payload": false,
        "token": false,
        "data": false
      },
      //encrypt: true
    }
  },
  "test": {
    "username": "dev",
    "password": "secret123",
    "database": "AY2019",
    "host": "localhost/SQLEXPRESS",
    "dialect": "mssql"
  },
  "production": {
    "username": "dev",
    "password": "secret123",
    "database": "AY2019",
    "host": "localhost/SQLEXPRESS",
    "dialect": "mssql"
  }
}

const oracle = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "host": process.env.DB_HOST,
    "database": process.env.DB_DATABASE,
    "dialect": "mysql",
    "port": process.env.PORT || 3306
  },
  "test": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "host": process.env.DB_HOST,
    "database": process.env.DB_DATABASE,
    "dialect": "mysql",
    "port": process.env.PORT || 3306
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "host": process.env.DB_HOST,
    "database": process.env.DB_DATABASE,
    "dialect": "mysql",
    "port": process.env.PORT || 3306
  }
}

const exportConfig = function () {
  switch (process.env.DB_TYPE) {
    case 'oracle':
      return oracle;
    case 'microsoft':
      return microsoft;
    default:
      return microsoft;
  }
}

module.exports = exportConfig()
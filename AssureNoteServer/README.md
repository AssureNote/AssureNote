AssureNote Server
===

## Requirements

* Node.js v0.10
* MySQL 5.1 or higher

## How to install

```
$ cd /path/to/AssureNote/AssureNoteServer
$ mysql -u root -p < db/create_tables.sql
$ mysql -u root -p < db/create_test_user.sql
$ mysql -u root -p < db/initial_data.sql
$ cd app
$ npm install

```

## Run

```
$ cd /path/to/AssureNote/AssureNoteServer/app
$ npm start
```

## Document

Class API:
* doc/index.html

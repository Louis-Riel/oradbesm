# oradbesm

To repoduce the problem, 

Run an Oracle db docker container,by running this after a ```docker login``` run a 
```docker run -d -p 8080:8080 -p 1521:1521 --name OracleDB store/oracle/database-enterprise:12.2.0.1-slim```

 Then some login, a table and some irrelevant data
 ```docker exec -it OracleDB bash -c "source /home/oracle/.bashrc; sqlplus /nolog"```

```sql
connect sys as sysdba;
alter session set "_ORACLE_SCRIPT"=true;
create user dummy identified by dummy;
GRANT CONNECT, RESOURCE, DBA TO dummy;
create table some_data(some_column varchar(30),some_other_columns varchar(30));
insert into some_data values ('some','good data');
insert into some_data values ('more','good data');
insert into some_data values ('some','crap data');
insert into some_data values ('some','otherwise well intented data');
commit
exit
```

I patched the oracldb.js to add the log line before the _getconnection
```patch
@@ -267,6 +267,7 @@
 
     pool.getConnection(connAttrs, getConnectionCb);
   } else {
+    console.log("The args %s",JSON.stringify(connAttrs));
     self._getConnection(connAttrs, function(err, connInst) {
       if (err) {
         if (err.message.match(/DPI-1047/)) {
```

#Build and spin-up the docker container
- Clone this repo
- Get a copy  of instantclient-basic-linux.x64-19.3.0.0.0dbru.zip and instantclient-sqlplus-linux.x64-19.3.0.0.0dbru.zip and put those in the oraclient folder
- run ```docker-compose build && docker-compose up```
- run on a separate session to that server, run ```chmod +x herebedragons.sh``` and ```./herebedragons.sh```

you should expect to see

```text
errorchech           | Server listening on port:8009
errorchech           | Server running
errorchech           | running  "nothin"
errorchech           | Connecting to db
errorchech           | { NODE_VERSION: '11.15.0',
errorchech           |   HOSTNAME: '591e59f89f86',
errorchech           |   YARN_VERSION: '1.15.2',
errorchech           |   LD_LIBRARY_PATH:
errorchech           |    '/home/differ/diffconfabulator/oraclient/instantclient_19_3:',
errorchech           |   HOME: '/home/differ',
errorchech           |   PATH:
errorchech           |    '/home/differ/diffconfabulator/oraclient/instantclient_19_3:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
errorchech           |   PWD: '/home/differ/diffconfabulator' }
errorchech           | The args {"connectString":"localhost:1521/ORCLCDB.localdomain","password":"dummy","user":"dummy"}
errorchech           | Error: Invalid argument
errorchech           |     at Proxy.getConnection (/home/differ/diffconfabulator/node_modules/oracledb/lib/oracledb.js:271:10)
errorchech           |     at /home/differ/diffconfabulator/node_modules/oracledb/lib/util.js:180:16
errorchech           |     at new Promise (<anonymous>)
errorchech           |     at Proxy.<anonymous> (/home/differ/diffconfabulator/node_modules/oracledb/lib/util.js:168:14)
errorchech           |     at /home/differ/diffconfabulator/oradb.js:9:18
errorchech           |     at new Promise (<anonymous>)
errorchech           |     at Proxy.require.module.exports.start (/home/differ/diffconfabulator/oradb.js:6:12)
errorchech           |     at import.then (/home/differ/diffconfabulator/index.js:85:21)
```

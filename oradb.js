"use strict";
/*jshint esversion: 6 */
import OracleDB from 'oracledb';

module.exports.start = function (params, instance) {
    return new Promise(function (resolve, reject) {
        console.log("Connecting to db " + JSON.stringify(params.oraConnStr));
        console.log(process.env);
        OracleDB.getConnection(params.oraConnStr).then((conn) => {
            console.log("Running %s",params.query);
            conn.execute(params.query).then((res)=>{
                console.log(res);
                resolve(res);
            }).catch((err)=>{reject(err)});
        }).catch((err)=>{reject(err)});
    });
}

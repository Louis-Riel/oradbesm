"use strict";
/*jshint esversion: 6 */

import http from 'http';
import fs from 'fs';

class System {
    constructor() {
        this.port = 8009;
        this.options = { useWebServer: true };
        this.httpServer = http.createServer();
    }

    start() {
        if (this.options.useWebServer) {
            this.httpServer.listen({ port: this.port })
                .on("request", (req, res) => { this.onHttpRequest(req, res); })
                .on("listening", () => { this.onServerListening(); })
                .on("error", (err) => { this.onHttpError(err); });
        }
        return Promise.resolve(this);
    }

    onServerListening() {
        console.log("Server listening on port:" + this.port);
    }

    onHttpError(err, res) {
        if (err != undefined) {
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.write(JSON.stringify({ code: err.code, message: err.message, stack: err.stack }));
            res.end();
        }
    }

    onHttpRequest(req, res) {
        this.parseParams(req).then((params) => {
            this.runOp(params.operation).then((result) => {
                console.log(result);
                if (result.fileName) {
                    fs.exists(result.fileName, function (exists) {
                        if (exists) {
                            res.writeHead(200, {
                                "Content-Type": "application/octet-stream",
                                "Content-Disposition": "attachment; filename=" + result.fileName
                            });
                            fs.createReadStream(result.fileName).pipe(res);
                        } else {
                            res.writeHead(500, { "Content-Type": "text/plain" });
                            res.end("ERROR Temporary XLS File does not exist");
                        }
                    });
                } else {
                    res.writeHead(result.error != undefined ? 500:200, { 'Content-Type': 'application/json' });
                    res.write(typeof result == "string" ? result : JSON.stringify(result));
                    res.end();
                }
            }).catch((err) => {this.onHttpError(err, res);});
        }).catch((err) => {this.onHttpError(err, res);});
    }

    parseParams(req) {
        return new Promise((resolve, reject) => {
            let buf = [];
            req.on("data", (chunk) => {
                buf.push(chunk);
            }).on("end", () => {
                try {
                    Object.assign(this.options, JSON.parse(Buffer.concat(buf).toString()));
                    if ((buf.length == 0) || !this.options.operation) {
                        reject("Bad input parameters");
                    } else {
                        resolve(this.options);
                    }
                } catch (err) {reject(err);}
            });
        });
    }

    runOp(params) {
        return new Promise((resolve, reject) => {
            console.log("running ",JSON.stringify(params));
            import("./oradb.js").then((fnc) => {
                fnc.start(params, this).then((result) => {
                    console.log(result);
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {reject(err);});
        });
    }
}

let system = new System();
system.start()
    .then(() => {
        console.log('Server running');
    }).catch((err) => {
        console.error(err);
    });
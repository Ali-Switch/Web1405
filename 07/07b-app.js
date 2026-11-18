
import { framework } from './07a-framework.js';
import { writeFile, readFile, unlink, rmdir } from 'node:fs';

const app = framework();
const port = 3000;

// SUM
app.get('sum', function (request, response) {

    let items = request.url.split("/");

    let num1 = Number(items[2]);
    let num2 = Number(items[3]);

    response.writeHead(200);
    response.write((num1 + num2).toString());
    response.end();

});


// CREATE FILE
app.get('createFile', function (request, response) {

    let items = request.url.split("/");

    writeFile(items[2], items[3], function (error) {

        if (error) {
            console.log("createFile error", error);

            response.writeHead(500);
            response.write("createFile error");
            response.end();
        }
        else {
            console.log("createFile done");

            response.writeHead(200);
            response.write("createFile done");
            response.end();
        }

    });

});


// READ FILE
app.get('readFile', function (request, response) {

    let items = request.url.split("/");

    readFile(items[2], function (error, body) {

        if (error) {
            console.log("readFile error", error);

            response.writeHead(500);
            response.write("readFile error");
            response.end();
        }
        else {
            console.log("readFile done");

            response.writeHead(200);
            response.write(body);
            response.end();
        }

    });

});


// DELETE FILE
app.get('deleteFile', function (request, response) {

    let items = request.url.split("/");

    unlink(items[2], function (error) {

        if (error) {
            console.log("deleteFile error", error);

            response.writeHead(500);
            response.write("deleteFile error");
            response.end();
        }
        else {
            console.log("deleteFile done");

            response.writeHead(200);
            response.write("deleteFile done");
            response.end();
        }

    });

});


// DELETE FILE OR FOLDER
app.get('delete', function (request, response) {

    let items = request.url.split("/");

    unlink(items[2], function (error) {

        if (error) {

            console.log("deleteFile error", error);

            if (error.code === 'EPERM' || error.code === 'EISDIR') {

                rmdir(items[2], function (error) {

                    if (error) {
                        console.log("delete folder error", error);

                        response.writeHead(500);
                        response.write("delete error");
                        response.end();
                    }
                    else {
                        console.log("delete done (folder)");

                        response.writeHead(200);
                        response.write("delete done (folder)");
                        response.end();
                    }

                });

            }
            else {
                response.writeHead(500);
                response.write("delete error");
                response.end();
            }

        }
        else {
            console.log("delete done (file)");

            response.writeHead(200);
            response.write("delete done (file)");
            response.end();
        }

    });

});


// SIGNUP USER
app.post('user', function (request, response) {

    if (!request.data || !request.data.email || !request.data.password) {

        response.writeHead(400);
        response.end("email and password are required");
        return;

    }

    readFile('db.json', function (error, fileData) {

        if (error) {
            console.log("error reading db.json", error);

            response.writeHead(500);
            response.write("error reading db.json");
            response.end();
        }
        else {

            fileData = JSON.parse(fileData.toString());

            let userId = Math.floor(10000000 + Math.random() * 90000000);

            request.data.id = userId;

            fileData.data.push(request.data);

            let newData = JSON.stringify(fileData);

            writeFile('db.json', newData, function (error) {

                if (error) {
                    console.log("error writing db.json", error);

                    response.writeHead(500);
                    response.write("signup error");
                    response.end();
                }
                else {
                    console.log("signup done");
                    console.log("user ID:", userId);

                    response.writeHead(200);
                    response.write("signup done");
                    response.end();
                }

            });

        }

    });

});


// GET USER
app.get('user', function (request, response) {

    let items = request.url.split("/");
    let userId = Number(items[2]);

    readFile('db.json', function (error, fileData) {

        if (error) {
            console.log("error reading db.json", error);

            response.writeHead(500);
            response.write("getuser error");
            response.end();
        }
        else {

            fileData = JSON.parse(fileData.toString());

            let user = fileData.data.find(function (item) {

                return item.id === userId;

            });

            if (user) {

                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });

                response.write(JSON.stringify(user));
                response.end();

            }
            else {

                response.writeHead(404);
                response.write("user not found");
                response.end();

            }

        }

    });

});


// DELETE USER
app.delete('user', function (request, response) {

    let items = request.url.split("/");
    let userId = Number(items[2]);

    let user = request.headers.user;
    let pass = request.headers.pass;

    if (user !== 'admin' || pass !== '123') {

        console.log("invalid user and/or pass");

        response.writeHead(403);
        response.end("invalid user or pass");
        return;

    }

    readFile('db.json', function (error, fileData) {

        if (error) {
            console.log("error reading db.json", error);

            response.writeHead(500);
            response.end("removeuser error");
            return;
        }

        fileData = JSON.parse(fileData.toString());

        let userIndex = fileData.data.findIndex(function (item) {

            return item.id === userId;

        });

        if (userIndex !== -1) {

            fileData.data.splice(userIndex, 1);

            let newData = JSON.stringify(fileData);

            writeFile('db.json', newData, function (error) {

                if (error) {
                    console.log("error writing db.json", error);

                    response.writeHead(500);
                    response.end("removeuser error");
                }
                else {
                    console.log("removeuser done");

                    response.writeHead(200);
                    response.end("removeuser done");
                }

            });

        }
        else {

            response.writeHead(404);
            response.end("user not found");

        }

    });

});


// UPDATE USER
app.put('user', function (request, response) {

    if (!request.data || !request.data.id) {

        response.writeHead(400);
        response.end("user id is required");
        return;

    }

    let userId = Number(request.data.id);

    readFile('db.json', function (error, fileData) {

        if (error) {
            console.log("error reading db.json", error);

            response.writeHead(500);
            response.write("updateuser error");
            response.end();
        }
        else {

            fileData = JSON.parse(fileData.toString());

            let user = fileData.data.find(function (item) {

                return item.id === userId;

            });

            if (user) {

                Object.assign(user, request.data);

                user.id = userId;

                let newData = JSON.stringify(fileData);

                writeFile('db.json', newData, function (error) {

                    if (error) {
                        console.log("error writing db.json", error);

                        response.writeHead(500);
                        response.write("updateuser error");
                        response.end();
                    }
                    else {
                        console.log("updateuser done");

                        response.writeHead(200);
                        response.write("updateuser done");
                        response.end();
                    }

                });

            }
            else {

                response.writeHead(404);
                response.write("user not found");
                response.end();

            }

        }

    });

});


// LISTEN
app.listen(port, function () {

    console.log('app listening on port: ', port);

});

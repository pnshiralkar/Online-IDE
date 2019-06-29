var express = require('express');
var bodyParser = require('body-parser');
<<<<<<< HEAD
var shell = require('shelljs');
var fs = require('fs');
var temp="";
fs.readFile('template.cpp', 'utf8', function(err, cont){temp = cont;});
=======
var uniqid = require('uniqid');
var rimraf = require("rimraf");
const ps = require('python-shell')
>>>>>>> 09dd65d1ea43b9aff08813c8a149ac5a4c8c0e51

var app = express();
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
<<<<<<< HEAD
    res.render('editor', {"output": "", "temp": temp});
=======
    res.render('editor', {"output": ""});
>>>>>>> 09dd65d1ea43b9aff08813c8a149ac5a4c8c0e51
});

app.post('/save', function(req, res){
    res.set({"Content-Type": "application/octet-stream", "Content-Transfer-Encoding": "binary", "Content-disposition": "attachment; filename=\"save.cpp\""});
    res.write(req.body.code);
    res.end();
});

app.post('/run/', function(req, res)
{
<<<<<<< HEAD
    var fs = require('fs');
    var writestream = fs.createWriteStream("./codes/code.cpp");
    writestream.write(req.body.code);

    writestream = fs.createWriteStream("./codes/inp.txt");
    writestream.write(req.body.input);

    const ps = require('python-shell')
ps.PythonShell.run('codes/cpp.py', null, function (err, results) {
    var errors="";
    var readStream = fs.createReadStream("./codes/out.txt", 'utf8');
=======
    var id = uniqid();
    console.log(id);
    var fs = require('fs');

    fs.mkdirSync("./codes/" + id);

    var writestream = fs.createWriteStream("./codes/" + id + "/code.cpp");
    writestream.write(req.body.code);

    writestream = fs.createWriteStream("./codes/" + id + "/inp.txt");
    writestream.write(req.body.input);


    const ps = require('python-shell')
ps.PythonShell.run('codes/cpp.py', {args: [id]}, function (err, results) {
    var errors="";
    var readStream = fs.createReadStream("./codes/" + id + "/out.txt", 'utf8');
>>>>>>> 09dd65d1ea43b9aff08813c8a149ac5a4c8c0e51
    err = results;
    results = "";
    readStream.on('data', function(data){results += data;});
    readStream.on('end', function(){
        if (err){ errors += results; results = "_no_";} else errors += "_no_";

        var obj = {
            errors,
            results
        };

<<<<<<< HEAD
=======
        rimraf.sync("./codes/" + id);

>>>>>>> 09dd65d1ea43b9aff08813c8a149ac5a4c8c0e51
        res.end(JSON.stringify(obj));
    });
  
});
<<<<<<< HEAD

    //shell.exec("cd codes/\npython code.py>out.txt\ncd ../");
});

if(typeof process.argv.slice(1)[1] == "undefined")
	var port = 8888;
else
	var port = process.argv.slice(1)[1];

if(app.listen(port))
	console.log("Listening on port " + port + "\nTo listen on custom port, enter port No. as argument");

=======
});


app.listen(8080);
>>>>>>> 09dd65d1ea43b9aff08813c8a149ac5a4c8c0e51

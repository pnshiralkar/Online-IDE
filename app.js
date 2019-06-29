var express = require('express');
var bodyParser = require('body-parser');
var shell = require('shelljs');
var fs = require('fs');
var temp="";
fs.readFile('template.cpp', 'utf8', function(err, cont){temp = cont;});

var app = express();
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.render('editor', {"output": "", "temp": temp});
});

app.post('/save', function(req, res){
    res.set({"Content-Type": "application/octet-stream", "Content-Transfer-Encoding": "binary", "Content-disposition": "attachment; filename=\"save.cpp\""});
    res.write(req.body.code);
    res.end();
});

app.post('/run/', function(req, res)
{
    var fs = require('fs');
    var writestream = fs.createWriteStream("./codes/code.cpp");
    writestream.write(req.body.code);

    writestream = fs.createWriteStream("./codes/inp.txt");
    writestream.write(req.body.input);

    const ps = require('python-shell')
ps.PythonShell.run('codes/cpp.py', null, function (err, results) {
    var errors="";
    var readStream = fs.createReadStream("./codes/out.txt", 'utf8');
    err = results;
    results = "";
    readStream.on('data', function(data){results += data;});
    readStream.on('end', function(){
        if (err){ errors += results; results = "_no_";} else errors += "_no_";

        var obj = {
            errors,
            results
        };

        res.end(JSON.stringify(obj));
    });
  
});

    //shell.exec("cd codes/\npython code.py>out.txt\ncd ../");
});

if(typeof process.argv.slice(1)[1] == "undefined")
	var port = 8888;
else
	var port = process.argv.slice(1)[1];

if(app.listen(port))
	console.log("Listening on port " + port + "\nTo listen on custom port, enter port No. as argument");


var express = require('express');
var bodyParser = require('body-parser');
var uniqid = require('uniqid');
var rimraf = require("rimraf");
const ps = require('python-shell')

var app = express();
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.render('editor', {"output": ""});
});

app.post('/save', function(req, res){
    res.set({"Content-Type": "application/octet-stream", "Content-Transfer-Encoding": "binary", "Content-disposition": "attachment; filename=\"save.cpp\""});
    res.write(req.body.code);
    res.end();
});

app.post('/run/', function(req, res)
{
    var id = uniqid();
    console.log(id);
    var fs = require('fs');
//    var lang = "cpp";
	var lang = req.body.lang;

    fs.mkdirSync("./codes/" + id);
    var writestream = fs.createWriteStream("./codes/" + id + "/code." + lang)
    writestream.write(req.body.code);

    writestream = fs.createWriteStream("./codes/" + id + "/inp.txt");
    writestream.write(req.body.input);


    const ps = require('python-shell')
	ps.PythonShell.run('codes/' + lang + '.py', {args: [id]}, function (err, results) {
    var errors="";
    var readStream = fs.createReadStream("./codes/" + id + "/out.txt", 'utf8');
    err = results;
    results = "";
    readStream.on('data', function(data){results += data;});
    readStream.on('end', function(){
        if (err){ errors += results; results = "_no_";} else errors += "_no_";

        var obj = {
            errors,
            results
        };

        //rimraf.sync("./codes/" + id);

        res.end(JSON.stringify(obj));
    });
  
});
});


app.listen(8080);

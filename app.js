const express = require('express');
var port = process.env.PORT || 3001;
var http = require('http'),
    app = express();
var bodyParser = require('body-parser')
var cors = require('cors');
var path = require('path');
var childProcess = require('child_process');
var request = require('request');
var progress = require('request-progress');
var fs = require('fs');
var phantomjs = require('phantomjs-prebuilt');
var Converter = require("csvtojson").Converter;
var io = require('socket.io');
var csv=require('csvtojson');

app.set('trust proxy', 'loopback, linklocal, 172.30.52.0/24, 172.30.51.0/24');

app.use(cors());

app.use( bodyParser.json({limit: '5000mb'}) );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({ extended:true, limit: '5000mb', parameterLimit: 10000000}));

app.use('/healthcheck',function(req, res) {
  res.send('Healthy');
});

app.use('/api/getdata',function(req, res) {
  var options = req.body;
  request(options, function (error, response, body) {
    res.send(body);
  });
});

app.use('/api/getkeys', function(req, res) {
  var creds = req.body;
  var program = phantomjs.exec('phantomScript.js', creds.username, creds.password, function(error, stdout, stderr) {
    stderr & console.error(stderr);
    cb(error);
  });
  var cookieString = "";

  program.stdout.on('data', function(data) {
    var buff = new Buffer(data);
    var outputStr = buff.toString('utf8');
    if (outputStr.indexOf('}{') > -1) {
      outputStr = '[' + outputStr.replace(/}{/g,'},{') + ']';
    } else {
      outputStr = '[' + outputStr + ']';
    }
    console.log(outputStr);
    var outputs = JSON.parse(outputStr);
    for (var i = 0; i < outputs.length; i++) {
      var output = outputs[i];
      if (output.action == "Cookie") {
        cookieString = cookieString + output.cookie;
      } else if (output.action == "Download") {
        console.log("*** DOWNLOAD RECIEVED ***");
        var url = output.url;
        var options = {
          method: 'POST',
          url: url,
          gzip: true,
          headers:
           { 'accept-encoding': 'gzip',
           'content-type': 'application/x-www-form-urlencoded',
           'Cookie': cookieString},
        body: "rt=51&last_modified_user_id=0056000000458BI&last_modified_by=Nina+Krauwangmon&last_modified_date=10%2F9%2F2015+11%3A08+AM&scope=organization&colDt_c=CUST_CREATED_DATE&colDt_q=custom&colDt_s=&colDt_e=&enc=UTF-8&xf=localecsv&export=Export&co=1&calcagg_name0=&calcagg_label0=&calcagg_desc0=&calcagg_type0=N&calcagg_scale0=&calcagg_rowBreak0=&calcagg_colBreak0=&calcagg_formula0=&calcagg_name1=&calcagg_label1=&calcagg_desc1=&calcagg_type1=N&calcagg_scale1=&calcagg_rowBreak1=&calcagg_colBreak1=&calcagg_formula1=&calcagg_name2=&calcagg_label2=&calcagg_desc2=&calcagg_type2=N&calcagg_scale2=&calcagg_rowBreak2=&calcagg_colBreak2=&calcagg_formula2=&calcagg_name3=&calcagg_label3=&calcagg_desc3=&calcagg_type3=N&calcagg_scale3=&calcagg_rowBreak3=&calcagg_colBreak3=&calcagg_formula3=&calcagg_name4=&calcagg_label4=&calcagg_desc4=&calcagg_type4=N&calcagg_scale4=&calcagg_rowBreak4=&calcagg_colBreak4=&calcagg_formula4=&ct=none&ctitle=&cp=b&cs=default&cs2=&cs3=&cs4=&chda=no&chum=no&chsa=mbars&cd0=&cd1=&csize=3&cfsize=12&ctsize=18&tfg=0&fg=0&bg1=16777215&bg2=16777215&bgdir=2&l=1&sal=yes&cdbr0=&cdbr1=&chsv=no&chsp=no&chst=no&cheh=no&chco=no&Yman=no&cr_summary0=&cr_lowcolor0=12735572&cr_midcolor0=12763732&cr_highcolor0=5554772&cr_lowbk0=&cr_highbk0=&cr_summary1=&cr_lowcolor1=12735572&cr_midcolor1=12763732&cr_highcolor1=5554772&cr_lowbk1=&cr_highbk1=&cr_summary2=&cr_lowcolor2=12735572&cr_midcolor2=12763732&cr_highcolor2=5554772&cr_lowbk2=&cr_highbk2=&duel0=CUST_NAME%2C00N60000002VvLl%2C00N60000002Vop0%2C00N60000002Vooe%2C00N60000002VooV%2C00N60000002VooU%2C00N60000002Vook%2C00N60000002Vooj%2CCUST_OWNER_NAME%2C00N60000002VooW%2C00N60000002VooY%2C00N60000002VooX%2C00N60000002Voor%2C00N60000002Vooi%2C00N60000002Voon&format=t&sideBySide=false&show_subtotals=true&show_grandtotal=true&break0=FK_NAME&brkord0=up&brkdat0=0&sortColumn0=FK_NAME&pc0=&pn0=&pv0=&cc0=false&ss0=&irpe0=true&pc1=&pn1=&pv1=&cc1=false&ss1=&irpe1=true&pc2=&pn2=&pv2=&cc2=false&ss2=&irpe2=true&pc3=&pn3=&pv3=&cc3=false&ss3=&irpe3=true&pc4=&pn4=&pv4=&cc4=false&ss4=&irpe4=true&pc5=&pn5=&pv5=&cc5=false&ss5=&irpe5=true&pc6=&pn6=&pv6=&cc6=false&ss6=&irpe6=true&pc7=&pn7=&pv7=&cc7=false&ss7=&irpe7=true&pc8=&pn8=&pv8=&cc8=false&ss8=&irpe8=true&pc9=&pn9=&pv9=&cc9=false&ss9=&irpe9=true&pc10=&pn10=&pv10=&cc10=false&ss10=&irpe10=true&pc11=&pn11=&pv11=&cc11=false&ss11=&irpe11=true&pc12=&pn12=&pv12=&cc12=false&ss12=&irpe12=true&pc13=&pn13=&pv13=&cc13=false&ss13=&irpe13=true&pc14=&pn14=&pv14=&cc14=false&ss14=&irpe14=true&pc15=&pn15=&pv15=&cc15=false&ss15=&irpe15=true&pc16=&pn16=&pv16=&cc16=false&ss16=&irpe16=true&pc17=&pn17=&pv17=&cc17=false&ss17=&irpe17=true&pc18=&pn18=&pv18=&cc18=false&ss18=&irpe18=true&pc19=&pn19=&pv19=&cc19=false&ss19=&irpe19=true&pc20=&pn20=&pv20=&cc20=false&ss20=&irpe20=true&pc21=&pn21=&pv21=&cc21=false&ss21=&irpe21=true&pc22=&pn22=&pv22=&cc22=false&ss22=&irpe22=true&pc23=&pn23=&pv23=&cc23=false&ss23=&irpe23=true&details=yes&currency=USD&bool_filter=&lsk=1&sort=&sortdir=down&topn=all&c_0=CUST_NAME&c_1=00N60000002VvLl&c_2=00N60000002Vop0&c_3=00N60000002Vooe&c_4=00N60000002VooV&c_5=00N60000002VooU&c_6=00N60000002Vook&c_7=00N60000002Vooj&c_8=CUST_OWNER_NAME&c_9=00N60000002VooW&c_10=00N60000002VooY&c_11=00N60000002VooX&c_12=00N60000002Voor&c_13=00N60000002Vooi&c_14=00N60000002Voon&cnt=15&v=142&id=00O600000033QuM&cust_name=All+Keys&cust_devName=All_Keys&ns=&cust_desc=Portal+user+report+for+All+Customer+Assets+they+can+view&cust_owner=00l60000001A70Z&save_drill=&entity=01I60000000MdpS&child=&reln=00N60000002Voow&_CONFIRMATIONTOKEN=VmpFPSxNakF4Tnkwd05pMHhPVlF3T1Rvek1Eb3hNQzR6TmpWYSxrZTdSbFlobE9ZY05ySm9yUGxoNkNuLE1HTTBPVEl3&saveAndSched="
        };
      request(options, function (error, response, body) {
        var converter = new Converter({});
        converter.fromString(body, function(err,result){
          res.send(result);
        });
      });
    } else if (output.action == "URL Change") {
      console.log("New URL: " + output.url);
    } else {
      console.log("*** UNKNOWN MESSAGE ***");
      console.log(output);
      }
    }
  });
  program.stderr.pipe(process.stderr)
  program.on('exit', code => {
    console.log("Phantom Out");
  });
});

app.use('/api/getcsv', function(req, res) {
  // The options argument is optional so you can omit it
  var conn = req.body;
  //console.log(conn);
  var url = conn.url;
  /*
  var ls = url.lastIndexOf('/');
  var lenc = url.lastIndexOf('%2F');
  if (ls > lenc) {
    var filename = url.substr(ls+1)+'.csv';
  } else {
    var filename = url.substr(lenc+3)+'.csv';
  }*/
  var filename = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  filename = filename + ".csv";
  var tooBig = false;
  progress(request(url), {

  }).on('error', function (err) {

  }).on('progress', function (state) {
    console.log(state);
    if (state.size.total) {
      if (state.size.total > 100466790) {
        tooBig = true;
        this.abort();
      }
    }
    if (state.size.transferred > 100466790) {
      tooBig = true;
      this.abort();
    }
  }).on('end', function () {
    var data = [];
    csv()
    .fromFile('/src/csvdownload/'+filename)
    .on('json',(jsonObj)=>{
      data.push(jsonObj);
    })
    .on('done',(error)=>{
      var status = {};
      status.status = "complete";
      status.filename = filename;
      status.tooBig = tooBig;
      status.data = data;
      var fieldNames = Object.keys(data[0]);
      var fieldTypes = [];
      for (var i=0; i<fieldNames.length;i++) {
        var fieldName = fieldNames[i];
        var intTest = /^(-?[\d]+[^\.])$/g;
        var floatTest = /^-?[\d]*\.[\d]*/g;
        var boolTest = /true|false/ig;
        var dateTimeTest = /\d+\/\d+\/\d+.\d+\:\d+\:\d+/g;
        var dateTest = /\d+\/\d+\/\d+/g;
        if (intTest.test(data[0][fieldName])) {
          fieldTypes.push("int");
        } else if (floatTest.test(data[0][fieldName])) {
          fieldTypes.push("float");
        } else if (boolTest.test(data[0][fieldName])) {
          fieldTypes.push("bool");
        } else if (dateTimeTest.test(data[0][fieldName])) {
          fieldTypes.push("datetime");
        } else if (dateTest.test(data[0][fieldName])) {
          fieldTypes.push("date");
        } else {
          fieldTypes.push("string");
        }
      }
      status.fieldNames = fieldNames;
      status.fieldTypes = fieldTypes;
      res.send(status);
      fs.unlinkSync('/src/csvdownload/'+filename);
    })
  })
  .pipe(fs.createWriteStream('/src/csvdownload/'+filename));
});

app.use(express.static('public'));

//app.listen(port, function() {
//  console.log("Listening on http://127.0.0.1:3001");
//});

var server = http.createServer(app).listen(port, function() {
  console.log("Listening on http://127.0.0.1:3001");
});
//Server listens on the port 8124
io = io.listen(server);

io.sockets.on("connection", function(socket) {
  var message_to_client = {
    data:"Connection with the server established"
  }
  socket.send(JSON.stringify(message_to_client));

  socket.on("message",function(data){
    /*This event is triggered at the server side when client sends the data using socket.send() method */
    data = JSON.parse(data);

    console.log(data);
    /*Printing the data */
    var status = {};
    status.status = "received";
    status.data = data;
    socket.send(JSON.stringify(status));
    var url = data.url;
    var ls = url.lastIndexOf('/');
    var lenc = url.lastIndexOf('%2F');
    if (ls > lenc) {
      var filename = url.substr(ls+1)+'.csv';
    } else {
      var filename = url.substr(lenc+3)+'.csv';
    }
    console.log("Saving to "+filename);
    progress(request(url), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    })
    .on('progress', function (state) {
      var status = {};
      status.status = "downloading";
      status.state = state;
      socket.send(JSON.stringify(status));
    })
    .on('error', function (err) {
      var status = {};
      status.status = "error";
      status.error = err;
      socket.send(JSON.stringify(status));
    })
    .on('end', function () {
      var data = [];
      var recordNo = 0;
      var status = {};
      status.status = "processing";
      status.filename = filename;
      csv()
      .fromFile('/src/csvdownload/'+filename)
      .on('json',(jsonObj)=>{
        data.push(jsonObj);
        recordNo += 1;
        if (recordNo % 100 === 0) {
          status.records = recordNo;
          socket.send(JSON.stringify(status));
        }
      })
      .on('done',(error)=>{
        var status = {};
        status.status = "complete";
        status.filename = filename;
        status.data = data;
        var fieldNames = Object.keys(requestData[0]);
      	var fieldTypes = [];
      	for (var i=0; i<fieldNames.length;i++) {
      		var fieldName = fieldNames[i];
      		fieldTypes.push("string");
      	}
        status.fieldNames = fieldNames;
        status.fieldTypes = fieldTypes;
        socket.send(JSON.stringify(status));
      })
    })
    .pipe(fs.createWriteStream('/src/csvdownload/'+filename));
  });
});

var express=require('express');
var app=express();
var  mysql=require('mysql');

var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: '172.22.27.188:9200',
    log: 'info'
});
var indexName = "ngram";

function getSuggestions(input) {
    return elasticClient.search({
      index: indexName,
      type: 'doc',
      body:{
      "from" : 0, "size" : 5,
        "query": {
          "match": {
            "name": {
                  "query" : input,
                  "operator" : "and"
                  }
                }
            }
       }
    })
}

// var connection = mysql.createConnection({
//  host     : 'localhost',
//  user     : 'root',
//  password : 'bubble@241',
//  database : 'users'
//});

//connection.connect();

app.set('views',__dirname + '/views');
app.use(express.static(__dirname + '/JS'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/',function(req,res){
res.render('index.html');
});

app.get('/suggest/:input', function (req, res, next) {
  getSuggestions(req.params.input).then(function (result) { res.json(result) });
});

app.get('/search',function(req,res){

//connection.query('SELECT first_name from user_name where first_name like "%'+req.query.key+'%"', function(err, rows, fields) {
//	  if (err) throw err;
//    var data=[];
//    for(i=0;i<rows.length;i++)
//      {
//        data.push(rows[i].first_name);
//      }

getSuggestions(req.query.key)
.then(results => {
    console.log(`found ${results.hits.total} items in ${results.took}ms`);
//    console.log(`returned article titles:`);
    var data=[];
//    var length = results.hits.total;
//    for(i=0;i<rows.length;i++)
//      {
//        data.push(row);
//      }
    results.hits.hits.forEach(
      (hit, index) => data.push(hit._source.name)
//         `${hit._source.name}`
//        data.push(rows[i].first_name);
      )
res.end(JSON.stringify(data));
//    )
  });

//res.end(JSON.stringify(rawout));
      //res.end(getSuggestions(input));
//      res.end('{"name": "hello", "sku": "123456"}');
//	});
});


var server=app.listen(3000,function(){
console.log("We have started our server on port 3000");
});


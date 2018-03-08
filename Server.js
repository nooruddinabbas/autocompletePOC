var express=require('express');
var app=express();
var  mysql=require('mysql');

var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: '<CLIENT01-PRIVATEIP>:9200',
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
                  "fuzziness": "AUTO",
                  "operator" : "and"
                  }
                }
            }
       }
    })
}


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


getSuggestions(req.query.key)
.then(results => {
    console.log(`found ${results.hits.total} items in ${results.took}ms`);

    var data=[];

    results.hits.hits.forEach(
      (hit, index) => data.push(hit._source.name)

      )
res.end(JSON.stringify(data));

  });

});


var server=app.listen(3000,function(){
console.log("We have started our server on port 3000");
});


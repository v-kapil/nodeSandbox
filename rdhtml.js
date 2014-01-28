#!/usr/bin/env node
// Trying to collect (http GET) user feedbacks on indeed.com for different companies 
// and put them into local mongo database.

var http = require('http');
var cheerio = require('cheerio');

var company = 'Lsi'
var cnt = 0;

var options = {
    host: 'www.indeed.com',
    port: 80,			    						// default 80
    path: '/cmp/' + company + '/reviews?lang=en',					// default '/'
    method: 'GET'								// default 'GET'
};

callback_to_download_page = function(response){
    page = "";
//    console.log('STATUS: ' + response.statusCode);
//    console.log('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(chunk){page += chunk;});
    response.on('end', function(){
        var $ = cheerio.load(page);
        $('.description').each(function(index, value){ console.log(cnt++ + ": " + $(value).text())});
        $('.company_reviews_pagination_link_nav').each(function(index, value){
            if ($(value).text() === "Next »"){
                var nextLink = $(value).attr("href");
                options['path'] = '/cmp/' + company + '/reviews' + nextLink;
    //            console.log(nextLink);
                request = http.request(options, callback_to_download_page);
                request.on('error', function(e){console.log('Problems with request ' + e.message);});
                request.end();
            }
            
        });
    });
//    response.on('end', function(){console.log(page)});
}

var request = http.request(options, callback_to_download_page)

request.on('error', function(e){console.log('Problems with request ' + e.message);});

//request.write('some data\n');
//request.write('some more data\n');
request.end();

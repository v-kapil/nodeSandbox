#!/usr/bin/env node
// Trying to collect (http GET) user feedbacks on indeed.com for different companies 
// and put them into local mongo database.

var http = require('http');
var cheerio = require('cheerio');

var company = 'Lsi'
var cnt = 0;
var tmpcnt = 0;

var options = {
    host: 'www.indeed.com',
    port: 80,			    						// default 80
    path: '/cmp/' + company + '/reviews?lang=en',					// default '/'
    method: 'GET'								// default 'GET'
};

callback_httpreq = function(response){
    page = "";
    var reviewAll = [];
//    console.log('STATUS: ' + response.statusCode);
//    console.log('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(chunk){page += chunk;});
    response.on('end', function(){
        var $ = cheerio.load(page);
        /////////// Extract Useful Info From Loaded Page ///////////////////
        $('.review_title').each(function(index, value){reviewAll[cnt + index] = { "reviewTitle" : $(value).text() };});
        $('.value_title').each(function(index, value){reviewAll[cnt + index]["valueTitle"] = $(value).text() });
        $('.reviewer').each(function(index, value){reviewAll[cnt + index]["reviewer"] = $(value).text() });
        $('.reviewer_job_location').each(function(index, value){reviewAll[cnt + index]["reviewJobLocation"] = $(value).text() });
        $('.description').each(function(index, value){reviewAll[cnt + index]["description"] = $(value).text() ; tmpcnt= index;});
//        cnt = tmpcnt;
//        $('.value-title').each(function(index, value){ console.log(cnt++ + ": " + $(value).attr("title"))});
 //       $('.reviewer').each(function(index, value){ console.log(cnt++ + ": " + $(value).text())});
  //      $('.reviewer_job_location').each(function(index, value){ console.log(cnt++ + ": " + $(value).text())});
//        $('.description').each(function(index, value){ console.log(cnt++ + ": " + $(value).text())});

        console.log(reviewAll);
        ///////////////////////////////////////////////////////////////////
        $('.company_reviews_pagination_link_nav').each(function(index, value){
            if ($(value).text() === "Next »"){
                var nextLink = $(value).attr("href");
                options['path'] = '/cmp/' + company + '/reviews' + nextLink;
    //            console.log(nextLink);
                request = http.request(options, callback_httpreq);
                request.on('error', function(e){console.log('Problems with request ' + e.message);});
                request.end();
            }
            
        });
    });
//    response.on('end', function(){console.log(page)});
}

ar request = http.request(options, callback_httpreq)
request.on('error', function(e){console.log('Problems with request ' + e.message);});
request.end();

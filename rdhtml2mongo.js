#!/usr/bin/env node
// Trying to collect (http GET) user feedbacks on indeed.com for different companies 
// and put them into local mongo database.

var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');

// Mongo Setup
var mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost/test'); // this gives a pending connection, to get notified once connection is made, use mongoose.connection.on()
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var indeedReviewSchema = mongoose.Schema({
    company_name : String,
    rating : Number,
    review_title : String,
    reviewer_job_title : String,
    reviewer_job_location : String,
    date_reviewed : Date,
    review_pros : String,
    review_cons : String,
    description : String,
    review_helpful_yes : String,
    review_helpful_no : String
});
var reviewModel = mongoose.model('reviewModel', indeedReviewSchema); 
////////////////
var companies = ['Lsi', ];
for(var i = 0; i < companies.lenght; i++){
var company = companies[i];

var options = {
    host: 'www.indeed.com',
    port: 80,			    						// default 80
    path: '/cmp/' + company + '/reviews?lang=en',					// default '/'
    method: 'GET'								// default 'GET'
};

var callback_httpreq = function(response){ 
    page = "";
    var reviewAll = [];
    //console.log('STATUS: ' + response.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(chunk){page += chunk;});
    response.on('end', function(){
        var $ = cheerio.load(page);
        $('.company_review_container').each(function(index, value){ 
            var company_name = company;
            var rating = $(this).children('div').children('.company_ratings').children('span').children().children().attr("title");
            var review_title = $(this).children('div').children('.review_title').text();
            var reviewer_job_title = $(this).children('div').children('.review_subtitle').children('.reviewer_job_title').children().text();
            var reviewer_job_location = $(this).children('div').children('.review_subtitle').children('.reviewer_job_location').text();
            var date_reviewed = $(this).children('div').children('.review_subtitle').children('.dtreviewed').text();
            var review_pros = $(this).children('div').children('.review_content').children('.review_pros_cons_content').children('.review_pros').text();
            var review_cons = $(this).children('div').children('.review_content').children('.review_pros_cons_content').children('.review_cons').text();
            var description = $(this).children('div').children('.review_content').children('.description').text();
            var review_helpful_yes = $(this).children('div').children('.review_feedback').children('.review_vote').children().eq(0).children('.voteText').children().text();
            var review_helpful_no = $(this).children('div').children('.review_feedback').children('.review_vote').children().eq(1).children('.voteText').children().text();
            var review = new reviewModel({"company_name": company_name, "rating": rating, "review_title": review_title, "reviewer_job_title": reviewer_job_title, "reviewer_job_location": reviewer_job_location, "date_reviewed": date_reviewed, "review_pros": review_pros, "review_cons": review_cons, "description": description, "review_helpful_yes": review_helpful_yes, "review_helpful_no": review_helpful_no });
            review.save(function(err, review){if(err){console.log("Error saving review to mongo")}});
            fs.writeFile('companyReviews.txt', JSON.stringify(review), function(err){if(err){console.log("Error writting file")}} );
        });
        $('.company_reviews_pagination_link_nav').each(function(index, value){ // if there is next page go there.. recursively
            if ($(value).text() === "Next »"){
                var nextLink = $(value).attr("href");
                options['path'] = '/cmp/' + company + '/reviews' + nextLink;
                //console.log(nextLink);
                request = http.request(options, callback_httpreq);
                request.on('error', function(e){console.log('Problems with request ' + e.message);});
                request.end();
            }
        }); 
    });
}

var request = http.request(options, callback_httpreq); 
request.on('error', function(e){console.log('Problems with request ' + e.message);});
request.end();

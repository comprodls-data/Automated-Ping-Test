const Request = require('superagent');
require('superagent-retry-delay')(Request);
var timer = require('./lib/timer');
var mapping = require('./data/mapping');

var limitExecution= 40;
var waitTime= 10000;

function testStatus () {

    var url= 'https://api.wheresitup.com/v4/jobs';
    Request
      .post(url)
      .send ({uri:"https://cambridgeone.org", tests:["ping"], sources:["london", "newyork"], options:{"ping": {"count": 1}}})
      .set({'content-type' : 'application/json'})
      .set({'Auth' :"Bearer 5de6446d51a5406ae718babe d6da8291cbc4a91560e9396e4dfb463c"})
      .end(function (err, res) {
        if (err) {
           console.log("Error in ping test "+err);  
         }
        else {
           console.log("Successfuly started the job");
           var jobId = JSON.parse(res.text).jobID;
           startPolling(jobId, 0);
        }
      });  
  }

  testStatus();

  function startPolling (jobId, counter) {
    if( counter == limitExecution) {
        console.log("Reached the limit");
    } else {
    var url= 'https://api.wheresitup.com/v4/jobs/' + jobId;
    Request
      .get(url)
      .set({'Auth' :"Bearer 5de6446d51a5406ae718babe d6da8291cbc4a91560e9396e4dfb463c"})
      .end(function (err, res) {
        if (err) {
           console.log("Error in getting ping test "+err);  
         }
        else {
           console.log("Successfuly got the job");
           if(JSON.parse(res.text).response.in_progress.constructor == Array && JSON.parse(res.text).response.in_progress.length == 0) {
             console.log("Found the data");
             processorForCompletedTests(JSON.parse(res.text).response, 0);
           } else {
             console.log("In-Progress");
             timer.wait(waitTime);
             startPolling(jobId, counter+1);
           }
        }
      });
    }  
  }
   
  function processorForCompletedTests(finalJson, i) {
      var completeLength = Object.keys(finalJson.complete).length;
      if(i < completeLength) {
         statusPageUpdate(Object.keys(finalJson.complete)[i],true, function() {
            processorForCompletedTests(finalJson, i+1);
         });
      } else {
          if(finalJson.error.constructor == Object) {
            processorForErroredTests(finalJson, 0);
          } else {
              console.log("Thanks For Using Me :)");
          }
      }
  }

  function processorForErroredTests(finalJson, i) {
    var errorLength = Object.keys(finalJson.error).length;
    if(i < errorLength) {
        statusPageUpdate(Object.keys(finalJson.error)[i],false, function() {
          processorForErroredTests(finalJson, i+1);
         });
    } else {
        console.log("Thanks For Using Me :)");       
    }
  }

  function statusPageUpdate(country, status, cb) {
      var componentid = mapping.countries_to_components[country];
      var pageid = mapping.page.page1;
      var authKey = mapping.authKey;
      var statusToSend = status ? "operational" : "partial_outage";
      var reqBody = {
        "component": {
            "status": statusToSend
        }
      };
      var url= 'https://api.statuspage.io/v1/pages/'+pageid+'/components/'+componentid;
      Request
        .put(url)
        .send (reqBody)
        .set({'content-type' : 'application/json'})
        .set({'Authorization' :authKey})
        .end(function (err, res) {
          if (err) {
            console.log("Error in updation of test status for the country " + country);
             cb();   
           }
          else {
              if(res.body.error){
                console.log("Error in updation of test status for the country " + country);
                  console.log( "Error - " + res.body.error);
              }
              else{
                console.log("Succsesful - Status Of Test Updated For Country " + country);
              }
              cb();
          }
        });  
  }

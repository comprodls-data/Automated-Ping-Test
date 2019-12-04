const Request = require('superagent');
require('superagent-retry-delay')(Request);
const timer = require('./lib/timer');
const executor = require('./lib/executor');
const Logger = require('./lib/logger');
const param  = require('./data/param');

var limitExecution= 40;
var waitTime= 10000;

function testStatus () {

    var url= 'https://api.wheresitup.com/v4/jobs';
    Request
      .post(url)
      .send ({uri:"https://cambridgeone.org", tests:["ping"], sources:param.countries, options:{"ping": {"count": param.pingsCount}}})
      .set({'content-type' : 'application/json'})
      .set({'Auth' :"Bearer 5de6446d51a5406ae718babe d6da8291cbc4a91560e9396e4dfb463c"})
      .end(function (err, res) {
        if (err) {
           Logger.logError("Error in ping test "+err);
         }
        else {
           console.log("Successfuly started the job");
           var jobId = JSON.parse(res.text).jobID;
           pollingF(jobId, 0);
        }
      });  
  }

  testStatus();

  function pollingF (jobId, counter) {
    if( counter == limitExecution) {
        Logger.logError("Reached the limit");
    } else {
    var url= 'https://api.wheresitup.com/v4/jobs/' + jobId;
    Request
      .get(url)
      .set({'Auth' :"Bearer 5de6446d51a5406ae718babe d6da8291cbc4a91560e9396e4dfb463c"})
      .end(function (err, res) {
        if (err) {
           Logger.logError("Error in getting ping test "+err);
         }
        else {
            console.log("Successfuly got the job");
           if(JSON.parse(res.text).response.in_progress.constructor == Array && JSON.parse(res.text).response.in_progress.length == 0) {
             Logger.logInfo("Found the data");
             processorForCompletedTests(JSON.parse(res.text).response, 0);
           } else {
             console.log("In-Progress");
             timer.wait(waitTime);
             pollingF(jobId, counter+1);
           }
        }
      });
    }  
  }
   
  function processorForCompletedTests(finalJson, i) {
      var completeLength = Object.keys(finalJson.complete).length;
      if(i < completeLength) {
         executor.statusPageUpdate(Object.keys(finalJson.complete)[i],true, function() {
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
      executor.statusPageUpdate(Object.keys(finalJson.error)[i],false, function() {
          processorForErroredTests(finalJson, i+1);
         });
    } else {
        console.log("Thanks For Using Me :)");       
    }
  }

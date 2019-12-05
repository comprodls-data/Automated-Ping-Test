const Logger = require('./logger');
const mapping = require('../data/mapping');
const Request = require('superagent');
require('superagent-retry-delay')(Request);

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
          Logger.logError("Error in updation of test status for the " + country);
           cb();   
         }
        else {
            if(res.body.error){
              Logger.logError("Error in updation of test status for the " + country);
              Logger.logError( "Error - " + res.body.error);
            }
            else{
              Logger.logInfo("Succsesful - Status Of Test Updated for " + country);
            }
            cb();
        }
      });  
}

module.exports = {
    statusPageUpdate: statusPageUpdate
};
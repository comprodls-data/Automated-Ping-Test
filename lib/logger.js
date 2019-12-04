/**
 * Created by Sakshi on 7/27/2017.
 */

var chalk = require('chalk');
var prettyjson = require('prettyjson');

var options = {
    nocolor: false
};

var _timer = function(){
    var currentDate = new Date(new Date().toISOString());
    return "["+currentDate.toLocaleString().replace(/\//g,"-")+"] ";
};

var _logger = function(){
    var _logError = function(message){
        process.stdout.write(chalk.red( _timer()+"[Error] "));
        console.log(chalk.red(typeof message === "object" ? "\n"+ prettyjson.render(message,options) : message));
    };
    var _logSuccess = function(message){
        process.stdout.write(chalk.green( _timer()+"[Info] "));
        console.log(chalk.green(typeof message === "object" ? "\n"+ prettyjson.render(message,options) : message));
    };
    var _logInfo = function(message){
        process.stdout.write(chalk.blue( _timer()+"[Info] "));
        console.log(chalk.blue(typeof message === "object" ? "\n"+ prettyjson.render(message,options) : message));
    };
    return {
        logError:_logError,
        logSuccess: _logSuccess,
        logInfo:_logInfo
    }
}();

module.exports = _logger;
var restify = require('restify');
var mongojs = require("mongojs");

var ip_addr = '0.0.0.0';
var port    =  '8080';


var SampleApp = function() {

    //  Scope.
    var self = this;
		var server = restify.createServer({
		    name : "myapp"
		});
		var connection_string = '127.0.0.1:27017/myapp';
		var db = mongojs(connection_string, ['myapp']);
		var jobs = db.collection("jobs");
		server.use(restify.queryParser());
		server.use(restify.bodyParser());
		server.use(restify.CORS());
		var PATH = '/jobs'
		
		
	  self.findAllJobs = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.find().limit(20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }

    });

}

			 self.findJob = function(req, res , next){
				    res.setHeader('Access-Control-Allow-Origin','*');
				    jobs.findOne({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
				        console.log('Response success '+success);
				        console.log('Response error '+err);
				        if(success){
				            res.send(200 , success);
				            return next();
				        }
				        return next(err);
				    })
				}
				
			self.postNewJob =	function(req , res , next){
				    var job = {};
				    job.title = req.params.title;
				    job.description = req.params.description;
				    job.location = req.params.location;
				    job.postedOn = new Date();
				
				    res.setHeader('Access-Control-Allow-Origin','*');
				
				    jobs.save(job , function(err , success){
				        console.log('Response success '+success);
				        console.log('Response error '+err);
				        if(success){
				            res.send(201 , job);
				            return next();
				        }else{
				            return next(err);
				        }
				    });
				}
				
		self.deleteJob= 		function (req , res , next){
				    res.setHeader('Access-Control-Allow-Origin','*');
				    jobs.remove({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
				        console.log('Response success '+success);
				        console.log('Response error '+err);
				        if(success){
				            res.send(204);
				            return next();      
				        } else{
				            return next(err);
				        }
				    })
				
				}

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

		server.get({path : PATH , version : '0.0.1'} , self.findAllJobs);
		server.get({path : PATH +'/:jobId' , version : '0.0.1'} , self.findJob);
		server.post({path : PATH , version: '0.0.1'} ,self.postNewJob);
		server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,self.deleteJob);
		

    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };



    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        server.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */
/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();


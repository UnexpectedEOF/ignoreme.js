/**
 * ignoreme.js - A Google Analytics administrative visit cloaking tool
 * ---
 * by Matt Wilczynski
 */

function IgnoreMe(options){
	
	
	if(typeof options === 'undefined'){
		console.log("Yo, you need to pass an options object first.");
		return false;
	}
	
	//Fields
	this.gaId;				//GA UA-XXXX... ID
	this.gaObject;			//Not used yet. 
	this.gaq;				//Not used yet.
	this.signal;			//May be "hashbang", "get", "userfunc", "cookie" (coming soon), "localstorage" (coming soon)
	this.ignoreLevel;		//Can be "none", "filter", or "paranoid"
	this.syncOrAsynch;		//Not used yet. Can be "synch" or "asynch".
	this.linkPoison;		//Not used yet.
	this.paranoidLabel;		//Value used to trigger paranoid mode.
	this.queryParam;		//Name of GET param that holds "ignore trigger" value.
	this.optionsObj;		//Object containing all the options.
	this.signalStrategy;	//Function to determine if signal is present.
	this.triggerKey = "";	//Predetermined key to match against when deciding whether to trigger
	this.triggerValue = ""; //Predetermined value to match against when deciding whether to trigger
	this.passedKey = "";	//Actual key found in request
	this.passedValue = "";	//Actual value found in request
	
	//Mutators and crap
	this.setOptions = function(optionsObject){
		//Options stuff
		this.optionsObj = optionsObject;
		this.ignoreLevel = this.optionsObj.level != undefined ? this.optionsObj.level : undefined;
		this.signal = this.optionsObj.signal != undefined ? this.optionsObj.signal : undefined;
		this.triggerKey = this.optionsObj.key != undefined ? this.optionsObj.key : undefined;
		this.triggerValue = this.optionsObj.value != undefined ? this.optionsObj.value : undefined;
		this.signalStrategy = this.optionsObj.userfunc != undefined ? this.optionsObj.userfunc : undefined;
		
		//GA-specific shit
		this.gaId = this.optionsObj.gaId != undefined ? this.optionsObj.gaId : undefined;
		this.gaObject = this.optionsObj.gaObj != undefined ? this.optionsObj.gaObj : undefined;
		this.gaq = this.optionsObj.gaq != undefined ? this.optionsObj.gaq : undefined;
	};
	
	
	//Signal checkers
	this.checkHashbang = function(){
		console.log("Checking for hash(bangs)...");
		var returner = {key: "", label: ""};
		var hash = typeof window.location.hash != 'undefined' ? window.location.hash.replace('#!', '').replace('#', '') : "";
		
		if(hash !== "" && hash.toLowerCase() === this.triggerValue.toLowerCase()){
			console.log("Hash is: "+ hash);
			returner = {key: hash, label: hash};
		}
		else{
			console.log("Hashbang not found in URL or triggerKey doesn't match. Resuming normal GA building.");
		}
		return returner;
	};
	
	this.checkQueryParam = function(){
		console.log("Checking for GET params...");
		//Code based on http://james.padolsey.com/javascript/bujs-1-getparameterbyname/
		name = String(this.triggerKey).replace(/[.*+?|()[\]{}\\]/g, '\\$&');
		
		var match = RegExp('[?&]' + String(name) + '=([^&]*)').exec(window.location.search);

		var passedValue = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		passedValue = passedValue === null ? "" : passedValue;

		console.log("Result of the query param search: " + passedValue);
		return {key: this.triggerKey, label: passedValue};
	};

	this.extractCookie = function(){
		
	};
	
	this.extractLocalStorage = function(){
		
	};
	
	//See if the appropriate signal can be detected
	this.checkSignal = function(){
		switch(this.signal){
			case "hashbang":
				this.signalStrategy = this.checkHashbang;
				break;
			case "get":
				this.signalStrategy = this.checkQueryParam;
				break;
			case "userfunc":
				//Don't need to set it because that's done when options are copied
				break;
			case undefined:
				console.log("No signal type specified.");
				break;
			case "cookie": //Will be included soon.
			default:
				console.log("Yeah, we don't support that signal yet. Sorry. :/");
				break;
		}
		
		if(typeof this.signalStrategy !== 'undefined'){
			var workerArr = this.signalStrategy();
			this.passedKey = workerArr.key != undefined ? workerArr.key : "";
			this.passedValue = workerArr.label != undefined ? workerArr.label : "";
		}
		else{
			console.log("userfunc option selected, but no function provided.");
		}
	};
	
	
	//Set up or deactivate GA depending on all the stuff we've gathered.
	this.gaSetup = function(){
		
		window._gaq = [];
		window._gaq.push(['_setAccount', this.gaId]);
		
		console.log("The specified ignorelevel is: " + this.ignoreLevel);
		
		switch(this.ignoreLevel){
			case "filter":  //Should give both the key and value to GA where available.
				if(this.passedKey != "" && this.passedValue != ""){
					console.log("Filter mode activized. Preparing to send GA custom variable.");
					window._gaq.push(['_setCustomVar', 1, this.passedKey, this.passedValue, 3]);
				}
				else{
					console.log("No signal detected. Proceeding as normal.");
				}
			case "paranoid": //Needs to match the passed value with a pre-specified trigger value because there's no post-processing on the GA side
				if(this.passedValue.toLowerCase() === this.triggerValue.toLowerCase() && window._gaq.length === 1){
					console.log("Paranoid mode activized. GA object not created, pageview not logged.");
					break;
				}
			case "normal":
			case undefined:
			default:
				console.log("Creating GA object...");
				window._gaq.push(['_trackPageview']);
				window.ga = document.createElement('script'); window.ga.type = 'text/javascript'; window.ga.async = true;
				window.ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(window.ga, s);
				break;	
		}
		
	};
	
	
	//Actually build the object
	this.setOptions(options);
	this.checkSignal();
	this.gaSetup();
	
	return this;
}

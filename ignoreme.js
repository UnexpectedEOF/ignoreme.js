/**
 * ignoreme.js - A Google Analytics administrative visit cloaking tool
 * ---
 * by Matt Wilczynski
 */

function IgnoreMe(options){
	
	
	if(typeof options == 'undefined'){
		console.log("Yo, you need to put pass an options object first.");
		return false;
	}
	
	//Fields
	this.gaId;			//GA UA-XXXX... ID
	this.gaObject;		//Not used yet. 
	this.gaq;			//Not used yet.
	this.signal;		//May be "hashbang", "get", "cookie" (coming soon), "localstorage" (coming soon), or "callback" (coming soon)
	this.ignoreLevel;	//Can be "none", "ignore", or "paranoid"
	this.syncOrAsynch;	//Not used yet. Can be "synch" or "asynch".
	this.linkPoison;	//Not used yet.
	this.label;			//Value used with signal, if applicable. Analogous to GA's custom event labels.
	this.paranoidLabel;	//Value used to trigger paranoid mode.
	this.queryParam;	//Name of GET param that holds "ignore trigger" value.
	this.optionsObj;	//Object containing all the options.
	this.callback;		//Callback function to determine if signal is present.
	
	//Mutators and crap
	this.setOptions = function(optionsObject){
		//Options stuff
		this.optionsObj = optionsObject;
		this.ignoreLevel = this.optionsObj['level'] != undefined ? this.optionsObj['level'] : undefined;
		this.signal = this.optionsObj['signal'] != undefined ? this.optionsObj['signal'] : undefined;
		this.queryParam = this.optionsObj['queryParam'] != undefined ? this.optionsObj['queryParam'] : undefined;
		this.hashbangLabel = this.optionsObj['hashbang'] != undefined ? this.optionsObj['hashbang'] : undefined;
		this.paranoidLabel = this.optionsObj['paranoidLabel'] != undefined ? this.optionsObj['paranoidLabel'] : undefined;
		this.callback = this.optionsObj['callback'] != undefined ? this.optionsObj['callback'] : undefined;
		
		//GA-specific shit
		this.gaId = this.optionsObj['gaId'] != undefined ? this.optionsObj['gaId'] : undefined;
		this.gaObject = this.optionsObj.gaObj != undefined ? this.optionsObj.gaObj : undefined;
		this.gaq = this.optionsObj.gaq != undefined ? this.optionsObj.gaq : undefined;
	};
	
	
	//Signal checkers
	this.checkHashbang = function(){
		console.log("Checking for hashbangs...");
		if(typeof window.location.hash != 'undefined' && window.location.hash.length != 0){
			console.log("Hash is: "+ window.location.hash);
			this.label = window.location.hash;
		}
		else{
			this.label = "";
			console.log("Hashbang not found in URL. Resuming normal GA building.");
		}
	};
	
	this.checkQueryParam = function(){
		
		//Code based on http://james.padolsey.com/javascript/bujs-1-getparameterbyname/
		name = String(this.queryParam).replace(/[.*+?|()[\]{}\\]/g, '\\$&');
		
		var match = RegExp('[?&]' + String(name) + '=([^&]*)').exec(window.location.search);

    	this.label = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    	this.label = this.label == null ? "" : this.label;
    	console.log("Result of the query param search: " + this.label);
	};

	this.extractCookie = function(){
		
	};
	
	this.extractLocalStorage = function(){
		
	};
	
	//See if the appropriate signal can be detected
	this.checkSignal = function(){
		switch(this.signal){
			case "hashbang":
				this.checkHashbang();
				break;
			case "get":
				this.checkQueryParam();
				break;
			case "callback":
				if(typeof this.callback != 'undefined'){
					var workerArr = this.callback();
					this.label = workerArr['label'] != undefined ? workerArr['label'] : "";
					this.paranoidLabel = workerArr['paranoidLabel'] != undefined ? workerArr['paranoidLabel'] : "";
				}
				break;
			case undefined:
				console.log("No signal specified.");
				break;
			case "cookie":
			default:
				console.log("Yeah, we don't support that signal yet. Sorry. :/");
				break;
		}
	};
	
	
	//Set up or deactivate GA depending on all the stuff we've gathered.
	this.gaSetup = function(){
		
		window._gaq = [];
		window._gaq.push(['_setAccount', this.gaId]);
		
		console.log("The ignorelevel is: "+this.ignoreLevel);
		
		switch(this.ignoreLevel){
			case "paranoid":
				if(this.label.toLowerCase() == this.paranoidLabel.toLowerCase()){
					console.log("Paranoid mode activized. GA object not created, pageview not logged.");
					break;
				}
			case "ignore":
				if(this.label != ""){
					console.log("Ignore mode activized. Setting No_Track custom var.");
					window._gaq.push(['_setCustomVar', 1, "No_Track", this.label, 3]);
				}
				else{
					console.log("No label given. Proceeding as normal.");
				}
			case "normal":
			case undefined:
			default:
				console.log("Creating GA object...");
				window._gaq.push(['_trackPageview']);
				window.ga = document.createElement('script'); window.ga.type = 'text/javascript'; window.ga.async = true;
				window.ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/u/ga_debug.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				break;	
		}
		
	};
	
	
	//Actually build the object
	this.setOptions(options);
	this.checkSignal();
	this.gaSetup();
	
	return this;
}

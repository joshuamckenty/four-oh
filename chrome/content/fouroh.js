var log = null;
if ("undefined" != typeof console) {
  log = console.log;
} else {
  var t = Cc['@mozilla.org/consoleservice;1'].
    getService(Ci.nsIConsoleService);
  log = function log(x) { t.logStringMessage(x); };
}
log("Starting fouroh.js");
const fouroh_RAWURL = "www.spandexfox.com";
var fouroh_prefs = null;
var fourohhumanmsgcss = null;
var fourohcss = null;
var fouroh_controller = {
  log : null,
  
  version: Cc["@mozilla.org/extensions/manager;1"]
           .getService(Ci.nsIExtensionManager)
           .getItemForID("fouroh@spandexfox.com").version,
  SHOW_DELAY: 500,         
  onload: function() {
    if ("undefined" != typeof console) {
      fouroh_controller.log = console.log;
    } else {
      var t = Cc['@mozilla.org/consoleservice;1'].
        getService(Ci.nsIConsoleService);
      fouroh_controller.log = function log(x) { t.logStringMessage(x); };
    }
    
    fouroh_controller.log("Got onload in fouroh.");
    fouroh_prefs = Components.classes['@mozilla.org/preferences-service;1']
       .getService(Components.interfaces.nsIPrefService)
       .getBranch('extensions.fouroh.');
    var appcontent = window.document.getElementById("appcontent");
    if (appcontent) {
      if (!appcontent.greased_fouroh) {    
        var pageURL;
        var lastVersion = fouroh_prefs.getCharPref("lastversion");
        if (lastVersion == "firstrun") {
          if (fouroh_prefs.getPrefType("firstRunURL")) pageURL = fouroh_prefs.getCharPref("firstRunURL");
        } else if (lastVersion != fouroh_controller.version) {
          if (fouroh_prefs.getPrefType("upgradeURL")) pageURL = fouroh_prefs.getCharPref("upgradeURL");
        }

        fouroh_prefs.setCharPref("lastversion", fouroh_controller.version);
        if (pageURL && pageURL != "null") {
          setTimeout(function(){window.openUILinkIn(pageURL, "tab")}, this.SHOW_DELAY);
        }

        fouroh_controller.log("Greasing fouroh.");
        appcontent.greased_fouroh = true;
        
        fourohhumanmsgcss = fouroh_getURLContents("chrome://fouroh/content/humanmsg.css");
        fourohcss = fouroh_getURLContents("chrome://fouroh/content/fouroh.css");
        appcontent.addEventListener("DOMContentLoaded", do_fouroh, false);
        
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
          .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(fouroh_controller, "http-on-modify-request", false);
        
        fouroh_controller.jQuery = jQuery.noConflict(true);
      }
    }
  },
  QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsISupports)
                || iid.equals(Components.interfaces.nsISupportsWeakReference)
                || iid.equals(Components.interfaces.nsIWebProgressListener)
                || iid.equals(Components.interfaces.nsIHttpNotify)
                || iid.equals(Components.interfaces.nsIObserver)
                ) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },

   onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
      this.trap404(aWebProgress, aRequest, aStateFlags, aStatus); 
    },
    trap404: function (aWebProgress, aRequest, aStateFlags, aStatus) {
      if (aRequest.responseStatus == 404) {
        var sitehost = aRequest.originalURI.host;
        var querystring = aRequest.originalURI.path.replace(/\//g, " ");
        try { // already removed?
            aWebProgress.removeProgressListener(this);
        } catch(e) {}
        // XXX TODO - Don't redirect if google is throwing a 404
        aWebProgress.DOMWindow.location = "http://www.google.com/search?hl=en&btnI=true&q=site%3A" + sitehost  + "+" + querystring;
        window.setTimeout(function () {
          var appcontent = window.document.getElementById("appcontent");
          appcontent.showJoke = true; // XXX - Put on tab, not content area
        }, 1);
        
      }
    },
    onProgressChange: function (aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
    },
    onLocationChange: function(aWebProgress, aRequest, aLocation) {
    },
    onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
      this.trap404(aWebProgress, aRequest, null, aStatus); 
    },
    onSecurityChange: function(aWebProgress, aRequest, aState) {
    },
    observe: function(aSubject, aTopic, aData) {
    this.log("Got observe");
      if (aTopic == "http-on-modify-request") {
        this.log("Got http-on-modify-request.");
        this.onModifyRequest(aSubject);
      }
    },
    onModifyRequest: function(oHttp) {
        try {
          // oHttp.QueryInterface(Components.interfaces.nsIHttpChannel);
            oHttp.QueryInterface(Components.interfaces.nsIRequest);

            // We only need to register a listener if this is a document uri as all embeded object
            // are checked by the same listener (not true for frames but frames are document uri...)
            if ((oHttp.loadFlags & Components.interfaces.nsIChannel.LOAD_DOCUMENT_URI)
                    && oHttp.loadGroup
                    && oHttp.loadGroup.groupObserver
                    ) {
                var go = oHttp.loadGroup.groupObserver;
                go.QueryInterface(Components.interfaces.nsIWebProgress);
                go.addProgressListener(this, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
            }
        } catch(e) {}
    },
}

window.addEventListener("load", fouroh_controller.onload, false);


function do_fouroh(evt) {
  var log = null;
  if ("undefined" != typeof console) {
      log = console.log;
    } else {
      var t = Cc['@mozilla.org/consoleservice;1'].
        getService(Ci.nsIConsoleService);
      log = function log(x) { t.logStringMessage(x); };
    }
  log("Running fouroh_gui\n");
  var doc = new XPCNativeWrapper(evt.originalTarget, "top");
  if (!doc || !doc.body || (doc.defaultView.top != doc.defaultView.self)) return;

  var appcontent = window.document.getElementById("appcontent");
  if (appcontent.showJoke && doc.location.href) {
    log(doc.location.href);
    var pbGUI = new fouroh_gui(doc, "foo");
    appcontent.showJoke = false;
  }
/*
  var pirate_term = fouroh_get_pirate_bay_search(doc);
  if (pirate_term) {
     var pbGUI = new fouroh_gui(doc, pirate_term, "#SearchResults");
  }  
  */
}


function fouroh_gui(aDocument, aSearch_Term) {
  
  var log = null;
  if ("undefined" != typeof console) {
      log = console.log;
    } else {
      var t = Cc['@mozilla.org/consoleservice;1'].
        getService(Ci.nsIConsoleService);
      log = function log(x) { t.logStringMessage(x); };
    }
  log("Running fouroh_gui\n");
  
  var $ = fouroh_controller.jQuery;
  
  $("body", aDocument)
    .append("<style>\n" + fourohhumanmsgcss + "\n</style>"
          + "<style>\n" + fourohcss + "\n</style>");
  gzon_humanMsg.setup("body", null, null, aDocument);
  
  // Fetch JOKE Results
  log("Going to fetch joke...");
  $.get("http://jokes4all.net/rss/000110211/jokes.xml", null, 
    function (xmlDoc, textStatus) {
      log ("xml fetch status is " + textStatus);
      $("item", xmlDoc).each(function (foo) {
        log($("description", this).text());
        var joke = $("description", this).text();
        if (joke) gzon_humanMsg.displayMsg("<strong>Four-Oh:</strong><span class=\"indent\">" + joke + "</span>");
      });
      /*
      var jokenode = $("item description", xmlDoc).get(0);
      if (jokenode && jokenode.text) {
        var joke = jokenode.text();
        if (joke) gzon_humanMsg.displayMsg(joke);
      } else {
        //log(xmlDoc); 
        // for (x in xmlDoc) log (x);
        // log(xmlDoc.textContent); 
        // log (xmlDoc.childNodes.get(0).text());
      }*/
    }, "xml");
}

fouroh_gui.prototype = {
  
}

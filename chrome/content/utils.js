function fouroh_getURLContents(aURL){
  var fouroh_ios = Components
    .classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=fouroh_ios.newChannel(aURL,null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();
  return str;
}


function header_scanner(oHttp)
{
    // Keep the Http request object
    this.oHttp = oHttp;
    this.response = "";
    this.responseHeaders = [];
    this.visitResponse(this);
}

header_scanner.prototype =
{
    oHttp : null,
    headers : null,

    getHttpResponseVersion: function() {
        var maj = new Object();
        var min = new Object();
        this.oHttp.QueryInterface(Components.interfaces.nsIHttpChannelInternal);
        this.oHttp.getResponseVersion(maj, min);
        return ("" + maj.value + "." + min.value);
    },

    visitHeader : function(name, value) {
        this.theaders[name] = value;
    },
  
    visitResponse : function() {
        try {
            var ver = this.getHttpResponseVersion();
            this.response = "HTTP/" + ver + " " + this.oHttp.responseStatus + " " + this.oHttp.responseStatusText;
            
            this.theaders = new Array();
            this.oHttp.visitResponseHeaders(this);
            this.responseHeaders = this.theaders;
        } catch(e) {}
    },
}

function get_headers(aRequest) {
  var scheme = aRequest.QueryInterface(Components.interfaces.nsIChannel).URI.scheme;
  if (scheme == "http" || scheme == "https") {
        try {
            aRequest.QueryInterface(Components.interfaces.nsIHttpChannel);
        } catch(ex) {
            aRequest.QueryInterface(Components.interfaces.nsIMultiPartChannel);
            aRequest.baseChannel.QueryInterface(Components.interfaces.nsIHttpChannel);
        }
        return new header_scanner(aRequest);
  }
}

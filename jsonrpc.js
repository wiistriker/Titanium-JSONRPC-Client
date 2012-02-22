function JSONRPCClient(_endpoint) {
    var endpoint = _endpoint;
    
    function isBrowserEnvironment() {
        try {
            if (window && window.navigator) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    function isAppceleratorTitanium() {
        try {
            if (Titanium) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    
    function getXHR() {
        var xhr;
        if (isBrowserEnvironment()) {
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else if (isAppceleratorTitanium()) {
            xhr = Titanium.Network.createHTTPClient();
        }
        return xhr;
    }
    
    this.call = function(method, params, id, success, error) {
        var requestDataObject = this._requestDataObject(method, params, id);
        var requestString = JSON.stringify(requestDataObject);
        
        var xhr = getXHR();
        
        xhr.onload = function () {
            success.call(this, this.responseText);
        };
        xhr.open('POST', endpoint);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.send(requestString);
    }
    
    this._requestDataObject = function (method, params, id) {
        var dataObj = {
            jsonrpc: '2.0',
            method: method,
            id: id
        }
        if (typeof(params) !== 'undefined') {
            dataObj.params = params;
        }
        
        return dataObj;
    }
}
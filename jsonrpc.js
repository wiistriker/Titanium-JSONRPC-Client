function JSONRPCClient(_endpoint) {
    this.endpoint = _endpoint;
    this.version = '2.0';
    
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
    
    this.call = function(method, options) {
        var callParams, id;
        
        if (typeof options === 'undefined') {
            options = {};
        }
        
        if (typeof options.params !== 'undefined') {
            callParams = options.params;
        }
        
        if (typeof options.id !== 'undefined') {
            id = options.id;
        }
    
        var requestDataObject = this._requestDataObject(method, callParams, id);
        var requestString = JSON.stringify(requestDataObject);
        
        var xhr = getXHR();
        
        xhr.onload = function () {
            var responseObject;
            
            try {
                responseObject = JSON.parse(this.responseText);
            } catch (err) {
                if (typeof options.error === 'function') {
                    options.error(err);
                    return;
                }
            }
            
            if (typeof responseObject.result === 'undefined' || typeof responseObject.error !== 'undefined' ||
            typeof responseObject.id !== 'undefined') {
                //@todo: send error
            }
            
            if (responseObject.result) {
                if (typeof options.success === 'function') {
                    options.success(responseObject.result);
                }
            } else if (responseObject.error) {
                if (typeof options.error === 'function') {
                    options.error(responseObject.error);
                }
            }
        };
        
        xhr.open('POST', this.endpoint);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.send(requestString);
    }
    
    this._requestDataObject = function (method, params, id) {
        if (typeof id === 'undefined') {
            id = 1;
        }
    
        var dataObj = {
            jsonrpc: this.version,
            method: method,
            id: id
        }

        if (typeof params !== 'undefined' && params) {
            dataObj.params = params;
        }
        
        return dataObj;
    }
}
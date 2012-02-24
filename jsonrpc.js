JSONRPCClient = function (endpoint) {
	this._endpoint = endpoint;
};

JSONRPCClient.prototype = {
    call: function(method, options) {
        var callParams, id;
        
        if (typeof options !== 'undefined') {
            if (typeof options.params !== 'undefined') {
                callParams = options.params;
            }
            
            if (typeof options.id !== 'undefined') {
                id = options.id;
            }
        }
    
        var requestDataObject = this._requestDataObject(method, callParams, id);
        
        var xhr = this._getXHR();
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
            
            if (typeof responseObject.result === 'undefined' ||
                typeof responseObject.error !== 'undefined' ||
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
        
        xhr.open('POST', this._endpoint);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(requestDataObject);
    },
    
    _requestDataObject: function (method, params, id) {
        if (typeof id === 'undefined') {
            id = 1;
        }
    
        var dataObj = {
            jsonrpc: '2.0',
            method: method,
            id: id
        }

        if (typeof params !== 'undefined' && params) {
            dataObj.params = params;
        }
        
        return dataObj;
    },
    
    _isBrowserEnvironment: function() {
        try {
            if (window && window.navigator) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    },

    _isAppceleratorTitanium: function() {
        try {
            if (Titanium) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    },
    
    _getXHR: function() { 
        var xhr;
        if (this._isBrowserEnvironment()) {
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else if (this.isAppceleratorTitanium()) {
            xhr = Titanium.Network.createHTTPClient();
        }
        return xhr;
    }
}
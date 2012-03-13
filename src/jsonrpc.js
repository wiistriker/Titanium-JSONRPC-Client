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
        if (xhr) {
            xhr.open('POST', this._endpoint);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            var self = this;
            
            xhr.onload = function () {
                var responseObject;
                
                try {
                    responseObject = JSON.parse(this.responseText);
                } catch (err) {
                    self._errorCallback(options, {code: 0, message: 'undefined response'});
                    return;
                }
                
                if (typeof responseObject.result === 'undefined' ||
                    typeof responseObject.error === 'undefined' ||
                    typeof responseObject.id === 'undefined') {
                        self._errorCallback(options, {code: 0, message: 'undefined response'});
                        return;
                }
                
                if (responseObject.result) {
                    self._successCallback(options, responseObject.result);
                } else if (responseObject.error) {
                    self._errorCallback(options, responseObject.error);
                }
            };
            xhr.send(JSON.stringify(requestDataObject));
        } else {
            this._errorCallback(options, {code: 0, message: 'transport error'});
        }
    },
    
    _successCallback: function(options, result) {
        if (typeof options.success === 'function') {
            options.success(result);
        }
    },
    
    _errorCallback: function(options, result) {
        if (typeof options.error === 'function') {
            options.error(result);
        }
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

    _isAppceleratorEnvironment: function() {
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
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }
        } else if (this._isAppceleratorEnvironment()) {
            xhr = Titanium.Network.createHTTPClient();
        }
        return xhr;
    }
}
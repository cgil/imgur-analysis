(function(window, document, $){
	'use strict';

	$(document).ready(function() {
		get(api.delta(0)).done(function(data) {
			window.console.dir(data);
		});
	});

	//	API middle man
	var api = {
		url: 'http://54.82.42.98:28017/imgur/',
		delta: function(which) {
			return this.url + 'delta' + which + '/';
		},
		hour: function(which) {
			return this.url + 'hour' + which + '/';
		},
		weekday: function(which) {
			return this.url + 'weekday' + which + '/';
		},
		month: function(which) {
			return this.url + 'month' + which + '/';
		},
		year: function(which) {
			return this.url + 'year' + which + '/';
		}
	};

	//	Get helper
    var get = function(url) {
        var ret = new $.Deferred();
        $.getJSON(url + '?callback=?', {dataType: 'jsonp', crossDomain: true,}, function(data) {
        		var data = $.parseJSON(data);
        		console.log(data);
                ret.resolve(data);
        });
        return ret.promise();
    };



})(window, document, window.jQuery);
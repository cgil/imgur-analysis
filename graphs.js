(function(window, document, $){
	'use strict';

	$(document).ready(function() {
		get(api.delta(0)).done(function(data) {
			window.console.dir(data);
		});
	});

	//	API middle man
	var api = {
		url: 'http://54.82.42.98:5000/imgur/',
		delta: function(which, type) {
			type = typeof type !== 'undefined' ? type : '';
			return this.url + 'delta/' + which + '/' + type;
		},
		hour: function(which, type) {
			type = typeof type !== 'undefined' ? type : '';
			return this.url + 'hour/' + which + '/' + type;
		},
		weekday: function(which, type) {
			type = typeof type !== 'undefined' ? type : '';
			return this.url + 'weekday/' + which + '/' + type;
		},
		month: function(which, type) {
			type = typeof type !== 'undefined' ? type : '';
			return this.url + 'month/' + which + '/' + type;
		},
		year: function(which, type) {
			type = typeof type !== 'undefined' ? type : '';
			return this.url + 'year/' + which + '/' + type;
		}
	};

	//	Get helper
    var get = function(url) {
        var ret = new $.Deferred();
        $.getJSON(url, function(data) {
        		var data = $.parseJSON(data);
                ret.resolve(data);
        });
        return ret.promise();
    };



})(window, document, window.jQuery);
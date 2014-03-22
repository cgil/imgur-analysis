(function(window, document, $, d3, c3){
	'use strict';

	$(document).ready(function() {
		get(api.deltas('DeltaShot')).done(function(data) {
			data = modifyData(data, 'DeltaShot');
			generateChart(data, 'normalizedCaptions', ['token', 'counter', 'points', 'ups', 'downs'], 'spline', true);
		});

	});

	//	API middle man
	var api = {
		url: 'http://54.82.42.98:5000/',
		formUrl: function(col, type) {
			return this.url + col + '/' + type + '/';
		},
		deltas: function(type) {
			return this.formUrl('deltas', type);
		},
		hours: function(type) {
			return this.formUrl('hours', type);
		},
		weekdays: function(type) {
			return this.formUrl('weekdays', type);
		},
		months: function(type) {
			return this.formUrl('months', type);
		},
		years: function(type) {
			return this.formUrl('years', type);
		}
	};

	//	Get helper
    var get = function(url) {
        var ret = new $.Deferred();
        $.getJSON(url, function(data) {
			ret.resolve(data);
        });
        return ret.promise();
    };

    //	Remove unused keys in data object
    var modifyData = function(data, type) {
		var keys = [];
		if(type === 'ImageShot') {
			keys = ['index', 'shotType', 'startingScore', '_id'];
		}
		else {
			keys = ['index', 'shotType', 'bestScore', '_id'];
		}
		for(var i in data) {
			for(var j in keys) {
				delete data[i][keys[j]];
			}
		}
		return data;
    };

	//	Normalize data
    var normalize = function(n, min, max) {
		return (n-min)/(max-min);
    };

	var generateChart = function(data, chartId, fields, chartType, normalized) {

		var cols = new Array(fields.length);
		for(var i in data) {
			for(var j in fields) {
				if(typeof cols[j] === 'undefined') {
					cols[j] = [fields[j]];
				}
				var val = data[i][fields[j]];
				if(normalized === true || fields[j] !== 'token') {
					val = normalize(val, 0, d3.max(data, function(d) { return d[fields[j]]; }));
				}
				cols[j].push(val);
			}
		}

		$("#chartContainer").append("<div id='" + chartId + "'></div>");
		var chart = c3.generate({
			bindto: '#' + chartId,
			data: {
				x: 'token',
				columns: cols,
				type: chartType
			}
		});
	};


})(window, document, window.jQuery, window.d3, window.c3);
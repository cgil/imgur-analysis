(function(window, document, $, d3, c3){
	'use strict';

	$(document).ready(function() {
		get(api.deltas('DeltaShot')).done(function(data) {
			window.console.dir(data);
			generateChart(data);
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

    var normalize = function(n, min, max) {
		return (n-min)/(max-min);
    };

	var generateChart = function(data) {
		var x = ['x'];
		var counter = ['counter'];
		var points = ['points'];
		var ups = ['ups'];
		var downs = ['downs'];

		$.each(data, function(k, v){
			x.push(v.tokens);
			counter.push(normalize(v.counter, 0, d3.max(data, function(d) { return d.counter; })));
			points.push(normalize(v.points, 0, d3.max(data, function(d) { return d.points; })));
			ups.push(normalize(v.ups, 0, d3.max(data, function(d) { return d.ups; })));
			downs.push(normalize(v.downs, 0, d3.max(data, function(d) { return d.downs; })));
		});

		var chart = c3.generate({
			bindto: '#chart',
			data: {
				x: 'x',
				columns: [
					x,
					counter,
					points,
					ups,
					downs
				],
				type: 'spline'
			}
		});
	};


})(window, document, window.jQuery, window.d3, window.c3);
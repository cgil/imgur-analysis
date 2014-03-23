(function(window, document, $, d3, c3){
	'use strict';

	$(document).ready(function() {
		var graphTypes = ['hours', 'weekdays', 'months', 'years', 'deltas'];
		for(var g in graphTypes) {
			showCharts(graphTypes[g]);
		}
	});

	var showCharts = function(chartType) {
		var xlabel = '';
		var axes = {};
		if(chartType === 'hours') {
			xlabel = 'Time (hours-EST)';
		}
		else if(chartType === 'weekdays') {
			xlabel = 'Weekdays (Monday-Sunday)';
		}
		else if(chartType === 'months') {
			xlabel = 'Months';
		}
		else if(chartType === 'years') {
			xlabel = 'Years';
		}
		else {
			xlabel = 'Time delta (hours)';

			//	Deltas
			get(api[chartType]('DeltaShot')).done(function(data) {
				for(var i in data) {
					var totalMinutes = data[i]['token'] * 30;
					data[i]['token'] = totalMinutes/60;
				}
				var id = chartType + '-DeltaShot';
				var bulkContainer = id + '-container';
				$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
				data = removeKeys(data, 'DeltaShot');
				//	All data
				generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['Aggregate of comment points by ' + chartType, xlabel, 'Values'], false);
				// Multi-axis all data
				axes = {
					counter: 'y2',
					downs: 'y2'
				};
				generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['Aggregate of comment data by ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
				//	Normalized data
				generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['Normalized comment data by ' + chartType, xlabel, 'Values (normalized)'], true);
			});
			return;
		}
		//	Captions
		get(api[chartType]('CaptionShot')).done(function(data) {
			var id = chartType + '-CaptionShot';
			var bulkContainer = id + '-container';
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			data = removeKeys(data, 'CaptionShot');
			//	All data
			generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['Aggregate of comment points by ' + chartType, xlabel, 'Values'], false);
			// Multi-axis all data
			axes = {
				counter: 'y2',
				downs: 'y2'
			};
			generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['Aggregate of comment data by ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
			//	Normalized data
			generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['Normalized comment data by ' + chartType, xlabel, 'Values (normalized)'], true);
		});

		//	Images
		get(api[chartType]('ImageShot')).done(function(data) {
			var id = chartType + '-ImageShot';
			var bulkContainer = id + '-container';
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			data = removeKeys(data, 'ImageShot');
			//	All data
			generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs', 'views', 'virality', 'score'], 
				'spline', ['Aggregate of image points by ' + chartType, xlabel, 'Values'], false);
			// Multi-axis all data
			axes = {
				counter: 'y2',
				points: 'y2', 
				ups: 'y2', 
				downs: 'y2', 
				virality: 'y2', 
				score: 'y2'
			};
			generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs', 'views', 'virality', 'score'], 
				'spline', ['Aggregate of image points by ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
			//	Alt data
			generateChart(data, id+'-alt', bulkContainer, ['token', 'reddit', 'animated'], 
				'spline', ['Aggregate of alt data by ' + chartType, xlabel, 'Values'], false);
			//	Normalized data
			generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs', 'views', 'virality', 'score'], 
				'spline', ['Normalized image data by ' + chartType, xlabel, 'Values (normalized)'], true);
		});

	}

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
    var removeKeys = function(data, type) {
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

    //	Hashes input string and creates corresponding hex color value
	var stringToColor = function(str) {
		var hash = 0;
		for (var i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		var color = '#';
		for (var j = 0; j < 3; j++) {
			var value = (hash >> (j * 8)) & 0xFF;
			color += ('00' + value.toString(16)).substr(-2);
		}
		return color;
	};

	var generateChart = function(data, chartId, bulkContainer, fields, chartType, axisLabels, normalized, axes) {
		if(typeof axes === 'undefined') {
			axes = {};
		}
		//	Restructure data to [['field1', val1, val2, ...], ...]
		var cols = new Array(fields.length);
		for(var i in data) {
			for(var j in fields) {
				if(typeof cols[j] === 'undefined') {
					cols[j] = [fields[j]];
				}
				var val = data[i][fields[j]];
				if(normalized === true && fields[j] !== 'token') {
					val = normalize(val, 0, d3.max(data, function(d) { return d[fields[j]]; }));
				}
				cols[j].push(val);
			}
		}

		$('#' + bulkContainer).append("<div class='chartBlock'><span class='chartTitle'>" + axisLabels[0] + 
			"</span><div class='chart' id='" + chartId + "'></div></div>");
		var chart = c3.generate({
			bindto: '#' + chartId,
			data: {
				x: 'token',
				columns: cols,
				type: chartType,
				axes: axes			},
			axis: {
				x: {
					label: axisLabels[1]		
				},
				y: {
					label: axisLabels[2]
				},
				y2: {
					show: true
				}
			},
			color: {
				pattern: fields.map(stringToColor)
			},
			size: {
				height: 240,
				width: 480
			}
		});
	};


})(window, document, window.jQuery, window.d3, window.c3);
(function(window, document, $, d3, c3){
	'use strict';

	var graphy = window.graphy = {};

	graphy.data = {};
	$.getJSON('./export/imgur.json', function(data) { 
		graphy.data = data;
	}); 

	graphy.getData = function(set, type, remote) {
		var shot = '';
		if(type === 'comments') {
			shot = 'CaptionShot';
		}
		else if(type === 'images') {
			shot = 'ImageShot';
		}
		else {
			shot = 'DeltaShot';
		}
		if(remote === true) {
			return get(api[set](shot)).then(function(data) {
				return modifyData(data, shot);
			});
		}
		else {
			set = set.replace(/s+$/, "");
			return modifyData(graphy.data[set][shot], shot);
		}
	};

	graphy.selectionFactory = function(title, id, data) {
		var len = data.length;
		var text = '<div class="skin-section" id="' + id + '">'		+
						'<h4>' + title + '</h4>'	+
						'<ul class ="list">';
		for(var i=0; i < len; i++) {
			if(data[i]['type'] === 'radio') {
				text += '<li>';
				text += '<input type="radio" id="' + id+'-'+i + '" name="' + id + '" value="' + data[i]['name'] + '">';
				text += '<label for ="' + id+'-'+i + '">' + data[i]['name'] + '</label>';
				text += '</li>';
			}
			else if(data[i]['type'] === 'checkbox') {
				text += '<li>';
				text += '<input type="checkbox" id="' + id+'-'+i + '"value="' + data[i]['name'] + '">';
				text += '<label for ="' + id+'-'+i + '">' + data[i]['name'] + '</label>';
				text += '</li>';
			}
			else if(data[i]['type'] === 'text') {
				text +=	'<li class="textInput">';
				text +=	'<input class="textBox" type="textbox" id="' + id+'-'+i + '" placeholder="' +
							data[i]['placeholder'] + '"></input>';
				text += '</li>';
			}
			else {
				text += '<a id="' + id+'-'+i + '" href="#" class="button">' + data[i]['name'] + '</a>';
			}
		}
		text +=			'</ul>'	+
					'</div>';
		$('#selectionContainer').append(text);

	};

	graphy.showCharts = function(chartType) {
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
				data = modifyData(data, 'DeltaShot');
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
				//	Data per counter
				generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
					'spline', ['Aggregate comment data/counter by ' + chartType, xlabel, 'Values/Counter'], false);
				//	Data per counter normalized
				generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
					'spline', ['Normalized comment data/counter by ' + chartType, xlabel, 'Values/Counter (normalized)'], true);
			});
			return;
		}
		//	Captions
		get(api[chartType]('CaptionShot')).done(function(data) {
			var id = chartType + '-CaptionShot';
			var bulkContainer = id + '-container';
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			data = modifyData(data, 'CaptionShot');
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
			//	Data per counter
			axes = {
				downsPerCounter: 'y2'
			};
			generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
				'spline', ['Aggregate comment data/counter by ' + chartType, xlabel, 'Values/Counter'], false, axes);
			//	Data per counter normalized
			generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
				'spline', ['Normalized comment data/counter by ' + chartType, xlabel, 'Values/Counter (normalized)'], true);
		});

		//	Images
		get(api[chartType]('ImageShot')).done(function(data) {
			var id = chartType + '-ImageShot';
			var bulkContainer = id + '-container';
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			data = modifyData(data, 'ImageShot');
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
			//	Data per counter
			axes = {
				pointsPerCounter: 'y2', 
				upsPerCounter: 'y2', 
				downsPerCounter: 'y2', 
				viralityPerCounter: 'y2', 
				scorePerCounter: 'y2'
			};
			generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter', 'viewsPerCounter', 'viralityPerCounter', 'scorePerCounter'], 
				'spline', ['Aggregate comment data/counter by ' + chartType, xlabel, 'Values/Counter'], false, axes);
			//	Data per counter normalized
			generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter', 'viewsPerCounter', 'viralityPerCounter', 'scorePerCounter'], 
				'spline', ['Normalized image data/counter by ' + chartType, xlabel, 'Values/Counter (normalized)'], true);
		});

	};

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
			for(var i in data) {
				for(var j in keys) {
					delete data[i][keys[j]];
					data[i]['pointsPerCounter'] = data[i]['points']/data[i]['counter'];
					data[i]['upsPerCounter'] = data[i]['ups']/data[i]['counter'];
					data[i]['downsPerCounter'] = data[i]['downs']/data[i]['counter'];
					data[i]['viewsPerCounter'] = data[i]['views']/data[i]['counter'];
					data[i]['viralityPerCounter'] = data[i]['virality']/data[i]['counter'];
					data[i]['scorePerCounter'] = data[i]['score']/data[i]['counter'];
				}
			}
		}
		else {
			keys = ['index', 'shotType', 'bestScore', '_id'];
			for(var i in data) {
				for(var j in keys) {
					delete data[i][keys[j]];
					data[i]['pointsPerCounter'] = data[i]['points']/data[i]['counter'];
					data[i]['upsPerCounter'] = data[i]['ups']/data[i]['counter'];
					data[i]['downsPerCounter'] = data[i]['downs']/data[i]['counter'];
				}
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
			},
			tooltip: {
				show: false
			}
		});
	};


	graphy.generate = function(data, chartId, bulkContainer, selections, options) {
		$('#' + bulkContainer).empty();
		var fields = $.unique(selections['xaxis'].concat(selections['y1axis'], selections['y2axis']));
		var axes = {};
		for(var s in selections['y1axis']) {
			axes[selections['y1axis'][s]] = 'y';
		}
		for(var s2 in selections['y2axis']) {
			axes[selections['y2axis'][s2]] = 'y2';
		}

		//	Restructure data to [['field1', val1, val2, ...], ...]
		var cols = new Array(fields.length);
		var normalized = false;
		if($.inArray('normalized', selections['options']) > -1) {
			normalized = true;
		}
		for(var i in data) {
			for(var j in fields) {
				if(typeof cols[j] === 'undefined') {
					cols[j] = [fields[j]];
				}
				var val = data[i][fields[j]];
				if(normalized === true && fields[j] !== selections['xaxis'][0]) {
					val = normalize(val, 0, d3.max(data, function(d) { return d[fields[j]]; }));
				}
				cols[j].push(val);
			}
		}
		$('#' + bulkContainer).append("<div class='chartBlock'><span class='chartTitle'>" + selections['axislabels']['title'] + 
			"</span><div class='chart' id='" + chartId + "'></div></div>");
		var chart = c3.generate({
			bindto: '#' + chartId,
			data: {
				x: selections['xaxis'][0],
				columns: cols,
				type: selections['charttype'][0] || 'line',
				axes: axes			
			},
			axis: {
				x: {
					label: selections['axislabels']['x-axis-label']		
				},
				y: {
					label: selections['axislabels']['y1-axis-label']
				},
				y2: {
					show: selections['y2axis'].length > 0 ? true : false,
					label: selections['axislabels']['y2-axis-label']
				}
			},
			color: {
				pattern: fields.map(stringToColor)
			},
			size: options['size'] ? options['size'] : 
				{
					height: 240,
					width: 480
				},
			tooltip: options['tooltip'] ? options['size'] :
				{
					show: false
				}
		});
	};


})(window, document, window.jQuery, window.d3, window.c3);
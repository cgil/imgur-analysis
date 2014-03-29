(function(window, document, $, d3, c3){
	'use strict';

	var graphy = window.graphy = {};

	graphy.setData = function() {
		var ret = new $.Deferred();
		$.getJSON('./export/imgur.json', function(data) { 
			graphy.data = data;
			ret.resolve(true); 
		}); 
		return ret.promise();
	};

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
			var ret = new $.Deferred();
			if(typeof graphy.data === 'undefined' || $.isEmptyObject(graphy.data)) {
				$.getJSON('./export/imgur.json', function(data) { 
					graphy.data = data;
					var modData = modifyData(graphy.data[set][shot], shot);
					ret.resolve(modData); 
				}); 
			}
			else {
				var modData = modifyData(graphy.data[set][shot], shot);
				ret.resolve(modData); 
			}

			return ret.promise();
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
			graphy.getData(chartType, 'deltas').done(function(data) {
				for(var i in data) {
					var totalMinutes = data[i]['token'] * 30;
					data[i]['token'] = totalMinutes/60;
				}
				var id = chartType + '-DeltaShot';
				var bulkContainer = id + '-container';
				$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
				graphy.addInfo(5, '#'+bulkContainer);
				data = modifyData(data, 'DeltaShot');
				//	All data
				generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['Comment data by ' + chartType, xlabel, 'Values'], false);
				// Multi-axis all data
				axes = {
					counter: 'y2',
					downs: 'y2'
				};
				generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['Comment data by ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
				//	Normalized data
				generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['Normalized comment data by ' + chartType, xlabel, 'Values (normalized)'], true);
				//	Data per counter
				generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
					'spline', ['Comment data/counter by ' + chartType, xlabel, 'Values/Counter'], false);
				//	Data per counter normalized
				generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
					'spline', ['Normalized comment data/counter by ' + chartType, xlabel, 'Values/Counter (normalized)'], true);

				graphy.addInfo(6, '#chartContainer');
			});
			return;
		}
		//	Captions
		graphy.getData(chartType, 'comments').done(function(data) {
			var id = chartType + '-CaptionShot';
			var bulkContainer = id + '-container';
			var infoIndex = 1;
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			if(chartType === 'hours') {
				infoIndex = 1;
			}
			else if(chartType === 'weekdays') {
				infoIndex = 2;
			}
			else if(chartType === 'months') {
				infoIndex = 3;
			}
			else if(chartType === 'years') {
				infoIndex = 4;
			}
			graphy.addInfo(infoIndex, '#'+bulkContainer);
			data = modifyData(data, 'CaptionShot');
			//	All data
			generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['Comment data by ' + chartType, xlabel, 'Values'], false);
			// Multi-axis all data
			axes = {
				counter: 'y2',
				downs: 'y2'
			};
			generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['Comment data by ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
			//	Normalized data
			generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['Normalized comment data by ' + chartType, xlabel, 'Values (normalized)'], true);
			//	Data per counter
			axes = {
				downsPerCounter: 'y2'
			};
			generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
				'spline', ['Comment data/counter by ' + chartType, xlabel, 'Values/Counter'], false, axes);
			//	Data per counter normalized
			generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
				'spline', ['Normalized comment data/counter by ' + chartType, xlabel, 'Values/Counter (normalized)'], true);
		});

		//	Images
		graphy.getData(chartType, 'images').done(function(data) {
			var id = chartType + '-ImageShot';
			var bulkContainer = id + '-container';
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			data = modifyData(data, 'ImageShot');
			//	All data
			generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs', 'views', 'virality', 'score'], 
				'spline', ['Image data by ' + chartType, xlabel, 'Values'], false);
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
				'spline', ['Image data by ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
			//	Alt data
			generateChart(data, id+'-alt', bulkContainer, ['token', 'reddit', 'animated'], 
				'spline', ['Alt data by ' + chartType, xlabel, 'Values'], false);
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
				'spline', ['Comment data/counter by ' + chartType, xlabel, 'Values/Counter'], false, axes);
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

	graphy.addInfo = function(i, id) {
		var infos = [];
		var customLink = window.location.origin + window.location.pathname + "custom.html";
		//	Graph info -0
		infos.push(
			"The visualizations below are a representations of the <strong>imgur</strong> data set, acquired by scraping their public site. <br/>" + 
			"Using these graphs I tried to find interesting correlations in the data over different time periods. <br/>" +
			"A lot of assumptions have been made, most importantly that most users are in the U.S. <br/>" +
			"This new data set is a simple aggregate of points, ups, downs and so on over the past 4 years (2011-March 2014). <br/>" +
			"There are 5 data sets (or groupings) for which I collected data. <br/>" + 
			"These are: <strong>hours, weekdays, months, years, and deltas</strong> <br/>" +
			"Additionally there are 3 data types: <strong>images, comments, and deltas</strong> <br/>" +
			"Terms: <br/>" +
			"-deltas: time difference between an image being posted and a comment associated with that image <br/>" +
			"-counter: total number of items posted (image or post) <br/>" +
			"-reddit : whether the image posted came from reddit <br/>" +
			"-animated: whether the image posted is animated <br/>" +
			"-data/counter: the given data type (points, ups...) divided by the counter for the given time period. <br/>" +
			"-token: a time lapse (hours, weekdays, months, years) <br/>" +
			"Jump into the data below or create your own <a href='" + customLink + "'> <strong>custom graphs </strong></a>"
		);
		//	Hours -1
		infos.push(
			"<strong>Data grouping by hour.</strong> <br/>" +
			"It's interesting to note how much imgur is used during the work day. " + 
			"Check out how there's a steady increase in activity between 9am - 5pm. <br/>" +
			"Additionally, although the highest amount of points are given for posts at 5pm, <br/>" +
			"data/counter shows that 11am is your best bet at maximizing points, as the total points per post peaks."
		);
		//	Weekdays -2
		infos.push(
			"<strong>Data grouping by weekdays. Where 0=Monday and 6=Sunday</strong> <br/>" +
			"This is great, showing how important imgur is for our surival during the weekdays. <br/>" +
			"We can see a steady use over the weekdays and a sharp decline of use starting on Fridays and spiking again on Sundays. <br/>" +
			"This leaves Saturdays as the day imgurians risk venturing into the outside world. <br/>" +
			"To maximize points: post comments on Sundays and post new images on Wednesdays."
		);
		//	Months -3
		infos.push(
			"<strong>Data grouping by months. Where 1=January and 12=December</strong> <br/>" +
			"Imgur users hate the cold, with overall use almost doubling during winter months compared to summer. <br/>" +
			"Lesson learned: Follow the trend and go outside during summer! It seems as if the heat makes imgurians grouchy with downs/counter spiking in July."
		);
		//	Years -4
		infos.push(
			"<strong>Data grouping by years.</strong> <br/>" +
			"It's pretty amazing to see how much imgur has grown in a few short years. <br/>" +
			"From 2011 to 2013, there are 10x more comments posted per year and 2x more images posted per year. <br/>" +
			"In 2013 alone, over 72,000 images were posted. <br/>" +
			"Best of all points per post is increasing almost linearly over the years, making every day the best day to make a new post."
		);
		//	Deltas -5
		infos.push(
			"<strong>Data grouping by deltas. Or, time difference between an image being posted and a comment on that image being posted. <br/>" +
			"Where 0=immediately after, 22=22 hours after the image was posted, and 23=23 hours through infinity <br/>" +
			"We can immediately see that to maximize points on your comments you need to post a comment within the first hour <br/>" +
			"of a new image being posted. <br/>" +
			"After 6 hours of a new image being posted, commenting on that image is no longer an efficient way to earn points."

		);
		//	Closing remarks -6
		infos.push(
			"Feel free to play with the data and make your own custom graphs! <br/>" +
			"Both can be found here: <a href='" + customLink + "'> <strong>custom graphs </strong></a>"
		);
		var elems = '<div class="info"><p>' + infos[i] + '</p></div>';
		$(id).append(elems);
	};


})(window, document, window.jQuery, window.d3, window.c3);
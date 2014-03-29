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
					'spline', ['comment data vs. ' + chartType, xlabel, 'Values'], false);
				// Multi-axis all data
				axes = {
					counter: 'y2',
					downs: 'y2'
				};
				generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['comment data vs. ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
				//	Normalized data
				generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
					'spline', ['normalized comment data vs. ' + chartType, xlabel, 'Values (normalized)'], true);
				//	Data per counter
				generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
					'spline', ['comment data/counter vs. ' + chartType, xlabel, 'Values/Counter'], false);
				//	Data per counter normalized
				generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
					'spline', ['normalized comment data/counter vs. ' + chartType, xlabel, 'Values/Counter (normalized)'], true);

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
				'spline', ['comment data vs. ' + chartType, xlabel, 'Values'], false);
			// Multi-axis all data
			axes = {
				counter: 'y2',
				downs: 'y2'
			};
			generateChart(data, id+'-multi', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['comment data vs. ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
			//	Normalized data
			generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs'], 
				'spline', ['normalized comment data vs. ' + chartType, xlabel, 'Values (normalized)'], true);
			//	Data per counter
			axes = {
				downsPerCounter: 'y2'
			};
			generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
				'spline', ['comment data/counter vs. ' + chartType, xlabel, 'Values/Counter'], false, axes);
			//	Data per counter normalized
			generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter'], 
				'spline', ['normalized comment data/counter vs. ' + chartType, xlabel, 'Values/Counter (normalized)'], true);
		});

		//	Images
		graphy.getData(chartType, 'images').done(function(data) {
			var id = chartType + '-ImageShot';
			var bulkContainer = id + '-container';
			$('#chartContainer').append("<div class='bulkContainer' id='" + bulkContainer + "'></div>");
			data = modifyData(data, 'ImageShot');
			//	All data
			generateChart(data, id+'-all', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs', 'views', 'virality', 'score'], 
				'spline', ['image data vs. ' + chartType, xlabel, 'Values'], false);
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
				'spline', ['image data vs. ' + chartType + ' multi-axis', xlabel, 'Values'], false, axes);
			//	Alt data
			generateChart(data, id+'-alt', bulkContainer, ['token', 'reddit', 'animated'], 
				'spline', ['alt data vs. ' + chartType, xlabel, 'Values'], false);
			//	Normalized data
			generateChart(data, id+'-norm', bulkContainer, ['token', 'counter', 'points', 'ups', 'downs', 'views', 'virality', 'score'], 
				'spline', ['normalized image data vs. ' + chartType, xlabel, 'Values (normalized)'], true);
			//	Data per counter
			axes = {
				pointsPerCounter: 'y2', 
				upsPerCounter: 'y2', 
				downsPerCounter: 'y2', 
				viralityPerCounter: 'y2', 
				scorePerCounter: 'y2'
			};
			generateChart(data, id+'-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter', 'viewsPerCounter', 'viralityPerCounter', 'scorePerCounter'], 
				'spline', ['comment data/counter vs. ' + chartType, xlabel, 'Values/Counter'], false, axes);
			//	Data per counter normalized
			generateChart(data, id+'-norm-ppc', bulkContainer, ['token', 'pointsPerCounter', 'upsPerCounter', 'downsPerCounter', 'viewsPerCounter', 'viralityPerCounter', 'scorePerCounter'], 
				'spline', ['normalized image data/counter vs. ' + chartType, xlabel, 'Values/Counter (normalized)'], true);
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

	//	Deprecated by generate(), but don't feel like porting things over right now.
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
				height: 280,
				width: 540
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
		var infoLink = window.location.origin + window.location.pathname + "info.html";
		//	Graph info -0
		infos.push(
			"<p>" +
			"The visualizations below are a representations of the <strong>imgur</strong> data set over the past 4 years. <br/>" + 
			"Check out some of my graphs or create your own <a href='" + customLink + "'>pretty graphs</a> <br/><br/>" + 
			"<strong>Important terms:</strong>" +
			"</p>" +
			"<ul>" +
			"<li><div class='tab'>deltas</div> : time difference between an image being posted and a comment associated with that image</li>" +
			"<li><div class='tab'>counter</div> : total number of items posted (image or post) </li>" +
			"<li><div class='tab'>reddit</div> : whether the image posted came from reddit </li>" +
			"<li><div class='tab'>animated</div> : whether the image posted is animated </li>" +
			"<li><div class='tab'>data/counter</div> : the given data type (points, ups...) divided by the counter for the given time period. </li>" +
			"<li><div class='tab'>token</div> : a time lapse (hours, weekdays, months, years) </li>" +
			"</ul> <br/>" +
			"<p>" +
			"<strong>Still confused?</strong> Get more information on the project here: " + "<a href='" + infoLink + "'>help I'm lost!</a> <br/><br/>" +
			"</p>"


		);
		//	Hours -1
		infos.push(
			"<p>" +
			"<strong>Data grouping by hour.</strong> <br/>" +
			"Drop those TPS reports and jump on imgur. You can't make it through a 9 to 5 day without it! <br/>" + 
			"The highest amount of points are given for posts at 5pm, <strong>but</strong> data/counter shows that you should... <br/>" +
			"<strong>Post at 11 am!</strong> 11 am is your best bet at <strong>maximizing points.</strong>" +
			"</p>" 
		);
		//	Weekdays -2
		infos.push(
			"<p>" +
			"<strong>Data grouping by weekdays. Where 0=Monday and 6=Sunday</strong> <br/>" +
			"Imgur is the <strong>lifeblood</strong> of the work week! <br/>" +
			"We can see a steady use over the weekdays and a sharp decline of use starting on Fridays and spiking again on Sundays. <br/>" +
			"This leaves Saturdays as the day <strong>imgurians risk venturing into the outside world.</strong> <br/>" +
			"To maximize points you should <strong>post comments on Sundays and post new images on Wednesdays.</strong>" +
			"</p>"
		);
		//	Months -3
		infos.push(
			"<p>" +
			"<strong>Data grouping by months. Where 1=January and 12=December</strong> <br/>" +
			"It's too cold to go outside! More cats! <br/>" +
			"Imgur users hate the cold, with overall use almost <strong>doubling</strong> during winter months compared to summer. <br/>" +
			"Lesson learned: Follow the trend and go outside during summer! It seems as if <strong>the heat makes imgurians grouchy</strong> with downs/counter spiking in July." +
			"</p>"
		);
		//	Years -4
		infos.push(
			"<p>" +
			"<strong>Data grouping by years.</strong> <br/>" +
			"Help! Imgur is expanding out of control! <br/>" +
			"From 2011 to 2013, there are <strong>10x more comments</strong> posted per year and <strong>2x more images</strong> posted per year. <br/>" +
			"In 2013 alone, over 72,000 images were posted. <br/>" +
			"Best of all, points per post are reaching record highs! Making <strong>every day the best day to make a new post!</strong>" +
			"</p>"
		);
		//	Deltas -5
		infos.push(
			"<p>" +
			"<strong>Data grouping by deltas. </strong>" +
			"<strong>Where 0=immediately after, 22=22 hours after the image was posted, and 23=23 hours through infinity </strong> <br/>" +
			"There's no time left! Comment faster! <br/>" +
			"To maximize comment points you need to <strong>post a comment within the first hour </strong> of a new image being posted. <br/>" +
			"If you take longer than 6 hours... <strong>you've lost the game!</strong>" +
			"</p>"

		);
		//	Closing remarks -6
		infos.push(
			"<p>" +
			"Hope you found this interesting! If you want, have some fun with the data and make some pretty graphs! <br/>" +
			"Go here: <a href='" + customLink + "'> <strong>make pretty graphs </strong></a>" +
			"</p>"
		);
		var elems = '<div class="info">' + infos[i] + '</div>';
		$(id).append(elems);
	};


})(window, document, window.jQuery, window.d3, window.c3);
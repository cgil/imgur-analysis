(function(window, document, $, d3){
	'use strict';

	$(document).ready(function() {
		get(api.hours('CaptionShot')).done(function(data) {
			window.console.dir(data);
			lineChart(data);
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



	var lineChart = function(data) {
		
		// define dimensions of graph
		var m = [80, 80, 80, 100]; // margins
		var w = 1000 - m[1] - m[3]; // width
		var h = 400 - m[0] - m[2]; // height

		// X scale will fit all values from data[] within pixels 0-w
		var x = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.token; })]).range([0, w]);
		// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
		var y = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.counter; })]).range([h, 0]);

		// create a line function that can convert data[] into x and y points
		var line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) { 
				// return the X coordinate where we want to plot this datapoint
				return x(i); 
			})
			.y(function(d) { 
				// return the Y coordinate where we want to plot this datapoint
				return y(d.counter); 
			});

		// Add an SVG element with the desired dimensions and margin.
		var graph = d3.select("#graph").append("svg")
			.attr("width", w + m[1] + m[3])
			.attr("height", h + m[0] + m[2])
			.append("g")
				.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

		// create yAxis
		var xAxis = d3.svg.axis().scale(x).ticks(d3.max(data, function(d) { return d.token; })).tickSize(-h).tickSubdivide(true);
		// Add the x-axis.
		graph.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis);

		// create left yAxis
		var yAxisLeft = d3.svg.axis().scale(y).orient("left");
		// Add the y-axis to the left
		graph.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(-25,0)")
			.call(yAxisLeft);
		
		// Add the line by appending an svg:path element with the data line we created above
		// do this AFTER the axes above so that the line is above the tick-lines

		$.each(['counter', 'points', 'ups', 'downs', 'bestScore'], function(k, v) {
			graph.append("path")
				.attr("d", line(data));
		});

	};







})(window, document, window.jQuery, window.d3);
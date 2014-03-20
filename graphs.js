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

	var margin = {top: 20, right: 80, bottom: 30, left: 100},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	// var parseDate = d3.time.format("%Y%m%d").parse;

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return x(d.token); })
		.y(function(d) { return y(d.counter); });

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	color.domain(d3.keys(data[0]).filter(function(key) { return key !== "token"; }));

	// var cities = color.domain().map(function(name) {
	// 	return {
	// 		name: name,
	// 		values: data.map(function(d) {
	// 			return {date: d.date, temperature: +d[name]};
	// 		})
	// 	};
	// });

	x.domain(d3.extent(data, function(d) { return d.token; }));
	y.domain(d3.extent(data, function(d) { return d.counter; }));

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
			.attr("x", width / 2 )
			.attr("y", 30)
			.style("text-anchor", "middle")
			.text("Time");

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Count");

	var info = svg.selectAll(".info")
		.data(data)
		.enter().append("g")
			.attr("class", "info");

	info.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.style("stroke", function(d) { return color(d.token); });

	info.append("text")
		.datum(function(d) { return {token: d.token, counter: d.counter}; })
		.attr("transform", function(d) { return "translate(" + x(d.token) + "," + y(d.counter) + ")"; })
		.attr("x", 3)
		.attr("dy", ".35em")
		.text(function(d) { return d.token; });

};







})(window, document, window.jQuery, window.d3);
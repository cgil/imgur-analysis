(function(window, document, $){
	'use strict';

	$(document).ready(function() {
		get(api.delta(0)).done(function(data) {
			window.console.dir(data);
		});
	});

	//	API middle man
	var api = {
		url: 'http://54.82.42.98:5000/',
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
			ret.resolve(data);
        });
        return ret.promise();
    };



var lineChart = function() {

	var margin = {top: 20, right: 80, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y%m%d").parse;

	var x = d3.time.scale()
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
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.temperature); });

	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv("data.tsv", function(error, data) {
	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

	  data.forEach(function(d) {
	    d.date = parseDate(d.date);
	  });

	  var cities = color.domain().map(function(name) {
	    return {
	      name: name,
	      values: data.map(function(d) {
	        return {date: d.date, temperature: +d[name]};
	      })
	    };
	  });

	  x.domain(d3.extent(data, function(d) { return d.date; }));

	  y.domain([
	    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
	    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
	  ]);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Temperature (ºF)");

	  var city = svg.selectAll(".city")
	      .data(cities)
	    .enter().append("g")
	      .attr("class", "city");

	  city.append("path")
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", function(d) { return color(d.name); });

	  city.append("text")
	      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
	      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
	      .attr("x", 3)
	      .attr("dy", ".35em")
	      .text(function(d) { return d.name; });
	});



};







})(window, document, window.jQuery);
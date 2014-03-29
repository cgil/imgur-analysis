(function(window, document, $, d3, c3) {
	"use strict";

	var custom = window.custom = {};

	var SELECTIONS = {};
	//	Initialize iCheck
	var initiCheck = function(sel) {
		$(sel).iCheck({
			checkboxClass: 'icheckbox_flat-red',
			radioClass: 'iradio_flat-red'
		});
	};

	//	Form the selections object
	var setSelections = function(data) {
		var fields = Object.keys(data[0]);
		var chartTypes = ['line', 'spline', 'bar', 'scatter', 'pie', 'donut', 'area', 'area-spline'];
		var axisLabelPlaceholders = ['title', 'x-axis-label', 'y1-axis-label', 'y2-axis-label'];
		var options = ['normalized'];
		SELECTIONS = {
			'xaxis': { name: 'x-Axis', items: makeSelItem(fields, 'radio') },
			'y1axis': { name: 'y1-Axis', items: makeSelItem(fields, 'checkbox') },
			'y2axis': { name: 'y2-Axis', items: makeSelItem(fields, 'checkbox') },
			'charttype': { name: 'Chart type', items: makeSelItem(chartTypes, 'radio') },
			'options': { name: 'Options', items: makeSelItem(options, 'checkbox') },
			'axislabels': { name: 'Axis labels', id: 'axislabels', 
				items: axisLabelPlaceholders.map(function(d) { return { name: d, placeholder: d, type: 'text' }; }) },
			'generate': { name: 'Generate graph', items: [{type: 'button', name: 'Go!'}] }
		};
		return SELECTIONS;
	};

	//	Form one selection item object
	var makeSelItem = function(data, checkType) {
		return data.map(function(d) { return { name: d, type: checkType }; });
	};

	//	Remove all of the selections
	var removeMainSelections = function() {
		for(var key in SELECTIONS) {
			$('#'+key).remove();	
		}
	};

	var getSelections = function() {
		var selObj = {};
		var val = [];
		for(var key in SELECTIONS) {
			var sel = SELECTIONS[key];
			if(typeof sel['items'] === 'undefined' || sel['items'].length === 0)
				continue;
			if(sel.items[0]['type'] === 'radio') {
				var found = $('input[name='+ key +']:checked', '#' + key).val();
				if(typeof found !== 'undefined') {
					val = [$('input[name='+ key +']:checked', '#' + key).val()];
				}
				else {
					val = [];
				}
			}
			else if(sel.items[0]['type'] === 'checkbox') {
				val = $('#' + key + ' input:checked').map(function(i, el){ return el.value; }).get() || []; 
			}
			else if(sel.items[0]['type'] === 'text') {
				val = {};
				$('#' + key).find(":input").each(function() {
					val[this.placeholder] = this.value;
				}).get();
			}
			else {
				val = [];
			}

			if(key !== 'generate') {
				selObj[key] = val;
			}
		}
		return selObj;
	};

	var createMainSelections = function(data) {
		if(typeof data === 'undefined' || data.length === 0)
			return;
		var sels = setSelections(data);
		for(var i in sels) {
			window.graphy.selectionFactory(sels[i]['name'], i, sels[i]['items']);
		}
		initiCheck('input');
		$('#selectionContainer').on('click', '.button', function(event) {
			var dataset = $('input[name=dataset]:checked', '#dataset').val();
			var datatype = $('input[name=datatype]:checked', '#datatype').val();
			var selections = getSelections();
			var graphOptions = {
				size: {
					height: 400,
					width: 1000
				}
			};
			window.graphy.generate(data, 'custom', 'customChart', selections, graphOptions);
			var selData = selections;
			selData['dataset'] = dataset;
			selData['datatype'] = datatype;
			var link = window.location.origin + window.location.pathname + '?sels=' + encodeURIComponent(JSON.stringify(selData));
			var shareCont = '<span>share graph: </span><textarea id="shareLink" wrap="off" rows="1" cols="60" readonly>' + link + '</textarea>';
			$('#share').empty();
			$('#share').append(shareCont);
			event.preventDefault();
		});
	};

	var dataOptions = {
		hours : ['comments', 'images'],
		weekdays : ['comments', 'images'],
		months : ['comments', 'images'],
		years : ['comments', 'images'],
		deltas : ['deltas']
	};

	var getUrlParam = function(name) {
		var vars = {}, hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars[hash[0]] = hash[1];
		}

		if(typeof name !== 'undefined' && $.inArray(name, vars)) {
			return vars[name];
		}
		return vars;
	};

	var urlEncode = function(data) {
		return $.toJSON(data);
	};

	var getUrlSelections = function() {
		var sels = getUrlParam('sels');
		var decoded = decodeURIComponent(sels);
		if(decoded === 'undefined' || typeof decoded === 'undefined') {
			return undefined;
		}
		else {
			return JSON.parse(decoded);
		}
	};

	custom.init = function() {
		// init
		window.graphy.selectionFactory('Data set', 'dataset', makeSelItem(Object.keys(dataOptions), 'radio'));
		initiCheck('input');
		var sels = getUrlSelections();

		$('#selectionContainer').on('ifChecked', 'input[name="dataset"]', function(event) {
			removeMainSelections();
			$('#datatype').remove();
			window.graphy.selectionFactory('Data type', 'datatype', makeSelItem(dataOptions[this.value], 'radio'));
			initiCheck('#datatype');
			event.preventDefault();
		});
		$('#selectionContainer').on('ifChecked', 'input[name="datatype"]', sels, function(event) {
			removeMainSelections();
			var dataset = $('input[name=dataset]:checked', '#dataset').val();
			var datatype = this.value;
			window.graphy.getData(dataset, datatype).done(function(data) {
				createMainSelections(data);
				if(typeof sels !== 'undefined') {
					for(var s in sels) {
						if(s !== 'dataset' && s !== 'datatype' && s !== 'axislabels') {
							for(var i in sels[s]) {
								var check = '#' + s + ' :input[value=' + sels[s][i] + ']';
								$(check).iCheck('check');
							}
						}
						else if(s === 'axislabels') {
							var keys = Object.keys(sels[s]);
							for(var i in keys) {
								var input = '#' + s + ' :input[placeholder=' + keys[i] + ']';
								$(input).val(sels[s][keys[i]]);
							}
						}
					}
				}
			});
			event.preventDefault();
		});
		//	y1axis and y2axis field cannot be enabled if field bound to xaxis
		$('#selectionContainer').on('ifChecked', '#xaxis input[name="xaxis"]', function(event) {
			$('#' + this.id.replace('xaxis', 'y1axis')).iCheck('disable');
			$('#' + this.id.replace('xaxis', 'y1axis')).iCheck('uncheck');
			$('#' + this.id.replace('xaxis', 'y2axis')).iCheck('disable');
			$('#' + this.id.replace('xaxis', 'y2axis')).iCheck('uncheck');

			event.preventDefault();
		});
		$('#selectionContainer').on('ifUnchecked', '#xaxis input[name="xaxis"]', function(event) {
			$('#' + this.id.replace('xaxis', 'y1axis')).iCheck('enable');
			$('#' + this.id.replace('xaxis', 'y2axis')).iCheck('enable');

			event.preventDefault();
		});
		$('#selectionContainer').on('ifToggled', '#y1axis', function(event) {
			//	y2-axis fields can't be selected if analog y1-axis fields are selected
			var uncheckedIds = $('#y1axis input:checkbox:not(:checked)')
				.map(function(i, el) { return el.id.replace('y1axis', 'y2axis'); }).get();
			var checkedIds = $('#y1axis input:checked')
				.map(function(i, el) { return el.id.replace('y1axis', 'y2axis'); }).get();
			for(var u in uncheckedIds) {
				$('#' + uncheckedIds[u]).iCheck('enable');
			}
			for(var c in checkedIds) {
				$('#' + checkedIds[c]).iCheck('disable');
				$('#' + checkedIds[c]).iCheck('uncheck');
			}
			event.preventDefault();
		});

		if(typeof sels !== 'undefined') {	//	Form graph from url
			window.console.dir(sels);
			$('#dataset :radio[value=' + sels['dataset'] + ']').iCheck('check');
			$('#datatype :radio[value=' + sels['datatype'] + ']').iCheck('check');
		}

	};

})(window, document, window.jQuery, window.d3, window.c3);
/*
 * jQuery UI Pattern @VERSION
 *
 * Copyright 2011, Arjen Post (http://arjenpost.nl)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://arjenpost.nl/license
 *
 * http://arjenpost.nl/#pattern
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.mouse.js
 */
(function( $ ) {

$.fn.hitTest = function( x, y ) {
        var matched = [];
		
		this.each(function() {
			var position = $(this).position();
			var marginLeft = parseInt($(this).css("margin-left") , 10) || 0;
			var marginTop = parseInt($(this).css("margin-top"), 10) || 0;
			
			
			if(position.left + marginLeft <= x && position.left + marginLeft + $(this).outerWidth() >= x && 
			  position.top + marginTop <= y && position.top + marginTop + $(this).outerHeight() >= y)
				matched.push(this);
		});
		return matched;
};

$.widget('ui.pattern', $.ui.mouse, {
	options: {
		gridSize: 3,
		showPattern: true,
		clearDelay: 2000,
		lineWidth: 45,
		lineOpacity: 0.3,
		lineColor: '#fff',
		arrowCorrectImage: '',
		arrowIncorrectImage: '',
		multiSelect: false
    },
	
	// default functions
	
	_create: function() {
		this.element.addClass('ui-pattern ui-widget');
		
		this.options.disabled ? this.element.addClass('ui-state-disabled') : this.element.addClass('ui-state-default');
		
		var linecontainer = $('<canvas></canvas>');
		
		if(linecontainer && linecontainer[0].getContext)
		{
			linecontainer
				.addClass('ui-patter-line-container')
				.css({ opacity: this.options.lineOpacity })
				.appendTo(this.element);
			
			this._linecontainer = linecontainer;
			this._canvasSupported = true;
		}
		
		this._nodecontainer = $('<div></div>')
			.addClass('ui-patter-node-container')
			.appendTo(this.element);
		
		if(this._canvasSupported === true)
			this._arrowcontainer = $('<canvas></canvas>')
				.addClass('ui-patter-arrow-container')
				.appendTo(this.element);
		
		this._createGrid();
		
		this._pattern = [];
		
		this.options.distance = 0;
		
		this._setArrowCorrect();
		this._setArrowIncorrect();
		
		this._mouseInit();
	},
	destroy: function() {
		this.element
            .unbind('.' + this.widgetName)
			.removeClass('ui-pattern ui-widget ui-state-default ui-state-disabled')
			.children()
			.remove();

		this._mouseDestroy();

		return this;
	},
	_setOption: function(key, value) {
		$.Widget.prototype._setOption.apply( this, arguments );
		
		switch ( key ) {
			case 'lineOpacity':
				if(this._canvasSupported === true)
					this._linecontainer.css({ opacity: this.options.lineOpacity });
				break;
			case 'gridSize':
				this._clear();
				this._createGrid();
				break;
			case 'disabled':
				if(value)
				{
					this._clear();
					this.element
						.addClass('ui-state-disabled')
						.removeClass('ui-state-default');
				}
				else
					this.element
						.addClass('ui-state-default')
						.removeClass('ui-state-disabled');
				break;
			case 'arrowCorrectImage':
				this._setArrowCorrect();
				break;
			case 'arrowIncorrectImage':
				this._setArrowIncorrect();
				break;
				
		}
	},
	
	// default functions
	
	// ui.mouse overrides
	
	_mouseDrag: function(event) {
		if(!this._started)
			return false;
			
		var self = this;
		
		var node = this.element
			.find('.ui-pattern-node')
			.filter(function() { return this != self._previousNode[0] && (self.options.multiSelect === true || $(this).attr('selected') !== 'selected'); } )
			.hitTest(event.pageX - this._nodecontainer.offset().left, event.pageY - this._nodecontainer.offset().top);
		
		if(node.length > 0)
			this._selectNode($(node[0]), event);
			
		if(this.options.showPattern === true)
			this._drawLines(event);
		
		return false;
	},
	_mouseStart: function(event) {	
		if (this.options.disabled || this._waitingForClear)
			return false;
			
		var node = this.element
			.find('.ui-pattern-node')
			.hitTest(event.pageX - this._nodecontainer.offset().left, event.pageY - this._nodecontainer.offset().top);
	
		if(node.length > 0)
		{
			this._clear();
			
			this._cachedCoordinates = [];
			
			this._trigger('start', event);

			this._started = true;
			
			this._selectNode($(node[0]), event);
		}

		return true;
	},
	_mouseStop: function(event) {
		this._waitingForClear = true;
			
		this._started = false;
		
		if(this.options.showPattern === true)
			this._drawLines();
		
		this._trigger('stop', event, { pattern: this._pattern });
	},
	
	// ui.mouse overrides
	
	// internal functions
	
	_clear: function() {
		if(this._timer)
			clearTimeout(this._timer);
			
		this._started = false;
		this._waitingForClear = false;
			
		this._pattern = [];
			
		this._previousNode = null;
			
		this.element
			.find('.ui-pattern-node')
			.filter(function() { return $(this).attr('selected') === 'selected'; })
			.removeClass('ui-pattern-selected ui-pattern-correct ui-pattern-incorrect')
			.removeAttr('selected');
			
		this._clearLines();
		this._clearArrows();
		
		this._setCanvasWidth();
	},
	_clearArrows: function() {
		if(this._canvasSupported !== true)
			return;
			
		var context = this._arrowcontainer[0].getContext('2d');
		
		context.clearRect(0, 0, this._arrowcontainer[0].width, this._arrowcontainer[0].height);
	},
	_clearLines: function() {
		if(this._canvasSupported !== true)
			return;
			
		var context = this._linecontainer[0].getContext('2d');
		
		context.clearRect(0, 0, this._linecontainer[0].width, this._linecontainer[0].height);
	},
	_createGrid: function() {
		this._nodecontainer
			.children()
			.remove();
		
		for(var y = 0; y < this.options.gridSize; y++)
		{
			var row = $('<div></div>').addClass('ui-pattern-row');;
			
			for(var x = 0; x < this.options.gridSize; x++)
			{
				$('<div></div>')
					.addClass('ui-pattern-node')
					.attr('x', x)
					.attr('y', y)
					.attr('value', y * this.options.gridSize + x + 1)
					.appendTo(row);
			}
			
			this._nodecontainer.append(row);
		}
	},
	_drawArrow: function(from, to, correct) {
		if(this._canvasSupported !== true)
			return;
			
		if(typeof correct == 'undefined' || (correct === true && !this._arrowCorrect) || (correct === false && !this._arrowIncorrect))
			return;
			
		var context = this._arrowcontainer[0].getContext('2d');
		var image = correct ? $(this._arrowCorrect) : $(this._arrowIncorrect);
		
		var x = to.x - from.x;
		var y = to.y - from.y;

		var angle = -Math.atan2(-x, -y);
		
		context.translate(from.x, from.y)
		context.rotate(angle);
		context.drawImage(image[0], -(image.attr('width') / 2), -(image.attr('height')/ 2));
		context.rotate(-angle);
		context.translate(-from.x, -from.y);
	},
	_drawArrows: function(correct) {
		if(this._canvasSupported !== true)
			return;
			
		this._clearArrows();
			
		if(typeof correct == 'undefined' || (correct === true && !this._arrowCorrect) || (correct === false && !this._arrowIncorrect))
			return;
		
		for(var i = 1; i < this._cachedCoordinates.length; i++)
			this._drawArrow(this._cachedCoordinates[i - 1], this._cachedCoordinates[i], correct);
	},
	_drawLines: function(event) {
		if(this._canvasSupported !== true)
			return;
			
		this._clearLines();
		
		if(!this._cachedCoordinates)
			return;
		
		var context = this._linecontainer[0].getContext('2d');
		
		context.beginPath();

		for(var i = 1; i < this._cachedCoordinates.length; i++)
		{
			var previous = this._cachedCoordinates[i - 1];
			var current = this._cachedCoordinates[i];
			
			context.moveTo(previous.x, previous.y);
			context.lineTo(current.x, current.y);
		}
		
		if(event)
		{
			var offset = this._linecontainer.offset();
			var cursorPosition =  { x: event.pageX - offset.left, y: event.pageY - offset.top };
		
			var last = this._cachedCoordinates[this._cachedCoordinates.length - 1];
			
			context.moveTo(last.x, last.y);
			context.lineTo(cursorPosition.x, cursorPosition.y);
		}
		
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.lineWidth = this.options.lineWidth;
		context.strokeStyle = this.options.lineColor;
		context.stroke();
		context.closePath();
	},
	_getNode: function(x, y, directionX, directionY) {
		x = x + directionX;
		y = y + directionY;
		
		var node = this.element
			.find('.ui-pattern-node')
			.filter(function() { return parseInt($(this).attr('x')) == x && parseInt($(this).attr('y')) == y; });
		
		if(this.options.multiSelect !== true && node.attr('selected') === 'selected')
			return this._getNode(x, y, directionX, directionY);
		else
			return node;
	},
	_selectNode: function(node, event) {
		var previousNode = this._previousNode;
		
		if(previousNode)
		{
			// Check if there are other nodes between the current node and the previous node,
			// if so, also check those nodes. 
			var nodeX = parseInt(node.attr('x'));
			var nodeY = parseInt(node.attr('y'));
			var previousNodeX = parseInt(previousNode.attr('x'));
			var previousNodeY = parseInt(previousNode.attr('y'));
			
			var nextNode = null;
			
			if(nodeX == previousNodeX)// Orientation: |
				nextNode = nodeY > previousNodeY ? this._getNode(nodeX, previousNodeY, 0, 1) : this._getNode(nodeX, previousNodeY, 0, -1);
			else if(nodeY == previousNodeY)// Orientation: -
				nextNode = nodeX > previousNodeX ? this._getNode(previousNodeX, nodeY, 1, 0) : this._getNode(previousNodeX, nodeY, -1, 0);
			else if(nodeY - nodeX == previousNodeY - previousNodeX)// Orientation: \
				nextNode = nodeY > previousNodeY ? this._getNode(previousNodeX, previousNodeY, 1, 1) : this._getNode(previousNodeX, previousNodeY, -1, -1);
			else if(nodeY + nodeX == previousNodeY + previousNodeX)// Orientation: /
				nextNode = nodeX > previousNodeX ? this._getNode(previousNodeX, previousNodeY, 1, -1) : this._getNode(previousNodeX, previousNodeY, -1, 1);

			if(nextNode && nextNode[0] != node[0])
				this._selectNode(nextNode, event);
		}
		
		// If previousNode does not equal this._previousNode, then there was at least one other
		// node between the current and the previous node. Execute _selectNode again with the 
		// current node, there might be more nodes between...
		if(previousNode != this._previousNode)
		{
			this._selectNode(node, event);
			return;
		}
	
		this._previousNode = node;
	
		node.attr('selected', 'selected');
		this._pattern.push(node.attr('value'));
		
		if(this.options.showPattern === true)
			node.addClass('ui-pattern-selected');
			
		var nodePosition = node.position();
			
		var position = { x: nodePosition.left + (node.outerWidth(true) / 2), y: nodePosition.top + (node.outerHeight(true) / 2) };
		
		if(this._cachedCoordinates && this._cachedCoordinates.length > 0)
		{
			var previousPosition = this._cachedCoordinates[this._cachedCoordinates.length - 1];
		
			if(this.options.showPattern === true)
				this._drawArrow(previousPosition, position, 'img/arrow-correct.png');
		}
		
		this._cachedCoordinates.push(position);
		
		this._trigger('change', event, { pattern: this._pattern });
	},
	_setArrowCorrect: function() {
		if(this.options.arrowCorrectImage)
			this._arrowCorrect = $('<img/>')
				.attr({ src: this.options.arrowCorrectImage });
		else
			this._arrowCorrect = null;
	},
	_setArrowIncorrect: function() {
		if(this.options.arrowIncorrectImage)
			this._arrowIncorrect = $('<img/>')
				.attr({ src: this.options.arrowIncorrectImage });
		else
			this._arrowIncorrect = null;
	},
	_setCanvasWidth: function() {
		if(this._canvasSupported !== true)
			return;
			
		var nodes = this.element.find('.ui-pattern-node');
		
		var width = 0;
		var height = 0;
		
		if(nodes.length > 0)
		{
			var node = $(nodes[0]);
			
			width = node.outerWidth(true) * this.options.gridSize;
			height = node.outerHeight(true) * this.options.gridSize;
		}
	
		this._arrowcontainer[0].width = this._linecontainer[0].width = width;
		this._arrowcontainer[0].height = this._linecontainer[0].height = height;
	},
	
	// internal functions
	
	// public functions
	
	clearPattern: function(correct) {
		this._waitingForClear = false;
	
		if(correct === false || this.options.showPattern === true)
		{
			var selectedClass = correct === true ? 'ui-pattern-correct' : 'ui-pattern-incorrect';
		
			this.element
				.find('.ui-pattern-node')
				.filter(function() { return $(this).attr('selected') === 'selected'; })
				.removeClass('ui-pattern-selected')
				.addClass(selectedClass);
				
			this._drawLines();
			
			this._drawArrows(correct);
		}
		
		this._cachedCoordinates = [];
	
		var self = this;
		
		this._timer = setTimeout(function() {
			// The user could already started a new pattern selection...
			if(!self._started)
				self._clear();
			
		}, this.options.clearDelay);
	},
	pattern: function() {
		return this._pattern;
	}
	
	// public functions
});

})( jQuery );
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
( function( $ ) {

$.widget( "ui.pattern", $.ui.mouse, {
	widgetEventPrefix: "pattern",
	options: {
		arrowCorrectImage: "",
		arrowIncorrectImage: "",
		clearDelay: 2000,
		gridSize: 3,
		lineColor: "#fff",
		lineOpacity: 0.3,
		lineWidth: 45,
		multiSelect: false,
		showPattern: true
	},

	// default functions

	_create: function() {
		var linecontainer;

		this.element.addClass( "ui-pattern ui-widget" );

		if ( this.options.disabled === true ) {
			this.element.addClass( "ui-state-disabled" );
		} else {
			this.element.addClass( "ui-state-default" );
		}

		linecontainer = $( "<canvas></canvas>" );

		if (linecontainer && linecontainer[0].getContext) {
			linecontainer
			.addClass( "ui-patter-line-container" )
			.css({ opacity: this.options.lineOpacity })
			.appendTo(this.element);

			this._linecontainer = linecontainer;
			this._canvasSupported = true;
		}

		this._nodecontainer = $( "<div></div>" )
		.addClass( "ui-patter-node-container" )
		.appendTo( this.element );

		if (this._canvasSupported === true) {
			this._arrowcontainer = $( "<canvas></canvas>" )
			.addClass( "ui-patter-arrow-container" )
			.appendTo( this.element );
		}
		
		this._pattern = [];
		this._cachedCoordinates = [];
		this._timer = null;
		this._previousNode = null;

		this._createGrid();
		this._setArrowCorrect();
		this._setArrowIncorrect();

		this.options.distance = 0;

		this._mouseInit();
	},
	destroy: function() {
		this.element
		.unbind( "." + this.widgetName)
		.removeClass( "ui-pattern ui-widget ui-state-default ui-state-disabled" )
		.children()
		.remove();

		this._mouseDestroy();

		return this;
	},
	_setOption: function( key, value ) {
		$.Widget.prototype._setOption.apply( this, arguments );

		switch ( key ) {
			case "lineOpacity":
				if ( this._canvasSupported === true ) {
					this._linecontainer.css( "opacity", this.options.lineOpacity );
				}
				break;
			case "gridSize":
				this._clear();
				this._createGrid();
				break;
			case "disabled":
				if (value === true) {
					this._clear();
					this.element
					.addClass( "ui-state-disabled" )
					.removeClass( "ui-state-default" );
				} else {
					this.element
					.addClass( "ui-state-default" )
					.removeClass( "ui-state-disabled" );
				}
				break;
			case "arrowCorrectImage":
				this._setArrowCorrect();
				break;
			case "arrowIncorrectImage":
				this._setArrowIncorrect();
				break;

		}
	},

	// default functions

	// ui.mouse overrides

	_mouseDrag: function( event ) {
		var node,
		self = this;

		if (this._started !== true) {
			return false;
		}

		node = this.element
		.find( ".ui-pattern-node" )
		.filter( function() {
			return this !== self._previousNode[0] && ( self.options.multiSelect === true || $(this).attr( "selected" ) !== "selected" );
		} )
		.hitTest( event.pageX - this._nodecontainer.offset().left, event.pageY - this._nodecontainer.offset().top );

		if ( node.length ) {
			this._selectNode( $(node[0]), event );
		}

		if ( this.options.showPattern === true ) {
			this._drawLines( event );
		}

		return false;
	},
	_mouseStart: function(event) {
		var node;

		if ( this.options.disabled === true || this._waitingForClear === true ) {
			return false;
		}

		node = this.element
		.find( ".ui-pattern-node" )
		.hitTest( event.pageX - this._nodecontainer.offset().left, event.pageY - this._nodecontainer.offset().top );

		if ( node.length ) {
			this._start();
			this._selectNode( $(node[0]), event );
		}

		return true;
	},
	_mouseStop: function( event ) {
		this._stop( event );
	},

	// ui.mouse overrides

	// internal functions

	_clear: function() {
		if ( this._timer !== null ) {
			clearTimeout(this._timer);
			this._timer = null;
		}

		this._started = false;
		this._waitingForClear = false;

		this._pattern = [];
		this._cachedCoordinates = [];

		this._previousNode = null;

		this.element
		.find( ".ui-pattern-node" )
		.filter( function() { return $(this).attr( "selected" ) === "selected"; } )
		.removeClass( "ui-pattern-selected ui-pattern-correct ui-pattern-incorrect" )
		.removeAttr( "selected" );

		this._clearLines();
		this._clearArrows();

		this._setCanvasWidth();
	},
	_clearArrows: function() {
		var context;

		if ( this._canvasSupported !== true ) {
			return;
		}

		context = this._arrowcontainer[0].getContext( "2d" );

		context.clearRect( 0, 0, this._arrowcontainer[0].width, this._arrowcontainer[0].height );
	},
	_clearLines: function() {
		var context;

		if (this._canvasSupported !== true) {
			return;
		}

		context = this._linecontainer[0].getContext( "2d" );

		context.clearRect( 0, 0, this._linecontainer[0].width, this._linecontainer[0].height );
	},
	_createGrid: function() {
		var y, x, row;

		this._nodecontainer
		.children()
		.remove();

		for ( y = 0; y < this.options.gridSize; y++ ) {
			row = $( "<div></div>" ).addClass( "ui-pattern-row" );

			for ( x = 0; x < this.options.gridSize; x++ ) {
				this._createNode( x, y ).appendTo( row );
			}

			this._nodecontainer.append( row );
		}
	},
	_createNode: function( x, y ) {
		var self = this;

		return $( "<a></a>" )
		.attr( "href", "#" )
		.data( "x.ui-pattern-node", x )
		.data( "y.ui-pattern-node", y )
		.addClass( "ui-pattern-node" )
		.click( function(event) {
			event.preventDefault();
		} )
		.hover( function() {
			if ( self.options.disabled !== true ) {
				$(this).addClass( "ui-state-hover" );
			}
		}, function() {
			$(this).removeClass( "ui-state-hover" );
		} )
		.focus( function() {
			if ( self.options.disabled !== true ) {
				$( ".ui-pattern-node .ui-state-focus" ).removeClass( "ui-state-focus" );
				$(this).addClass( "ui-state-focus" );
			} else {
				$(this).blur();
			}
		})
		.blur( function() {
			$(this).removeClass( "ui-state-focus" );
		})
		.keydown( function( event ) {
			var node, selectedNodes,
			nodeX = parseInt( $(this).data( "x.ui-pattern-node" ), 10 ),
			nodeY = parseInt( $(this).data( "y.ui-pattern-node" ), 10 );

			if ( event.keyCode === $.ui.keyCode.UP ) {
				if ( nodeY > 0 ) {
					node = self.element
					.find( ".ui-pattern-node" )
					.filter(function() {
						return parseInt( $(this).data( "x.ui-pattern-node" ), 10 ) === nodeX && parseInt( $(this).data( "y.ui-pattern-node" ), 10 ) === nodeY - 1;
					} );

					node.focus();

					event.preventDefault();
				}
			} else if ( event.keyCode === $.ui.keyCode.DOWN ) {
				if ( nodeY < self.options.gridSize - 1 ) {
					node = self.element
					.find( ".ui-pattern-node" )
					.filter( function() {
						return parseInt( $(this).data( "x.ui-pattern-node" ), 10 ) === nodeX && parseInt( $(this).data( "y.ui-pattern-node" ), 10 ) === nodeY + 1;
					} );

					node.focus();

					event.preventDefault();
				}
			} else if ( event.keyCode === $.ui.keyCode.LEFT ) {
				if ( nodeX > 0 ) {
					node = self.element
					.find( ".ui-pattern-node" )
					.filter( function() {
						return parseInt( $(this).data( "x.ui-pattern-node" ), 10 ) === nodeX - 1 && parseInt( $(this).data( "y.ui-pattern-node" ), 10 ) === nodeY;
					} );

					node.focus();

					event.preventDefault();
				}
			} else if ( event.keyCode === $.ui.keyCode.RIGHT ) {
				if ( nodeX < self.options.gridSize - 1 ) {
					node = self.element
						.find( ".ui-pattern-node" )
						.filter( function() {
							return parseInt( $(this).data( "x.ui-pattern-node" ), 10 ) === nodeX + 1 && parseInt( $(this).data( "y.ui-pattern-node" ), 10 ) === nodeY;
						} );

					node.focus();

					event.preventDefault();
				}
			} else if ( event.keyCode === $.ui.keyCode.SPACE ) {
				if ( self.options.disabled === true || self._waitingForClear === true ) {
					return;
				}

				selectedNodes = self.element
				.find( ".ui-pattern-node" )
				.filter( function() {
					return $(this).attr( "selected" ) === "selected";
				} );

				if (!selectedNodes.length) {
					self._start();
				}

				if ( ( !self._previousNode || this !== self._previousNode[0] ) && ( self.options.multiSelect === true || $(this).attr( "selected" ) !== "selected" ) ) {
					self._selectNode( $(this), event );

					if ( self.options.showPattern === true ) {
						self._drawLines( null );
					}

					event.preventDefault();
				}
			} else if ( event.keyCode === $.ui.keyCode.ENTER ) {
				if ( self.options.disabled === true || self._waitingForClear === true ) {
					return;
				}

				selectedNodes = self.element
				.find( ".ui-pattern-node" )
				.filter( function() {
					return $(this).attr( "selected" ) === "selected";
				} );

				if ( selectedNodes.length ) {
					self._stop( event );
				}
			}
		});
	},
	_drawArrow: function( from, to, correct ) {
		var context, image,
		x = to.x - from.x,
		y = to.y - from.y,
		angle = -Math.atan2( -x, -y );

		if ( this._canvasSupported !== true ) {
			return;
		}

		if ( ( correct === null || correct === undefined ) || ( correct === true && this._arrowCorrect === null ) || ( correct === false && this._arrowIncorrect === null ) ) {
			return;
		}

		context = this._arrowcontainer[0].getContext( "2d" );
		if ( correct === true) {
			image = $(this._arrowCorrect);
		} else {
			image = $(this._arrowIncorrect);
		}

		context.translate( from.x, from.y );
		context.rotate( angle );
		context.drawImage( image[0], -( image.attr( "width" ) / 2 ), -( image.attr( "height" ) / 2 ) );
		context.rotate( -angle );
		context.translate( -from.x, -from.y );
	},
	_drawArrows: function( correct ) {
		var i;

		if ( this._canvasSupported !== true ) {
			return;
		}

		this._clearArrows();

		if ( ( correct === null || correct === undefined ) || ( correct === true && this._arrowCorrect === null ) || ( correct === false && this._arrowIncorrect === null ) ) {
			return;
		}

		for ( i = 1; i < this._cachedCoordinates.length; i++ ) {
			this._drawArrow( this._cachedCoordinates[i - 1], this._cachedCoordinates[i], correct );
		}
	},
	_drawLines: function( event ) {
		var context, i, previous, current;

		if ( this._canvasSupported !== true ) {
			return;
		}

		this._clearLines();

		if ( !this._cachedCoordinates.length ) {
			return;
		}

		context = this._linecontainer[0].getContext( "2d" );

		context.beginPath();

		for ( i = 1; i < this._cachedCoordinates.length; i++ ) {
			previous = this._cachedCoordinates[i - 1];
			current = this._cachedCoordinates[i];

			context.moveTo( previous.x, previous.y );
			context.lineTo( current.x, current.y );
		}

		if ( event ) {
			context.moveTo( this._cachedCoordinates[this._cachedCoordinates.length - 1].x, this._cachedCoordinates[this._cachedCoordinates.length - 1].y );
			context.lineTo( event.pageX - this._linecontainer.offset().left, event.pageY - this._linecontainer.offset().top );
		}

		context.lineCap = "round";
		context.lineJoin = "round";
		context.lineWidth = this.options.lineWidth;
		context.strokeStyle = this.options.lineColor;
		context.stroke();
		context.closePath();
	},
	_getNode: function( x, y, directionX, directionY ) {
		var node;

		x += directionX;
		y += directionY;

		node = this.element
		.find( ".ui-pattern-node" )
		.filter( function() {
			return parseInt( $(this).data( "x.ui-pattern-node" ), 10 ) === x && parseInt( $(this).data( "y.ui-pattern-node" ), 10 ) === y;
		} );

		if (this.options.multiSelect !== true && node.attr( "selected" ) === "selected" ) {
			return this._getNode( x, y, directionX, directionY );
		} else {
			return node;
		}
	},
	_selectNode: function( node, event ) {
		var previousNodeX, previousNodeY, nextNode,
		previousNode = this._previousNode,
		nodeX = parseInt( node.data( "x.ui-pattern-node" ), 10 ),
		nodeY = parseInt( node.data( "y.ui-pattern-node" ), 10 );

		if ( previousNode !== null) {
			// Check if there are other nodes between the current node and the previous node,
			// if so, also check those nodes.
			previousNodeX = parseInt( previousNode.data( "x.ui-pattern-node" ), 10 );
			previousNodeY = parseInt( previousNode.data( "y.ui-pattern-node" ), 10 );

			if ( nodeX === previousNodeX ) {// Orientation: |
				if ( nodeY > previousNodeY ) {
					nextNode = this._getNode( nodeX, previousNodeY, 0, 1 );
				} else {
					nextNode = this._getNode( nodeX, previousNodeY, 0, -1 );
				}
			} else if ( nodeY === previousNodeY ) {// Orientation: -
				if ( nodeX > previousNodeX ) {
					nextNode = this._getNode( previousNodeX, nodeY, 1, 0 );
				} else {
					nextNode = this._getNode( previousNodeX, nodeY, -1, 0 );
				}
			} else if ( nodeY - nodeX === previousNodeY - previousNodeX ) {// Orientation: \
				if ( nodeY > previousNodeY ) {
					nextNode = this._getNode( previousNodeX, previousNodeY, 1, 1 );
				} else {
					nextNode = this._getNode( previousNodeX, previousNodeY, -1, -1 );
				}
			} else if ( nodeY + nodeX === previousNodeY + previousNodeX ) {// Orientation: /
				if ( nodeX > previousNodeX ) {
					nextNode = this._getNode( previousNodeX, previousNodeY, 1, -1 );
				} else {
					nextNode = this._getNode( previousNodeX, previousNodeY, -1, 1 );
				}
			}

			if ( nextNode && nextNode[0] !== node[0] ) {
				this._selectNode( nextNode, event );
			}
		}

		// If previousNode does not equal this._previousNode, then there was at least one other
		// node between the current and the previous node. Execute _selectNode again with the
		// current node, there might be more nodes between...
		if ( previousNode !== this._previousNode ) {
			this._selectNode( node, event );
			return;
		}

		this._previousNode = node;

		node.attr( "selected", "selected" );

		this._pattern.push( nodeY * this.options.gridSize + nodeX + 1 );

		if ( this.options.showPattern === true ) {
			node.addClass( "ui-pattern-selected" );
		}

		if ( this._cachedCoordinates.length ) {
			if (this.options.showPattern === true) {
				this._drawArrow( this._cachedCoordinates[this._cachedCoordinates.length - 1], { x: node.position().left + ( node.outerWidth( true ) / 2 ), y: node.position().top + ( node.outerHeight( true ) / 2 ) }, true );
			}
		}

		this._cachedCoordinates.push( { x: node.position().left + ( node.outerWidth( true ) / 2 ), y: node.position().top + ( node.outerHeight( true ) / 2 ) } );

		this._trigger( "change", event, { pattern: this._pattern });
	},
	_setArrowCorrect: function() {
		if ( this.options.arrowCorrectImage !== null && this.options.arrowCorrectImage !== undefined ) {
			this._arrowCorrect = $( "<img/>" )
			.attr( "src", this.options.arrowCorrectImage );
		} else {
			this._arrowCorrect = null;
		}
	},
	_setArrowIncorrect: function() {
		if ( this.options.arrowIncorrectImage !== null && this.options.arrowIncorrectImage !== undefined ) {
			this._arrowIncorrect = $( "<img/>" )
			.attr( "src", this.options.arrowIncorrectImage );
		} else {
			this._arrowIncorrect = null;
		}
	},
	_setCanvasWidth: function() {
		var nodes,
		width = 0,
		height = 0;

		if ( this._canvasSupported !== true ) {
			return;
		}

		nodes = this.element.find( ".ui-pattern-node" );

		if ( nodes.length ) {
			width = $(nodes[0]).outerWidth( true ) * this.options.gridSize;
			height = $(nodes[0]).outerHeight( true ) * this.options.gridSize;
		}

		this._arrowcontainer[0].width = this._linecontainer[0].width = width;
		this._arrowcontainer[0].height = this._linecontainer[0].height = height;
	},
	_start: function( event ) {
		this._clear();

		this._trigger( "start", event );

		this._started = true;
	},
	_stop: function( event ) {
		this._waitingForClear = true;

		this._started = false;

		if ( this.options.showPattern === true ) {
			this._drawLines();
		}

		this._trigger( "stop", event, { pattern: this._pattern } );
	},

	// internal functions

	// public functions

	clearPattern: function( correct ) {
		var selectedClass,
		self = this;

		this._waitingForClear = false;

		if (correct === false || this.options.showPattern === true) {
			if ( correct === true ) {
				selectedClass = "ui-pattern-correct";
			} else {
				selectedClass = "ui-pattern-incorrect";
			}

			this.element
			.find( ".ui-pattern-node" )
			.filter( function() {
				return $(this).attr( "selected" ) === "selected";
			} )
			.removeClass( "ui-pattern-selected" )
			.addClass( selectedClass );

			this._drawLines();

			this._drawArrows( correct );
		}

		this._cachedCoordinates = [];

		this._timer = setTimeout( function() {
			// The user could already started a new pattern selection...
			if (self._started !== true) {
				self._clear();
			}

		}, this.options.clearDelay );
	},
	pattern: function() {
		return this._pattern;
	}

	// public functions
});

$.extend( $.ui.pattern, {
		version: "@VERSION"
} );

$.fn.hitTest = function( x, y ) {
	var matched = [];

	this.each( function() {
		var position = $(this).position(),
		marginLeft = parseInt( $(this).css( "margin-left" ), 10 ) || 0,
		marginTop = parseInt( $(this).css( "margin-top" ), 10 ) || 0;


		if ( position.left + marginLeft <= x && position.left + marginLeft + $(this).outerWidth() >= x && position.top + marginTop <= y && position.top + marginTop + $(this).outerHeight() >= y ) {
			matched.push( this );
		}
	} );

	return matched;
};

} )( jQuery );
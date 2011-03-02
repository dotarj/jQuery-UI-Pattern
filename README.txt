Copyright (c) Arjen Post (http://arjenpost.nl)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- Table of contents -----------------------------------------------

1	Overview
1.1 Dependencies
1.2 Default usage
1.3 To-do list

2	Options
2.1	arrowCorrectImage
2.2	arrowIncorrectImage
2.3	clearDelay
2.4	disabled
2.5	gridSize
2.6	lineColor
2.7	lineOpacity
2.8	lineWidth

3	Events
3.1	create
3.2	start
3.3	change
3.4	stop

4	Methods
4.1	clearPattern
4.2	destroy
4.3	disable
4.4	enable
4.5	option
4.6	option
4.7	pattern
4.8	widget

--- 1 Overview ------------------------------------------------------

Pattern is a Android-style unlock plugin build with jQuery and jQuery 
UI, using the jQuery UI widget factory.

--- 1.1 Dependencies ------------------------------------------------

jQuery UI Pattern uses jQuery and jQuery UI:

	- jquery.ui.core.js
	- jquery.ui.widget.js
	- jquery.ui.mouse.js

--- 1.2 Default usage -----------------------------------------------

$('.selector').pattern(
{
	arrowCorrectImage: 'img/arrow-correct.png', 
	arrowIncorrectImage: 'img/arrow-incorrect.png',
	stop: function(event, ui) {
		var correct = ...;//Check pattern logic (ui.pattern)...
	
		$('.selector').pattern('clearPattern', correct);
	}
});

--- 1.3 To-do list --------------------------------------------------

	- Allow a node to be selected more than once
	- Make pattern compatible with touch devices

--- 2 Options -------------------------------------------------------

--- 2.1 arrowCorrectImage  ------------------------------------------

Name: arrowCorrectImage
Type: String
Default: ''

Description:
Get or set the path to the arrow image which is used for a correct 
pattern.

Code examples:
Initialize a pattern with the arrowCorrectImage option specified.
$( ".selector" ).pattern({ arrowCorrectImage: 
'img/arrow-correct.png' });
Get or set the arrowCorrectImage option, after init.
//getter
var arrowCorrectImage = $( ".selector" ).pattern( "option", 
"arrowCorrectImage" );
//setter
$( ".selector" ).pattern( "option", "arrowCorrectImage", 
'img/arrow-correct.png' );

--- 2.2 arrowIncorrectImage  ----------------------------------------

Name: arrowIncorrectImage
Type: String
Default: ''

Description:
Get or set the path to the arrow image which is used for an incorrect 
pattern.

Code examples:
Initialize a pattern with the arrowIncorrectImage option specified.
$( ".selector" ).pattern({ arrowIncorrectImage: 
'img/arrow-incorrect.png' });
Get or set the arrowIncorrectImage option, after init.
//getter
var arrowIncorrectImage = $( ".selector" ).pattern( "option", 
"arrowIncorrectImage" );
//setter
$( ".selector" ).pattern( "option", "arrowIncorrectImage", 
'img/arrow-incorrect.png' );

--- 2.3 clearDelay  -------------------------------------------------

Name: clearDelay
Type: Number
Default: 2000

Description:
Get or set the delay used after clearPattern is called to unselect 
the current pattern.

Code examples:
Initialize a pattern with the clearDelay option specified.
$( ".selector" ).pattern({ clearDelay: 2000 });
Get or set the clearDelay option, after init.
//getter
var clearDelay = $( ".selector" ).pattern( "option", "clearDelay" );
//setter
$( ".selector" ).pattern( "option", "clearDelay", 2000 );

--- 2.4 disabled  ---------------------------------------------------

Name: disabled
Type: Boolean
Default: false

Description:
Disables (true) or enables (false) the pattern. Can be set when 
initialising (first creating) the pattern.

Code examples:
Initialize a pattern with the disabled option specified.
$( ".selector" ).pattern({ disabled: true });
Get or set the disabled option, after init.
//getter
var disabled = $( ".selector" ).pattern( "option", "disabled" );
//setter
$( ".selector" ).pattern( "option", "disabled", true );

--- 2.5 gridSize  ---------------------------------------------------

Name: gridSize
Type: Number
Default: 3

Description:
Get or set the size of the pattern grid, eg: 3 = 3x3 4 = 4x4...

Code examples:
Initialize a pattern with the gridSize option specified.
$( ".selector" ).pattern({ gridSize: 3 });
Get or set the gridSize option, after init.
//getter
var gridSize = $( ".selector" ).pattern( "option", "gridSize" );
//setter
$( ".selector" ).pattern( "option", "gridSize", 3 );

--- 2.6 lineColor  --------------------------------------------------

Name: lineColor
Type: String
Default: '#fff'

Description:
Get or set the color of the line which is drawn between the connected 
nodes.

Code examples:
Initialize a pattern with the lineColor option specified.
$( ".selector" ).pattern({ lineColor: '#fff' });
Get or set the lineColor option, after init.
//getter
var lineColor = $( ".selector" ).pattern( "option", "lineColor" );
//setter
$( ".selector" ).pattern( "option", "lineColor", '#fff' );

--- 2.7 lineOpacity  ------------------------------------------------

Name: lineOpacity
Type: Number
Default: 0.3

Description:
Get or set the opacity of the line which is drawn between the 
connected nodes.

Code examples:
Initialize a pattern with the lineOpacity option specified.
$( ".selector" ).pattern({ lineOpacity: 0.3 });
Get or set the lineOpacity option, after init.
//getter
var lineOpacity = $( ".selector" ).pattern( "option", 
"lineOpacity" );
//setter
$( ".selector" ).pattern( "option", "lineOpacity", 0.3 );

--- 2.8 lineWidth  --------------------------------------------------

Name: lineWidth
Type: Number
Default: 45

Description:
Get or set the width of the line which is drawn between the connected 
nodes.

Code examples:
Initialize a pattern with the lineWidth option specified.
$( ".selector" ).pattern({ lineWidth: 45 });
Get or set the lineWidth option, after init.
//getter
var lineWidth = $( ".selector" ).pattern( "option", "lineWidth" );
//setter
$( ".selector" ).pattern( "option", "lineWidth", 45 );

--- 3 Events --------------------------------------------------------

--- 3.1 create  -----------------------------------------------------

Name: create
Type: patterncreate

Description:
This event is triggered when pattern is created.

Code examples:
Supply a callback function to handle the create event as an init 
option.
$( ".selector" ).pattern({
   create: function(event, ui) { ... }
});
Bind to the create event by type: patterncreate.
$( ".selector" ).bind( "patterncreate", function(event, ui) {
  ...
});

--- 3.2 start  ------------------------------------------------------

Name: start
Type: patternstart

Description:
This event is triggered when the user starts selecting a pattern.

Code examples

Supply a callback function to handle the start event as an init 
option.
$( ".selector" ).pattern({
   start: function(event, ui) { ... }
});
Bind to the start event by type: patternstart.
$( ".selector" ).bind( "patternstart", function(event, ui) {
  ...
});

--- 3.4 change  -----------------------------------------------------

Name: change
Type: patternchange

Description:
This event is triggered on when a node is selected. Use ui.pattern 
to obtain the current pattern.

Code examples:
Supply a callback function to handle the change event as an init 
option.
$( ".selector" ).pattern({
   change: function(event, ui) { ... }
});
Bind to the change event by type: patternchange.
$( ".selector" ).bind( "patternchange", function(event, ui) {
  ...
});

--- 3.4 stop  -------------------------------------------------------

Name: stop
Type: patternstop

Description:
This event is triggered when the user stops pattern selection. Use 
ui.pattern to obtain the current pattern.

Code examples:
Supply a callback function to handle the stop event as an init 
option.
$( ".selector" ).pattern({
   stop: function(event, ui) { ... }
});
Bind to the stop event by type: patternstop.
$( ".selector" ).bind( "patternstop", function(event, ui) {
  ...
});

--- 4 Methods -------------------------------------------------------

--- 4.1 clearPattern  -----------------------------------------------

clearPattern
.pattern( "clearPattern" )
Clears the current pattern after the specified delay (see 
clearDelay).

--- 4.2 destroy  ----------------------------------------------------

destroy
.pattern( "destroy" )
Remove the pattern functionality completely. This will return the 
element back to its pre-init state.

--- 4.3 disable  ----------------------------------------------------

disable
.pattern( "disable" )
Disable the pattern.

--- 4.4 enable  -----------------------------------------------------

enable
.pattern( "enable" )
Enable the pattern.

--- 4.5 option  -----------------------------------------------------

option
.pattern( "option" , optionName , [value] )
Get or set any pattern option. If no value is specified, will act as 
a getter.

--- 4.6 option  -----------------------------------------------------

option
.pattern( "option" , options )
Set multiple pattern options at once by providing an options object.

--- 4.7 pattern  ----------------------------------------------------

pattern
.pattern( "pattern" )
Get the currently selected pattern.

--- 4.8 widget  -----------------------------------------------------

widget
.pattern( "widget" )
Returns the .ui-pattern element.
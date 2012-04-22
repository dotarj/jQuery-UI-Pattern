var currentPattern = new Array(1, 2, 3);

$(document).ready(function () {
	$('#show-pattern').click(function () {
		$('#pattern-container').pattern('option', 'showPattern', $('#show-pattern').is(':checked'));
	});

	$('#multi-select').click(function () {
		$('#pattern-container').pattern('option', 'multiSelect', $('#multi-select').is(':checked'));
	});

	$('#disabled').click(function () {
		if ($('#disabled').is(':checked')) {
			$('#pattern-container').pattern('disable');
		} else { 
			$('#pattern-container').pattern('enable');
		}
	});
	
	function setPattern(pattern) {
		if (pattern.length) {
			currentPattern = pattern;
			$('#pattern-container').pattern('clearPattern', true);
		}

		$('#set-pattern').removeAttr('checked');
	}
	
	function checkPattern(pattern) {
		// Note: this is where you would contact the server to check the supplied pattern. 
		// When the check is complete, you can call clearPattern: 
		// $('#pattern-container').pattern('clearPattern', RESULT);, where RESULT is 
		// true or false, depending on the result of the check.
		if (currentPattern.length == pattern.length) {
			for (var i = 0; i < pattern.length; i++) {
				if (pattern[i] != currentPattern[i]) {
					$('#pattern-container').pattern('clearPattern', false);
					return;
				}
			}

			$('#pattern-container').pattern('clearPattern', true);
		} else {
			$('#pattern-container').pattern('clearPattern', false);
		}
	}

	$('#pattern-container').pattern({
		arrowCorrectImage: 'pattern/img/arrow-correct.png',
		arrowIncorrectImage: 'pattern/img/arrow-incorrect.png',
		stop: function (event, ui) {
			if ($('#set-pattern').is(':checked')) {
				// Note: for demo purposes...
				setPattern(ui.pattern);
			} else {
				checkPattern(ui.pattern);
			}
		}
	});
});
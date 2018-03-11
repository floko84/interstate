/**
 * Interstate is a simple state pattern for JavaScript.
 * 
 * @version 1.2.1
 * @author floko84@gmail.com
 * @see <a href="https://github.com/floko84/interstate">Repository</a>
 * 
 * <pre><code>
 * var switch = new Interstate('on');
 * switch.states = {
 * 	on : {
 * 		toggle : function() {
 * 			this.transition('off');
 * 		}
 * 	},
 * 	off : {
 * 		toggle : function() {
 * 			this.transition('on');
 * 		}
 * 	}
 * };
 * 
 * switch.trigger('toggle'); // off
 * switch.trigger('toggle'); // on
 * switch.transition('on'); // on
 * </code></pre>
 */
function Interstate(initialState, states) {
	var states = states || {};
	var currentState = initialState;
	var extraParameters = [];

	function trigger(property) {
		if (this.states[currentState]) {
			if (typeof this.states[currentState][property] == 'function') {
				return this.states[currentState][property].apply(this,
							Array.prototype.slice.call(arguments, 1));
			} else {
				return this.states[currentState][property];
			}
		}
	}

	function transition(state) {
		if (trigger.apply(this, [ 'onExitState' ].concat(extraParameters)) === false) {
			return false;
		}

		currentState = state;
		extraParameters = Array.prototype.slice.call(arguments, 1);

		return trigger.apply(this, [ 'onEnterState' ].concat(extraParameters));
	}

	return {
		states : states,
		transition : transition,
		trigger : trigger
	};
};

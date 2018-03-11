# Interstate.js

A simple state machine implementation for JavaScript. The plugin has a small footprint and is an ideal choice even for few states.

```javascript
var <objState> = new Interstate([initialState] [, stateObject]);
<objState>.trigger(<action> [, extraParameters]);
<objState>.transition(<newState> [, extraParameters]);
```

## Basic example

```javascript
var myStates = new Interstate();
myStates.states = {
    state1 : {
        action1 : function() {
            this.transition('state2');
        }
    },
    state2 : {
        action2 : function() {
            alert('complete');
        }
    }
}

myStates.transition('state1'); // initial transition to state1
myStates.trigger('action2'); // nothing
myStates.trigger('action1'); // action1 executed, transition to state2
myStates.trigger('action1'); // nothing
myStates.trigger('action2'); // alert
myStates.transition('state1'); // manual transition back to state1
myStates.transition('state3'); // exception
```

Using `.trigger` on a non-existent action in the current state raises no exception.
Using `.transition` to an undefined state throws an exception.
Functions of the current Interstate object (`myStates`) are available as `this`.

## Advanced examples

### onEnterState & onExitState

These special actions are invoked when a state is entered or exited.

```javascript
var myTransition = new Interstate();
myTransition.states = {
    start : {
        onEnterState : function() {
            this.transition('finish');
        },
        onExitState : function() {
            console.log('leaving state start');
        }
    },
    finish : {
        onEnterState : function() {
            alert('complete');
        }
    }
}

myTransition.transition('start'); // calls start.onEnterState
```

Sequence:
1. Manually set `start` state
2. `start.onEnterState` is called
3. `start.onEnterState` changes state to `finish`
4. `start.onExitState` is called
5. `finish.onEnterState` is called

### Initial state

```javascript
var myState = new Interstate('initial');
myState.states = {
    initial : {
        action : function() {
            alert('yes');
        }
    }
}

myState.trigger('action'); // alert yes
```

Setting an initial state makes the first `.transition` call unnecessary.
Due to implementation `onEnterState` is not called for an initial state.
If `onExitState` is defined in the initial state it is called when exiting.
So if an initial call of `onEnterState` is required the initial state should not be used in favor of manually calling `.transition`.

### Parameters

#### .trigger

`.trigger` passes additional parameters to the defined function.

```javascript
var myGreeting = new Interstate('hello');
myGreeting.states = {
    hello : {
        say : function(time, name) {
            alert('Good ' + time + ', ' + name + '!');
        }
    }
}

myGreeting.trigger('say', 'morning', 'Tim'); // 'Good morning, Tim!'
myGreeting.trigger('say', 'afternoon', 'Bob'); // 'Good afternoon, Bob!'
```

#### .transition

`.transition` passes additional parameters to `onEnterState` and `onExitState` of the containing state.

```javascript
var myDebugState = new Interstate('state2');
myDebugState.states = {
    state1 : {
        onEnterState : function(debug) {
            if(debug) console.log('state1', 'onEnterState');
        },
        onExitState : function(debug) {
            if(debug) console.log('state1', 'onExitState');
        }
    },
    state2 : {}
}

myDebugState.transition('state1'); // no output
myDebugState.transition('state2'); // no output
myDebugState.transition('state1', true); // output: state1 onEnterState
myDebugState.transition('state2'); // output: state1 onExitState
```

### Return values

```javascript
var myRetState = new Interstate('open');
myRetState.states = {
    open : {
        value : 2,
        times2 : function(number) {
            return number * 2;
        }
    },
    locked : {
		times2 : 0,
        onEnterState : function() {
            return 'cant change me';
        },
        onExitState : function() {
            return false;
        }
    }
}

myRetState.trigger('value'); // returns 2
myRetState.trigger('times2', 10); // returns 20
myRetState.transition('locked'); // returns 'cant change me'
myRetState.trigger('value'); // returns undefined
myRetState.trigger('times2', 10); // returns 0
myRetState.transition('open'); // returns false
myRetState.trigger('times2', 10); // returns 0
```

#### .trigger

The return value of `.trigger` is the return of the corresponding action function, or the value of the corresponding field.

#### .transition / onEnterState

The return value of `.transition` is the return of `onEnterState` of the new state.

#### onExitState

If `onExitState` returns `false`, then a change of state is prevented. In this case `onEnterState` of the new state is not called, and `.transition` returns `false` as well.

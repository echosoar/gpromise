(function(global,undefined){

	var PENDING = undefined, FULFILLED = 1, REJECTED = 2;
	
	var isFunction = function(fn){
		return 'function' === typeof fn;
	}
	
	var objToArray=function(obj){
		return Array.prototype.slice.call(obj);
	}
	
	var transit=function(status,args){
		var _promise=this;
		if(_promise.status!==PENDING)return;		
		_promise.status=status;	
		var st= status===FULFILLED;
		setTimeout(function(){
			
			var queue=_promise[st ? 'resolves' : 'rejects'];
			while(fn=queue.shift()){
				args=fn(args)||args;
			}
			_promise[st ? '_value' : '_reason'] = args;
			_promise['resolves']=_promise['rejects']=undefined;
		});
	}
	
	var Promise=function(resolver){
		if(!isFunction(resolver)){
			throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
		}
		if(!(this instanceof Promise)){
			return new Promise(resolver);
		}
		
		var _promise=this;
		_promise.status=PENDING;
		_promise.resolves=[];
		_promise.rejects=[];
		
		var resolve=function(){
			transit.call(_promise,FULFILLED,objToArray(arguments));
		}
		
		var reject=function(){
			transit.call(_promise,REJECTED,objToArray(arguments));
		}
		resolver(resolve,reject);	
	}
	
	Promise.prototype.then=function(onFulfilled,onRejected){
		var _promise=this;
		
		return Promise(function(resolve,reject){
			
			function FN_fulfilled(args){
				
				var res=isFunction(onFulfilled) && onFulfilled.apply(null,args)||args;
				resolve(res);
				
			}
		
			function FN_rejected(args){
				var res=isFunction(onRejected) && onRejected.apply(null,args)||args;
				reject(res);
			}
			
			if(_promise.status === PENDING){
				_promise.resolves.push(FN_fulfilled);
				_promise.rejects.push(FN_rejected);
			}else if(_promise.status === FULFILLED){
				FN_fulfilled(_promise._value);
			}else if(_promise.status === REJECTED){
				FN_rejected(_promise._reason);
			}
		});
	}
	
	Promise.prototype.delay=function(time){
		var _promise=this;
		return Promise(function(resolve,reject){
			setTimeout(function(){
				resolve.apply(null,_promise._value);
			},time);
		});
	}
	
	global.Promise=Promise;
	
})(this);
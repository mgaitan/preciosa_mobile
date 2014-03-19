
function Queue(name){
  var queue  = [];

  if (typeof(localStorage[name]) !== 'undefined') {
    queue = JSON.parse(localStorage[name]);
  }
  else {
    localStorage[name] = '[]';
  }

  this.qsize = function(){
    return queue.length;
  }

  this.empty = function(){
    return (queue.length == 0);
  }

  this.put = function(item){
    queue.push(item);
    localStorage.precios = JSON.stringify(queue);
  }

  this.get = function(){
    if (queue.length == 0) return undefined;

    var item = queue[0];
    queue = queue.slice(1);

    localStorage.precios = JSON.stringify(queue);
    return item;
  }
  this.debug = function(){console.log(queue)}
}

define(function()
{

  var WindowAnimationRunner = function(tick, terminate, setUp, tearDown, win)
  {
    this.tick = tick;
    this.terminate = terminate;
    this.setUp = setUp;
    this.tearDown = tearDown;
    this.window = win;
    this.escKeyPressed = false;
  };

  WindowAnimationRunner.prototype.start = function()
  {
    var MILLIS_PER_SECOND = 1000;
    var self = this;

    var onDocumentKeyDown = function(event)
    {
      if (event.keyCode == 27)
      {
        self.escKeyPressed = true;
        event.preventDefault();
      }
    };

    var animate = function(timestamp)
    {
      if (self.startTime)
      {
        self.elapsed = timestamp - self.startTime;
      }
      else
      {
        self.startTime = timestamp;
        self.elapsed = 0;
      }
      var terminate = self.terminate;
      if (self.escKeyPressed || terminate(self.elapsed / MILLIS_PER_SECOND))
      {
        self.window.cancelAnimationFrame(self.requestID);
        self.window.document.removeEventListener('keydown', onDocumentKeyDown, false);
        try
        {
          self.tearDown(self.exception);
        }
        catch(e)
        {
          console.log(e);
        }
      }
      else
      {
        self.requestID = self.window.requestAnimationFrame(animate);
        try
        {
          self.tick(self.elapsed / MILLIS_PER_SECOND);
        }
        catch(e)
        {
          self.exception = e;
          self.escKeyPressed = true;
        }
      }
    };
    self.setUp();
    self.window.document.addEventListener('keydown', onDocumentKeyDown, false);
    self.requestID = self.window.requestAnimationFrame(animate);
  }

  return WindowAnimationRunner;

});
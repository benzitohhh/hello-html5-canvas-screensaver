var MAX_SQUARES = 200;

var MAX_WIDTH = 1000;
var MIN_WIDTH = 30;

var MIN_D_WIDTH = 2;

var MAX_HEIGHT = 750;
var MIN_HEIGHT = 30;

var MIN_INDENT = 3;
var MAX_INDENT = 60;

var STEP_TIME = 100;

var FULL_STEP_TIME = 1500;

var BIG_STEP_TIME = 600;

var ctx = document.getElementById('canvas').getContext('2d');

function as_degree(rad) {
  return 360 / (2 * Math.PI) * rad;
}

function get_next_angle(width, indent) {
  var opp = width - indent;
  return Math.PI - Math.atan(opp / indent) - (Math.PI / 2);
}

function get_next_width(width, indent) {
  var opp = width - indent;
  return Math.sqrt(opp * opp + indent * indent);
}

function get_num_squares(start_width, end_width, indent) {
  var angle = 0;
  var width = start_width;

  var next_angle, next_width;
  var d_width = MIN_D_WIDTH + 1;

  var num_squares = 0;
  while (width >= end_width && num_squares <= MAX_SQUARES && d_width > MIN_D_WIDTH) {
    num_squares++;

    next_angle = get_next_angle(width, indent);
    next_width = get_next_width(width, indent);

    d_width = width - next_width;

    angle = next_angle;
    width = next_width;
  }

  return num_squares;
}

function get_random_int(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function _draw(deferred, i, ctx, indent, num_squares, width, color_scale) {
  if (i >= num_squares) {
    return deferred.resolve();
  }

  // fill/stroke
  ctx.strokeRect(0, 0, width, width);
  ctx.fillStyle = color_scale(i);
  ctx.fillRect(0, 0, width, width);

  // Get next values
  var next_angle = get_next_angle(width, indent);
  var next_width = get_next_width(width, indent);

  // translate
  ctx.translate(indent, 0);
  ctx.rotate(next_angle);

  var step_time = FULL_STEP_TIME / num_squares;

  Q
    .delay(step_time)
    .then(function() {
      return _draw(deferred, i+1, ctx, indent, num_squares, next_width, color_scale);
    })
    .done()
  ;

}

function draw(ctx, start_x, start_y, indent, initial_width, start_angle, num_squares, color_scale) {
  return Q.fcall(function() {
      ctx.save();
      ctx.translate(start_x, start_y);
      ctx.rotate(start_angle);
      return null;
    })
    .then(function() {
      var deferred = Q.defer();
      _draw(deferred, 0, ctx, indent, num_squares, initial_width, color_scale);
      return deferred.promise;
    })
    .then(function() {
      ctx.restore();
      return null;
    })
  ;
}

function draw_random() {
  var indent = get_random_int(MIN_INDENT, MAX_INDENT);
  var initial_width = get_random_int(MIN_WIDTH, MAX_WIDTH);
  //var end_width = get_random_int(MIN_WIDTH, initial_width);
  var end_width = MIN_WIDTH - 10;

  var initial_angle = Math.PI / 4 - Math.random() * Math.PI / 2;

  var start_x = get_random_int(0, MAX_WIDTH * 0.5);
  var start_y = get_random_int(0, MAX_HEIGHT * 0.5);

  var num_squares = get_num_squares(initial_width, end_width, indent);

  // colour gradient
  var color_scale = d3.scale.linear()
        .domain([0, num_squares - 1])
        .range(["red", "yellow"]);

  return draw(ctx, start_x, start_y, indent, initial_width, initial_angle, num_squares, color_scale);
}

function loop() {
  draw_random()
    .delay(BIG_STEP_TIME)
    .then(loop)
  ;

}

loop();

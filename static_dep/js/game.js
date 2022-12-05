let element=document.body;
var computedStyle = getComputedStyle(element);

var object_scores = Object.create(null);
object_scores['L1']=1;
object_scores['L2']=2;
object_scores['L3']=3;
object_scores['L4']=4;
object_scores['L5']=5;
object_scores['L6']=6;
object_scores['L7']=7;
object_scores['L8']=8;
object_scores['L9']=9;
object_scores['L10']=10;


var object_levels = Object.create(null);

DEPLOYMENT=true;
POSITION_OFFSET_X=0;
POSITION_OFFSET_Y=0;
TOP=75;

if(DEPLOYMENT) {

    object_levels['L1'] = [25, 'L2', 30, '/static/assets/1dogecoin.png',];
    object_levels['L2'] = [30, 'L3', 35, '/static/assets/2Solana.png'];
    object_levels['L3'] = [35, 'L4', 40, '/static/assets/3ADA.png'];
    object_levels['L4'] = [40, 'L5', 45, '/static/assets/4busd.png'];
    object_levels['L5'] = [45, 'L6', 50, '/static/assets/5XRP.png'];
    object_levels['L6'] = [50, 'L7', 55, '/static/assets/6bnb.png'];
    object_levels['L7'] = [55, 'L8', 60, '/static/assets/7usdc.png'];
    object_levels['L8'] = [60, 'L9', 65, '/static/assets/8ether.png'];
    object_levels['L9'] = [65, 'L10', 70, '/static/assets/9ethereum.png'];
    object_levels['L10'] = [70, '', 75, '/static/assets/10bitcoin.png'];
}else{
    object_levels['L1'] = [25, 'L2', 30, '../static/assets/1dogecoin.png',];
    object_levels['L2'] = [30, 'L3', 35, '../static/assets/2Solana.png'];
    object_levels['L3'] = [35, 'L4', 40, '../static/assets/3ADA.png'];
    object_levels['L4'] = [40, 'L5', 45, '../static/assets/4busd.png'];
    object_levels['L5'] = [45, 'L6', 50, '../static/assets/5XRP.png'];
    object_levels['L6'] = [50, 'L7', 55, '../static/assets/6bnb.png'];
    object_levels['L7'] = [55, 'L8', 60, '../static/assets/7usdc.png'];
    object_levels['L8'] = [60, 'L9', 65, '../static/assets/8ether.png'];
    object_levels['L9'] = [65, 'L10', 70, '../static/assets/9ethereum.png'];
    object_levels['L10'] = [70, '', 75, '../static/assets/10bitcoin.png'];
}

var score=0;
var score_element=document.getElementById('score');
function updateScore(s){
    score+=object_scores[s];
    score_element.innerHTML=score;
}

function ressetScore(){
    score=0;
    score_element.innerHTML=score;
}

// height = element.clientHeight;  // height with padding
// width = element.clientWidth;   // width with padding

width = 390*1.5;
height = 844*1.5;

currentWidth  =  width;
currentHeight = height;
SCALE =  currentWidth / width;

RATIO = width / height;

// height -= (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom));
// width -= (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight));
// alert(width+" "+height);

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

Events = Matter.Events;

var celling = Bodies.rectangle(0, TOP*2+10 ,2*width, 1, { isStatic: true, isSensor:true, render: {
        fillStyle: 'gray',
        strokeStyle: 'gray',
        opacity: 0.1,
        lineWidth: 3
    } });

celling.label="celling";
var ground = Bodies.rectangle(0, height+50 ,2*width, 100, { isStatic: true });
var left = Bodies.rectangle(-25, 10, 50, height*2, { isStatic: true });
var right = Bodies.rectangle(width+25, 0, 50, 2*height, { isStatic: true });

var engine=null;
var render=null;
var runner=null;

var gravity=1;
var count=0;
var counter=1;
function initializeWorld(){
    count=0;
    counter=1;
    engine = Engine.create();
    render= Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: 'rgb(255,255,255)'
        }
    });

    runner = Runner.create();
    runner.delta = 1000 / 240;

    Render.run(render);
    Runner.run(runner, engine);

    Composite.add(engine.world, [celling, left, ground, right]);

    engine.world.gravity.y=1;


    engine.timing.timeScale = 1.0;
    gravity = engine.world.gravity;

}



function linkHooks(){
    render.canvas.addEventListener('mousedown',function(event) {
        mouseDown = true;
    });

    render.canvas.addEventListener('mouseup', function(event) {

        mouseDown = false;
        let pos=(event.x - POSITION_OFFSET_X)/SCALE;
        if(pos<object_levels[next_ball.label][0]){
            pos=object_levels[next_ball.label][0]+1;
        }else if(pos>width-object_levels[next_ball.label][0]){
            pos=width-object_levels[next_ball.label][0]-1;
        }

        // Matter.Body.applyForce( next_ball, {x: next_ball.position.x, y: next_ball.position.y}, {x: 0.0, y: 0.5});

        Matter.Body.set(next_ball, "position", {x: pos, y: 65});
        // Matter.Body.set(next_ball, "position", {x: event.x, y: 100});
        // balls.push(next_ball);
        lastBall=next_ball;
        next_ball=null;
        // count+=1;
        // if(count%2==0){
        //     counter+=1;
        // }
        // if(counter>10) counter=1;

        var rnd=Math.random();
        if(rnd<0.2) counter=1
        else if(rnd<0.35) counter=2
        else if(rnd<0.45) counter=3
        else if(rnd<0.55) counter=4
        else if(rnd<0.65) counter=5
        else if(rnd<0.75) counter=6
        else if(rnd<0.85) counter=7
        else if(rnd<0.95) counter=8
        else if(rnd<0.99) counter=9
        else counter=10

        setTimeout(function(){
            scaleImage(object_levels['L'+counter][3], object_levels['L'+counter][2], object_levels['L'+counter][2], function(canvas){
                next_ball=Bodies.circle(pos, TOP, object_levels['L'+counter][0]);
                next_ball.label="L"+counter;
                next_ball.restitution=0.4;
                next_ball.render.sprite.texture=object_levels['L'+counter][4];
                Composite.add(engine.world, next_ball);
            });
        }, 500);



        // next_ball=Bodies.circle(400, 100, 10);
        // next_ball.label="L1";
        // Composite.add(engine.world, next_ball);
    });

    render.canvas.addEventListener('mousemove', function(event) {
        if(mouseDown){
            // let pos=event.x;
            // console.log(event.x, (event.x - POSITION_OFFSET_X)/SCALE)
            let pos=(event.x - POSITION_OFFSET_X)/SCALE;
            if(pos<object_levels[next_ball.label][0]){
                pos=object_levels[next_ball.label][0]+1;
            }else if(pos>width-object_levels[next_ball.label][0]){
                pos=width-object_levels[next_ball.label][0]-1;
            }
            Matter.Body.set(next_ball, "position", {x: pos, y: TOP});
        }

        // balls.push(new Ball(event.x, event.y, 30,90,0.6));
    });

    render.canvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(canvas, e);
        var x= touch.clientX;
        var y= touch.clientY;

        mouseDown = true;

    }, false);
    render.canvas.addEventListener("touchend", function (e) {
        // var touch = e.touches[0];
        // var x = next_ball.x;
        // // var y = touch.clientY;
        //
        // mouseDown = false;
        // alert(x);

        // if(pos<object_levels[next_ball.label][0]){
        //         pos=object_levels[next_ball.label][0]+1;
        // }else if(pos>width-object_levels[next_ball.label][0]){
        //     pos=width-object_levels[next_ball.label][0]-1;
        // }
        // Matter.Body.set(next_ball, "position", {x: pos, y: 100});

        // Matter.Body.set(next_ball, "position", {x: event.x, y: 100});
        // balls.push(next_ball);
        Matter.Body.applyForce( next_ball, {x: next_ball.position.x, y: next_ball.position.y}, {x: 0.0, y: 0.4});

        next_ball=null;
        count+=1;
        if(count%2==0){
            counter+=1;
        }
        if(counter>10) counter=1;
        setTimeout(function(){
            scaleImage(object_levels['L'+counter][3], object_levels['L'+counter][2], object_levels['L'+counter][2], function(canvas){
                next_ball=Bodies.circle(200, TOP, object_levels['L'+counter][0]);
                next_ball.label="L"+counter;
                next_ball.restitution=0.4;
                next_ball.render.sprite.texture=object_levels['L'+counter][4];
                Composite.add(engine.world, next_ball);
            });
        }, 500);

    }, false);
    render.canvas.addEventListener("touchmove", function (e) {
        var touch = e.touches[0];
        mouseDown=true;

        // var x= touch.clientX;
        // var y= touch.clientY;
        //

        let pos=(touch.clientX - POSITION_OFFSET_X)/SCALE;
        if(pos<object_levels[next_ball.label][0]){
            pos=object_levels[next_ball.label][0]+1;
        }else if(pos>width-object_levels[next_ball.label][0]){
            pos=width-object_levels[next_ball.label][0]-1;
        }
        Matter.Body.set(next_ball, "position", {x: pos, y: TOP});
        // alert(pos);
        //
        // render.canvas.dispatchEvent(mouseEvent);
    }, false);

    Events.on(engine, 'beforeUpdate', function(event) {
        // if(lastBall!=null){
        //     console.log("V "+lastBall.velocity.x+" "+lastBall.velocity.y);
        // }
        // alert("Update");
        if(next_ball!=null) {
            Matter.Body.applyForce(next_ball, next_ball.position, {
                x: -gravity.x * gravity.scale * next_ball.mass,
                y: -gravity.y * gravity.scale * next_ball.mass
            });
        }
    });

    Events.on(engine, 'collisionActive', function(event) {
        // console.log("Evento: ", event)
        var pairs = event.pairs;
        // console.log("Pair no visible: ", pairs.length)
        // console.log("Pair visible: ", pairs[0]);
        var removed = [];
        for (var i = 0; i < pairs.length; i++) {
            // console.log("colision between " + pairs[i].bodyA.label + " - " + pairs[i].bodyB.label);
            if (pairs[i].bodyA.label == 'celling' || pairs[i].bodyB.label == 'ceeling') {
                var o = pairs[i].bodyA.label == 'celling' ? pairs[i].bodyB : pairs[i].bodyA;
                if (Math.abs(o.velocity.x) < 0.001 & Math.abs(o.velocity.y) < 0.001) {
                    stopGame();
                }
            }
        }
    });


    Events.on(engine, 'collisionStart', function(event) {
        // console.log("Evento: ", event)
        var pairs = event.pairs;
        // console.log("Pair no visible: ", pairs.length)
        // console.log("Pair visible: ", pairs[0]);
        var removed=[];
        for(var i=0; i<1; i++){
            // console.log("colision between " + pairs[i].bodyA.label + " - " + pairs[i].bodyB.label);
            if(pairs[i].bodyA.label==pairs[i].bodyB.label && pairs[i].bodyA.label!=''){
                if(pairs[i].bodyA )
                    var x=pairs[i].bodyA.position.x;
                var y=pairs[i].bodyA.position.y;
                var nl=object_levels[pairs[i].bodyB.label];
                updateScore(pairs[i].bodyA.label);
                removed.push(pairs[i].bodyA);
                removed.push(pairs[i].bodyB);
                Matter.Composite.remove(engine.world, pairs[i].bodyA);
                Matter.Composite.remove(engine.world, pairs[i].bodyB);
                // alert(object_levels[nl[1]].length);
                if(nl[1]!='') {
                    console.log("Removing");
                    var nw = Bodies.circle(x, y, nl[2]);
                    nw.restitution=0.4;
                    if (object_levels[nl[1]].length < 5) {
                        // scaleImage(nl[3], nl[1], nl[1], function (canvas) {
                        //     // Append the canvas element to the li.
                        //     // liElm.appendChild(canvas);
                        //     // alert("done")
                        //     object_levels[nl[1]].push(canvas);
                        //     nw.render.sprite.texture=object_levels[nl[1]][4];
                        // });
                    } else {
                        nw.render.sprite.texture = object_levels[nl[1]][4];
                    }

                    nw.render.sprite.xScale = 1;
                    nw.render.sprite.yScale = 1;
                    nw.label = nl[1];
                    Composite.add(engine.world, nw);
                }
            }
        }

    });

    // Events.on(engine, 'collisionActive', function(event) {
    //     // console.log("Evento: ", event)
    //     var pairs = event.pairs;
    //     // console.log("Pair no visible: ", pairs.length)
    //     // console.log("Pair visible: ", pairs[0]);
    //     var removed=[];
    //     for(var i=0; i<1; i++){
    //         console.log("colision between " + pairs[i].bodyA.label + " - " + pairs[i].bodyB.label);
    //         if(pairs[i].bodyA.label==pairs[i].bodyB.label && pairs[i].bodyA.label!=''){
    //             if(pairs[i].bodyA )
    //                 var x=pairs[i].bodyA.position.x;
    //             var y=pairs[i].bodyA.position.y;
    //             var nl=object_levels[pairs[i].bodyB.label];
    //             updateScore(pairs[i].bodyA.label);
    //             removed.push(pairs[i].bodyA);
    //             removed.push(pairs[i].bodyB);
    //             Matter.Composite.remove(engine.world, pairs[i].bodyA);
    //             Matter.Composite.remove(engine.world, pairs[i].bodyB);
    //             // alert(object_levels[nl[1]].length);
    //             if(nl[1]!='') {
    //                 console.log("Removing");
    //                 var nw = Bodies.circle(x, y, nl[2]);
    //                 nw.restitution=0.4;
    //                 if (object_levels[nl[1]].length < 5) {
    //                     // scaleImage(nl[3], nl[1], nl[1], function (canvas) {
    //                     //     // Append the canvas element to the li.
    //                     //     // liElm.appendChild(canvas);
    //                     //     // alert("done")
    //                     //     object_levels[nl[1]].push(canvas);
    //                     //     nw.render.sprite.texture=object_levels[nl[1]][4];
    //                     // });
    //                 } else {
    //                     nw.render.sprite.texture = object_levels[nl[1]][4];
    //                 }
    //
    //                 nw.render.sprite.xScale = 1;
    //                 nw.render.sprite.yScale = 1;
    //                 nw.label = nl[1];
    //                 Composite.add(engine.world, nw);
    //             }
    //         }
    //     }
    //
    // });

}

let mouseDown = false;
// var next_ball= new Ball(30, 35, 30,90, 0.3);





var next_ball=null;




document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);
document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);
document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX,
        y: touchEvent.touches[0].clientY
    };
}



lastBall=null;




var images=[]

function scaleImage(url, width, height, callback){
    var img = new Image(),
        width = width,
        height = height,
        callback;

    // When the images is loaded, resize it in canvas.
    img.onload = function(){
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height= height;
        // this.toString();
        // draw the img into canvas
        ctx.drawImage(this, 0, 0, width, height);

        // Run the callback on what to do with the canvas element.
        callback(canvas);
    };

    img.src = url;
    images.push(img);
}

function loadImageRec(i){
    if(i==11) return;
    console.log("L"+i);
    scaleImage(object_levels['L'+i][3], object_levels['L'+i][0]*2, object_levels['L'+i][0]*2, function (canvas) {
        // Append the canvas element to the li.
        // liElm.appendChild(canvas);
        object_levels['L'+i].push(canvas.toDataURL());
        loadImageRec(i+1)
    });
}

function stopGame(){
    next_ball=null;
    document.getElementById('gameover').style.visibility='visible';
    Matter.World.clear(engine.world);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};
}
// initializeWorld();
// linkHooks();

function resize(){
    currentHeight = window.innerHeight;
    console.log(window.innerHeight, window.innerWidth);
    // resize the width in proportion
    // to the new height
    currentWidth = currentHeight * RATIO;
    canvas = document.getElementsByTagName('canvas')[0];

    // set the new canvas style width and height
    // note: our canvas is still 320 x 480, but
    // we're essentially scaling it with CSS
    canvas.style.width = currentWidth + 'px';
    canvas.style.height = currentHeight + 'px';



    POSITION_OFFSET_Y = canvas.offsetTop;
    POSITION_OFFSET_X = canvas.offsetLeft;
    SCALE=currentWidth/width;
    // we use a timeout here because some mobile
    // browsers don't fire if there is not
    // a short delay
    window.setTimeout(function() {
        window.scrollTo(0,1);
    }, 1);
}
function startGame(){
    initializeWorld();
    resize();
    linkHooks();
    addBody();

    document.getElementById('gameover').style.visibility='hidden';
    ressetScore();
}

function addBody(){
    gravity=engine.world.gravity;
    next_ball=Bodies.circle(width/2, TOP, object_levels['L1'][0]);
    Composite.add(engine.world, next_ball);
    scaleImage(object_levels['L1'][3], object_levels['L1'][0]*2, object_levels['L1'][0]*2, function(canvas){
        // Append the canvas element to the li.
        // liElm.appendChild(canvas);
        // alert("done")
        object_levels['L1'].push(canvas.toDataURL());
        next_ball.label="L1";
        next_ball.restitution=0.4;
        next_ball.render.sprite.texture=object_levels['L1'][4];
        next_ball.render.sprite.xScale=1;
        next_ball.render.sprite.yScale=1;
    });


    loadImageRec(2);


    // var circle=Bodies.circle(400, 200, 40);
}
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

var is_paused=false;

if(DEPLOYMENT) {

    object_levels['L1'] = [35, 'L2', 40, '/static/assets/10.png',];
    object_levels['L2'] = [40, 'L3', 45, '/static/assets/9.png'];
    object_levels['L3'] = [45, 'L4', 50, '/static/assets/8.png'];
    object_levels['L4'] = [50, 'L5', 55, '/static/assets/7.png'];
    object_levels['L5'] = [55, 'L6', 60, '/static/assets/6.png'];
    object_levels['L6'] = [60, 'L7', 65, '/static/assets/5.png'];
    object_levels['L7'] = [65, 'L8', 70, '/static/assets/4.png'];
    object_levels['L8'] = [70, 'L9', 75, '/static/assets/3.png'];
    object_levels['L9'] = [75, 'L10', 80, '/static/assets/2.png'];
    object_levels['L10'] = [80, '', 85, '/static/assets/1.png'];
}else{
    object_levels['L1'] = [35, 'L2', 40, '../static/assets/10.png',];
    object_levels['L2'] = [40, 'L3', 45, '../static/assets/9.png'];
    object_levels['L3'] = [45, 'L4', 50, '../static/assets/8.png'];
    object_levels['L4'] = [50, 'L5', 55, '../static/assets/7.png'];
    object_levels['L5'] = [55, 'L6', 60, '../static/assets/6.png'];
    object_levels['L6'] = [60, 'L7', 65, '../static/assets/5.png'];
    object_levels['L7'] = [65, 'L8', 70, '../static/assets/4.png'];
    object_levels['L8'] = [70, 'L9', 75, '../static/assets/3.png'];
    object_levels['L9'] = [75, 'L10', 80, '../static/assets/2.png'];
    object_levels['L10'] = [80, '', 85, '../static/assets/1.png'];
}

var score=0;

var score_element=document.getElementById('score');
function updateScore(s){
    score+=object_scores[s];
    score_element.innerHTML=score;
    if(score>window.best_score){
        window.best_score=score;
        updategamescore();
    }
}

function ressetScore(){
    score=0;
    score_element.innerHTML=score;
}

function updategamescore(){
    fetch('/game/updatescore/'+_uid, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "score": score })
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)))
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

Matter.Resolver._restingThresh = 2;

var celling = Bodies.rectangle(0, TOP*2+10 ,2*width, 1, { isStatic: true, isSensor:true, render: {
        fillStyle: 'white',
        strokeStyle: 'white',
        opacity: 0.3,
        lineWidth: 3
    } });

celling.label="celling";
var ground = Bodies.rectangle(1, height ,2*width+1, 100, {
    isStatic: true,
    render: {
        fillStyle: 'transparent',
        strokeStyle: 'white',
        opacity: 0.5,
        lineWidth: 5
    }
});
var left = Bodies.rectangle(-25, 10, 50, height*2, {
    isStatic: true,
    render: {
        opacity: 0.0,
    }});
var right = Bodies.rectangle(width+25, 0, 50, 2*height, {
    isStatic: true,
    render: {
        opacity: 0.0,
    }});

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
        if(is_paused) return;
        mouseDown = false;

        var rnd=Math.random();
        if(rnd<0.4) counter=1
        else if(rnd<0.60) counter=2
        else if(rnd<0.75) counter=3
        else if(rnd<0.85) counter=4
        else if(rnd<0.90) counter=5
        else if(rnd<0.95) counter=6
        else if(rnd<0.98) counter=7
        else if(rnd<0.99) counter=8
        else if(rnd<0.995) counter=9
        else counter=10
        let pos=next_ball.position.x;
        Matter.Body.applyForce( next_ball, {x: next_ball.position.x, y: next_ball.position.y}, {x: 0.0, y: 0.0});

        next_ball=null;
        count+=1;
        if(count%2==0){
            counter+=1;
        }
        if(counter>10) counter=1;
        setTimeout(function(){
            scaleImage(object_levels['L'+counter][3], object_levels['L'+counter][2], object_levels['L'+counter][2], function(canvas){
                next_ball=Bodies.circle(pos, TOP, object_levels['L'+counter][0]);
                next_ball.label="L"+counter;
                next_ball.restitution=0.1;
                next_ball.render.sprite.texture=object_levels['L'+counter][4];
                Composite.add(engine.world, next_ball);
            });
        }, 500);

    });

    render.canvas.addEventListener('mousemove', function(event) {
        if(is_paused) return;
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
        if(is_paused) return;
        mousePos = getTouchPos(canvas, e);
        var x= touch.clientX;
        var y= touch.clientY;

        mouseDown = true;

    }, false);
    render.canvas.addEventListener("touchend", function (e) {
        if(is_paused) return;
        var rnd=Math.random();
        if(rnd<0.4) counter=1
        else if(rnd<0.60) counter=2
        else if(rnd<0.75) counter=3
        else if(rnd<0.85) counter=4
        else if(rnd<0.90) counter=5
        else if(rnd<0.95) counter=6
        else if(rnd<0.98) counter=7
        else if(rnd<0.99) counter=8
        else if(rnd<0.995) counter=9
        else counter=10

        let pos=next_ball.position.x;

        Matter.Body.applyForce( next_ball, {x: next_ball.position.x, y: next_ball.position.y}, {x: 0.0, y: 0.0});

        next_ball=null;
        count+=1;
        if(count%2==0){
            counter+=1;
        }
        if(counter>10) counter=1;
        setTimeout(function(){
            scaleImage(object_levels['L'+counter][3], object_levels['L'+counter][2], object_levels['L'+counter][2], function(canvas){
                next_ball=Bodies.circle(pos, TOP, object_levels['L'+counter][0]);
                next_ball.label="L"+counter;
                next_ball.restitution=0.1;
                next_ball.render.sprite.texture=object_levels['L'+counter][4];
                Composite.add(engine.world, next_ball);
            });
        }, 500);


    }, false);
    render.canvas.addEventListener("touchmove", function (e) {
        if(is_paused) return;
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


    Events.on(engine, 'afterUpdate', function (event){
        // if(me) return
        // me=true;
        var removed=[];
        for(var i=0; i<wait_list.length;i++){
            console.log("***", wait_list[i].length)
            if(removed.includes(wait_list[i][0]) || removed.includes(wait_list[i][1])){
                console.log("pass");
                continue
            }
            var x =wait_list[i][0].position.x;
            var y =wait_list[i][0].position.y;
            var nl = object_levels[wait_list[i][1].label];
            updateScore(wait_list[i][0].label);
            // removed.push(event.bodyA);
            // removed.push(event.bodyB);
            Matter.Composite.remove(engine.world, wait_list[i][0]);
            Matter.Composite.remove(engine.world, wait_list[i][1]);
            removed.push(wait_list[i][0]);
            removed.push(wait_list[i][1]);
            // alert(object_levels[nl[1]].length);
            if (nl[1] != '') {
                console.log("Removing");
                var nw = Bodies.circle(x, y, nl[2]);
                nw.restitution = 0.4;
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

            console.log("removed", wait_list.length);
            break
        }
        wait_list=[];
    });

    var me=false;
    var wait_list=[]
    Events.on(engine, "circles", function (event){
        console.log(">>>",event.bodyA.id, event.bodyB.id);
        console.log(">>>",event.bodyA.position.x, event.bodyA.position.y, event.bodyA.circleRadius)
        distSq=(event.bodyA.position.x-event.bodyB.position.x)*(event.bodyA.position.x-event.bodyB.position.x)+(event.bodyA.position.y-event.bodyB.position.y)*(event.bodyA.position.y-event.bodyB.position.y)
        radSumSq=(event.bodyA.circleRadius+event.bodyB.circleRadius)*(event.bodyA.circleRadius+event.bodyB.circleRadius)
        if(distSq<=radSumSq) {
            wait_list.push([event.bodyA, event.bodyB]);
        }
        //     if(me) return;
        // //me=true;
        //     var x = event.bodyA.position.x;
        //     var y =event.bodyA.position.y;
        //     var nl = object_levels[event.bodyB.label];
        //     updateScore(event.bodyA.label);
        //     // removed.push(event.bodyA);
        //     // removed.push(event.bodyB);
        //     Matter.Composite.remove(engine.world, event.bodyA);
        //     Matter.Composite.remove(engine.world, event.bodyB);
        //             // alert(object_levels[nl[1]].length);
        //     if (nl[1] != '') {
        //         console.log("Removing");
        //         var nw = Bodies.circle(x, y, nl[2]);
        //         nw.restitution = 0.4;
        //         if (object_levels[nl[1]].length < 5) {
        //             // scaleImage(nl[3], nl[1], nl[1], function (canvas) {
        //             //     // Append the canvas element to the li.
        //             //     // liElm.appendChild(canvas);
        //             //     // alert("done")
        //             //     object_levels[nl[1]].push(canvas);
        //             //     nw.render.sprite.texture=object_levels[nl[1]][4];
        //             // });
        //         } else {
        //             nw.render.sprite.texture = object_levels[nl[1]][4];
        //         }
        //         nw.render.sprite.xScale = 1;
        //         nw.render.sprite.yScale = 1;
        //         nw.label = nl[1];
        //         Composite.add(engine.world, nw);
        //     }

    });

    Events.on(engine, 'collisionActive', function(event) {
        // console.log("Evento: ", event)
        var pairs = event.pairs;
        // console.log("Pair no visible: ", pairs.length)
        // console.log("Pair visible: ", pairs[0]);
        var removed = [];
        for (var i = 0; i < pairs.length; i++) {
            // console.log("ca>>> colision between " + pairs[i].bodyA.label + " - " + pairs[i].bodyB.label);
            if (pairs[i].bodyA.label == 'celling' || pairs[i].bodyB.label == 'ceeling') {
                var o = pairs[i].bodyA.label == 'celling' ? pairs[i].bodyB : pairs[i].bodyA;
                if (Math.abs(o.velocity.x) < 0.001 & Math.abs(o.velocity.y) < 0.001) {
                    stopGame();
                }
            }
        }
    });

    //TODO: ACTIVATE
    var CollisionActive=false;
    if(CollisionActive) {
        Events.on(engine, 'collisionStart', function (event) {
            console.log("Evento: ", event)
            var pairs = event.pairs;
            // console.log("Pair no visible: ", pairs.length)
            // console.log("Pair visible: ", pairs[0]);
            var removed = [];
            for (var i = 0; i < 1; i++) {
                // console.log("colision between " + pairs[i].bodyA.label + " - " + pairs[i].bodyB.label);
                if (pairs[i].bodyA.label == pairs[i].bodyB.label && pairs[i].bodyA.label != '') {
                    if (pairs[i].bodyA)
                        var x = pairs[i].bodyA.position.x;
                    var y = pairs[i].bodyA.position.y;
                    var nl = object_levels[pairs[i].bodyB.label];
                    updateScore(pairs[i].bodyA.label);
                    removed.push(pairs[i].bodyA);
                    removed.push(pairs[i].bodyB);
                    Matter.Composite.remove(engine.world, pairs[i].bodyA);
                    Matter.Composite.remove(engine.world, pairs[i].bodyB);
                    // alert(object_levels[nl[1]].length);
                    if (nl[1] != '') {
                        console.log("Removing");
                        var nw = Bodies.circle(x, y, nl[2]);
                        nw.restitution = 0.4;
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
    }

//     Events.on(engine, 'collisionStart collisionActive collisionEnd', function (event) {
//     console.log(event.pairs);
//     });

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
    if(is_paused) return;
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);
document.body.addEventListener("touchend", function (e) {
    if(is_paused) return;
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);
document.body.addEventListener("touchmove", function (e) {
    if(is_paused) return;
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
    if(is_paused)
        document.getElementById('continue').style.display='block';
    else
        document.getElementById('continue').style.display='none';

    document.getElementById("score").style.display="none";
    document.getElementById("pause").style.display="none";



    if(score>window.best_score){
        window.best_score=score;
        updategamescore();
    }

    document.getElementById('current_score_value').innerHTML=score;
    document.getElementById('best_score_value').innerHTML=window.best_score;

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
function pause(){
    // alert("Pause");
    is_paused=runner.enabled;
    runner.enabled=!is_paused;

    if(is_paused){

        if(score>window.best_score){
            window.best_score=score;
            updategamescore();
        }
        document.getElementById('current_score_value').innerHTML=score;
        document.getElementById('best_score_value').innerHTML=window.best_score;

        render.canvas.style.display="none";
        document.getElementById("score").style.display="none";
        document.getElementById("pause").style.display="none";
        document.getElementById('continue').style.display='block';
        document.getElementById('gameover').style.visibility='visible';
        document.getElementById('current_score_value').innerHTML=score;
    }else{
        document.getElementById('gameover').style.visibility='hidden';
        document.getElementById('continue').style.display='none';
        document.getElementById("score").style.display="block";
        document.getElementById("pause").style.display="block";
        render.canvas.style.display="block";
    }
}

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
    canvas.style.background="transparent"



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
    if(is_paused){
        Matter.World.clear(engine.world);
        Engine.clear(engine);
        Render.stop(render);
        Runner.stop(runner);
        render.canvas.remove();
        render.canvas = null;
        render.context = null;
        render.textures = {};
    }
    is_paused=false;

    document.getElementById("score").style.display="block";
    document.getElementById("pause").style.display="block";

    // alert("Start");
    initializeWorld();
    resize();
    linkHooks();
    addBody();
    document.getElementById('dashboard').style.visibility='hidden';
    document.getElementById('dashboard').style.display='none';
    document.getElementById('gameover').style.visibility='hidden';
    // let bs=[];
    // for(var i=0; i<3;i++) {
    //     next_ball=Bodies.circle((2*object_levels['L1'][0]+0)*(i+1), height-object_levels['L1'][0], object_levels['L1'][0]);
    //     next_ball.label="L1";
    //     bs.push(next_ball);
    //     scaleImage(object_levels['L1'][3], object_levels['L1'][0]*2, object_levels['L1'][0]*2, function(canvas){
    //         // Append the canvas element to the li.
    //         // liElm.appendChild(canvas);
    //         // alert("done")
    //         object_levels['L1'].push(canvas.toDataURL());
    //         next_ball.label="L1";
    //         next_ball.restitution=0.4;
    //         next_ball.render.sprite.texture=object_levels['L1'][4];
    //         next_ball.render.sprite.xScale=1;
    //         next_ball.render.sprite.yScale=1;
    //     });
    //
    //     Composite.add(engine.world, next_ball);
    //     if(i>0){
    //         console.log("<<>>", i, i-1, Matter.Detector.canCollide(bs[i-1], bs[i]));
    //         console.log("<<>>", i, i-1, Matter.Collision.collides(bs[i-1], bs[i]));
    //     }
    //
    // }

    ressetScore();
}

function getLeadBoard(){
    let url = '/game/buddy/'+window._uid;

    fetch(url)
        .then(res => res.json())
        .then(out =>{
            buddies=document.getElementById('game_buddies_list');
            buddies.innerHTML="";
            var count = Object.keys(out).length;
            console.log('Checkout this JSON! ', count)
            for(var i=0; i<count; i++){
                buddies.innerHTML+="<div class=\"buddy\">\n" +
                    "          <div class=\"buddy_logo\">\n" +
                    "            <img src=\""+"data:image/png;base64,"+out[i+1][2]+"\">\n" +
                    "          </div>\n" +
                    "              <div class=\"buddy_score\">"+out[i+1][1]+"</div>\n" +
                    "          <div class=\"buddy_score\">"+out[i+1][0].toString()+"</div>\n" +
                    "        </div>";
            }
        })
        .catch(err => { throw err });
}



function addBody(){
    gravity=engine.world.gravity;
    next_ball = Bodies.circle(width / 2, TOP, object_levels['L1'][0]);
    // next_ball=Bodies.circle(width/2, currentHeight-100, object_levels['L1'][0]);
    Composite.add(engine.world, next_ball);
    scaleImage(object_levels['L1'][3], object_levels['L1'][0]*2, object_levels['L1'][0]*2, function(canvas){
        // Append the canvas element to the li.
        // liElm.appendChild(canvas);
        // alert("done")
        object_levels['L1'].push(canvas.toDataURL());
        next_ball.label="L1";
        next_ball.restitution=0.1;
        next_ball.render.sprite.texture=object_levels['L1'][4];
        next_ball.render.sprite.xScale=1;
        next_ball.render.sprite.yScale=1;
    });


    loadImageRec(2);


    // var circle=Bodies.circle(400, 200, 40);
}



// function showLiderBoard(){
//     document.getElementById("dashboard").style.display="none";
//     // getLeadBoardGlobal();
//     // document.getElementById("leaderboard").style.display='flex';
// }

var open_shapshot=0;
var views=["dashboard", "gameover"]

function m(n,d){x=(''+n).length,p=Math.pow,d=p(10,d)
x-=x%3
    if(n<1000) return n;
return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]}

function getLeadBoardGlobal(){
    let url = '/game/liders/'+window._uid;

    fetch(url)
        .then(res => res.json())
        .then(out =>{
            buddies=document.getElementById('globalBoard');
            buddies.innerHTML="";
            var count = Object.keys(out).length;
            console.log('Checkout this JSON! ', count)
            for(var i=0; i<count; i++){

                buddies.innerHTML+="<div class=\"liderboard_item\">\n" +
                    "            <div class=\"liderboard_item_position\">"+(i+1).toString()+"</div>" +
                    "            <div class=\"liderboard_item_logo\">\n" +
                    "                <div class=\"liderboard_item_logo_holder\">\n" +
                    "                    <img src=\""+"data:image/png;base64,"+out[i+1][2]+"\">\n" +
                    "                </div>\n" +
                    "            </div>\n" +
                    "            <div class=\"liderboard_item_name\">\n"
                    +out[i+1][1] +
                    "            </div>\n" +
                    "            <div class=\"liderboard_item_score\">\n" +
                    "                <div class=\"lider_score\">\n"+m(out[i+1][0], 2).toString()+"</div>\n" +
                    "            </div>\n" +
                    "        </div>"

                // buddies.innerHTML+="<div class=\"buddy\">\n" +
                //     "          <div class=\"buddy_logo\">\n" +
                //     "            <img src=\""+"data:image/png;base64,"+out[i+1][2]+"\">\n" +
                //     "          </div>\n" +
                //     "              <div class=\"buddy_score\">"+out[i+1][1]+"</div>\n" +
                //     "          <div class=\"buddy_score\">"+out[i+1][0].toString()+"</div>\n" +
                //     "        </div>";
            }
        })
        .catch(err => { throw err });
}


function closeLiderBoard(){
    document.getElementById("leaderboard").style.display='none';
    document.getElementById(views[open_shapshot]).style.visibility="visible";
}

function showLiderBoard(){

    for(var i=0; i<views.length; i++){
        if(document.getElementById(views[i]).style.visibility!="hidden"){
            open_shapshot=i;
            document.getElementById(views[i]).style.visibility="hidden";
            break;
        }
    }
    document.getElementById("leaderboard").style.display='flex';
    getLeadBoardGlobal();
}
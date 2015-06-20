//array for selecting bug types
var dist = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2];
//array with info on bugs
var bugs;
var paused;
//difficulty level
var level;
var score;
var hiscore;
//elapsed time in game
var elapsed;
//time remaining until bug appears
var interval;
//number of milliseconds until the bugs change which foot they are on
var footTime;
//true iff the bugs are on the right root
var footOn;
//number of milliseconds per frame
var frameTime=100;
//all live bugs
var liveBugs=[];
//all dying bugs
var dyingBugs=[];
//all 5 eaten and uneaten foods
var foods=[[0,0,true],[100,100,true],[200,200,true],[300,300,true],[100,400,true]];

//image references
var foodImg;
var blaImg;
var redImg;
var oraImg;
var blaImgReverse;
var redImgReverse;
var oraImgReverse;
var sprIndex
var timer;

//anonymous onload function
//attaches event handlers on load and initializes variables and visibility as being on start screen
window.onload=function(){
	document.getElementById("startButton").onclick=start;
	document.getElementById("quitButton").onclick=quit;
	document.getElementById("pauseButton").onclick=pauseHandler;
	document.getElementById("myCanvas").onclick=shootBug;
	document.getElementById("retry").onclick=start;
	document.getElementById("quit").onclick=quit;

	//images
	foodImg = document.getElementById("food");
	blaImg = document.getElementById("Black");
	redImg = document.getElementById("Red");
	oraImg = document.getElementById("Orange");

	blaImgReverse = document.getElementById("BlackReverse");
	redImgReverse = document.getElementById("RedReverse");
	oraImgReverse = document.getElementById("OrangeReverse");

	bugs = [ ['Black', 150, 200, 5, blaImg, blaImgReverse],
			 ['Red', 75, 100, 3, redImg, redImgReverse],
			 ['Orange', 60, 80, 1, oraImg, oraImgReverse]];
	if(typeof(Storage) !== "undefined") {
		// Code for localStorage/sessionStorage.
		hiscore=localStorage.getItem("high score");
	} else {
	    // Sorry! No Web Storage support..
		hiscore=0;
	}
	quit();
}

//pause button handler
function pauseHandler(){
	if (paused) {
		unpause();
	}else{
		pause()
	};

}

//pause the timer
function pause(){
	window.clearInterval(timer);
	document.getElementById("pauseButton").innerHTML=('(|>)');
	paused=true;
}

//resume the timer
function unpause(){
	document.getElementById("pauseButton").innerHTML=('(||)');
	paused=false;
	//start timer
	timer = window.setInterval(function(){game()}, frameTime);
}

//set visibilities
function visibilities(a,b,c){
	var x = document.getElementsByClassName("startScreen");
	for (i = 0; i < x.length; i++) {
        x[i].hidden = a;
    }
    x = document.getElementsByClassName("gameScreen");
    for (i = 0; i < x.length; i++) {
        x[i].hidden = b;
    }
    x = document.getElementsByClassName("gameOver");
    for (i = 0; i < x.length; i++) {
        x[i].hidden = c;
    }
}

//Start Function
//Start the game
function start(){
	//reset bug variables
	liveBugs=[];
	dyingBugs=[];

    //level = the selected level
	levelOne=document.getElementById("radio1").checked;
	if (levelOne)
		{level = 1;}
	else
		{level = 2;}

	//hide the start screen and show the game screen
	visibilities(true,false,true);

	//randomize food position and set them as uneaten
	for (i = 0; i < foods.length; i++) {
    	foods[i][2] = true;
    	foods[i][0]=Math.floor((Math.random() * 381) + 0);
    	foods[i][1]=Math.floor((Math.random() * 280) + 300);
    }

    //initialize score and countdown until bug appears
    document.getElementById("pauseButton").innerHTML=('(||)');
	paused=false;
    score=0;
	document.getElementById("score").innerHTML="Score : "+score;
    elapsed=0;
	document.getElementById("timer").innerHTML=60-Math.floor(elapsed)+" sec";
    interval=Math.floor((Math.random() * 3) + 1);

    //initialize bugs on right foot with 400 ms until they switch feet
    footTime=400;
    sprIndex=4;

	//start the game
	game();
	//start timer
	timer = window.setInterval(function(){game()}, frameTime);
}

//function for shooting at bugs
function shootBug(){
	//do not allow shooting if paused
	if (!(paused)) {
		//get coordinates of click
		var cursorX = event.pageX;     // Get the horizontal coordinate
		var cursorY = event.pageY;     // Get the vertical coordinate

		//get coordinates of canvas
		var c = document.getElementById("myCanvas");
		var canvasRect=c.getBoundingClientRect();
		var canvasX=canvasRect.left+window.pageXOffset;
		var canvasY=canvasRect.top+window.pageYOffset;

		//get position of click relative to canvas
		var x=cursorX-canvasX;
		var y=cursorY-canvasY;
		//for every live bug
		for (var i = 0; i < liveBugs.length; i++) {
			//if click is within a 30px radius
			if (within30px(liveBugs[i][1],liveBugs[i][2],x,y)) {
				killBug(i);
				i--;
			};
		};
	};
	
}

//kill bug at bugIndex
function killBug(bugIndex){
	var bug=liveBugs[bugIndex];
	//remove bug from list
	liveBugs.splice(bugIndex, 1);
	var species=bug[0];
	//add to score
	score+=bugs[species][3];
	document.getElementById("score").innerHTML="Score : "+score;
	//add bug to dying bugs (the 4th item is the opacity on a scale of 2 to 0)
	dyingBugs.push([bug[0],bug[1],bug[2],2]);
}

//true iff click is within a 30px radius
function within30px(bugX,bugY,x,y){
	//math works for bugs of this size, but would have to change for larger sprites.
	if(Math.sqrt(Math.pow(bugX-x, 2) + Math.pow(bugY-y, 2)) <= 30) {
		return true;
	}
	if(Math.sqrt(Math.pow(bugX-x, 2) + Math.pow(bugY+40-y, 2)) <= 30) {
		return true;
	}
	if(Math.sqrt(Math.pow(bugX+10-x, 2) + Math.pow(bugY-y, 2)) <= 30) {
		return true;
	}
	if(Math.sqrt(Math.pow(bugX+10-x, 2) + Math.pow(bugY+40-y, 2)) <= 30) {
		return true;
	}
	return false;
}

//a frame of the game
function game(){
	var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    //erase the canvas
    ctx.clearRect(0, 0, c.width, c.height);
    var eaten=0
    //draw only uneaten food
    for (i = 0; i < foods.length; i++) {
    	if (foods[i][2]) {
    		ctx.drawImage(foodImg,foods[i][0],foods[i][1]);
    	}else{
    		eaten++;
    	};
    }
    //add a bug if the countdown hits 0
    if (interval <= 0) {
    	addABug();
    	
    };

    //flip the sprites if it is time for them to change which foot they are on
	if (footTime<=0) {
    	footOn= !footOn;
    	if (footOn) {sprIndex=4;}
    	else{sprIndex=5;}
    	footTime=400;
    };

    //Move and draw all the bugs
    for (i = 0; i < liveBugs.length; i++) {
    	moveABug(i);
    	ctx.drawImage(bugs [liveBugs[i][0]] [sprIndex], liveBugs[i][1], liveBugs[i][2] );
    }

    //draw all the dying bugs
    for (var i = 0; i < dyingBugs.length; i++) {
		ctx.globalAlpha = dyingBugs[i][3] / 2;
    	ctx.drawImage(bugs [dyingBugs[i][0]] [4], dyingBugs[i][1], dyingBugs[i][2] );
    	dyingBugs[i][3]-=frameTime/1000;
    	if (dyingBugs[i][3]<=0) {
			dyingBugs.splice(i, 1);
    		i--;
    	};
    };
    ctx.globalAlpha = 1;

    //decrement the intervals
    footTime-=frameTime;
    interval-= frameTime/1000;
    elapsed+=frameTime/1000;
	document.getElementById("timer").innerHTML=60-Math.floor(elapsed)+" sec";
	if (foods.length<=eaten) {
		gameover();
	};

	if (elapsed>=60) {
		gameover();
	};
}

function addABug(){
	//select bug type randomly from distribution
	var species=Math.floor((Math.random() * 10) + 0);
	//add that bug to the top with a random x coordinate between 0 and 390
	var x=interval=Math.floor((Math.random() * 391) + 0);
	var bug=[dist[species],x,0];
	liveBugs.push(bug);
	//reset the interval
    interval=Math.floor((Math.random() * 3) + 1);
}

//move the bug towards the closest food
function moveABug(bugIndex){
	var x=liveBugs[bugIndex][1];
	var y=liveBugs[bugIndex][2];
	//find the shortest path to an uneaten food
	var shortestDistance=800;
	//vertical and horizontal distance to closest food
	var distX, distY;
	for (var i = 0; i < foods.length; i++) {
		if (foods[i][2]) {
			if (Math.sqrt(Math.pow(foods[i][0]-x, 2) + Math.pow(foods[i][1]-y, 2)) < shortestDistance) {
				distX=foods[i][0]-x;
				distY=foods[i][1]-y;
				shortestDistance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
			};
		};
	};
	//distance for the bug to move in a single frame
	var moveDistance=bugs[liveBugs[bugIndex][0]][level] * (frameTime/1000);
	//fraction of the path covered this frame
	var frac=moveDistance/shortestDistance;
	//compute horizontal and vertical distance to travel this frame
	distX*=frac;
	distY*=frac;
	//move bug
	x+=distX;
	y+=distY;
	liveBugs[bugIndex][1]=x;
	liveBugs[bugIndex][2]=y;
	//if bug is touching food, eat it
	eatFood(x, y);
}

//eat food
//if the bug overlaps with a food, eat it
function eatFood(x, y){
	var u;
	var v;
	for (var i = 0; i < foods.length; i++) {
		u=foods[i][0]-x
		v=foods[i][1]-y
		if (-20<u && u<10) {
			if (-20<v && v<40) {
				foods[i][2]=false;
			};
		};
	};
}

//game over
function gameover(){
	window.clearInterval(timer);
	if (score>hiscore) {
    	hiscore=score;
		if(typeof(Storage) !== "undefined") {
		    // Code for localStorage/sessionStorage.
		    localStorage.setItem("high score", hiscore);
		} else {
		    // Sorry! No Web Storage support..
		}
	};
	document.getElementById("gameOverScore").innerHTML="Score: "+score;
	document.getElementById("gameOverHiScore").innerHTML="High Score: "+hiscore;
	visibilities(true,true,false);
}

//quit the game
//stop timer, reset visibilities, update hiscore
function quit(){
	window.clearInterval(timer);
	visibilities(false,true,true);
	document.getElementById("startHiScore").innerHTML="High Score: "+hiscore;
}

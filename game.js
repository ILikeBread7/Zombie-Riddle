var cleared;
var levels;

var exitGame;
var retryGame;
var endGame;
var nextLevel;
var undoTurn;
var stickNumber;

var map_width,map_height;
var switches;
var map_code;
var map;
let messages;

var backup_map;
var backup_zombies;
var backup_stick;

var mouse_x;
var mouse_y;

var pause=false;

var PLAYER_ABSOLUTE_X = Math.floor(WIDTH / 2);
var PLAYER_ABSOLUTE_Y = Math.floor(HEIGHT / 2);

var swordAnimations = [];

const CLEARED_STORAGE_KEY = 'cleared';

function readCleared() {
	return Number(localStorage.getItem(CLEARED_STORAGE_KEY) || 0);
}

function saveCleared(cleared) {
	localStorage.setItem(CLEARED_STORAGE_KEY, cleared);
}

function createZombies(){
	var arr=[];
	
	return{
			reset:function(){
				arr=[];
			},
			addZombie:function(x,y,angle){
				var zombie=function(){
					var character=movingChar();
					character.putAtXY(x,y);
					character.setAngle(angle);
					character.setSpeed(1);
					
					var timer=0;
					var change_time=1;
					var new_angle=angle;
					var angle_speed=Math.PI/64;
					var angle_dir=true;	//true=clockwise, false=counter clockwise;
					var dead=false;
					
					var lock_on_player=false;
					
					var adjustAngle=function(){
						var angle_tmp=(character.getAngle()+2*Math.PI)%(2*Math.PI);
						if(angle_dir)
							angle_tmp+=angle_speed;
						else
							angle_tmp-=angle_speed;
						if(Math.abs(angle_tmp-new_angle)<=2*angle_speed)
							angle_tmp=new_angle;
						character.setAngle(angle_tmp);
					};
					
					var setAngleDir=function(){
						var angle_tmp=(character.getAngle()+4*Math.PI)%(2*Math.PI);
						var angleDiff=Math.abs(angle_tmp-new_angle);
						angle_dir=((angleDiff<Math.PI && new_angle>angle_tmp) || (angleDiff>Math.PI && angle_tmp>new_angle));
					};
					
					return{
						getMovingChar:function(){
							return character;
						},
						move:function(){
							character.move();
						},
						decideMovement:function(){
							if(!lock_on_player && timer%change_time==0){
								timer=1;
								new_angle=2*Math.random()*Math.PI;
								change_time=Math.floor(Math.random()*51)+100;
								setAngleDir();
							}
							adjustAngle();
							character.decideMovement(0);
							timer++;
						},
						searchPlayer:function(ch){
							if(character.getDistance(ch)<4*TILE_WH){
								lock_on_player=true;
								new_angle=(character.getAngleTo(ch)+4*Math.PI)%(2*Math.PI);
								setAngleDir();
							}
							else
								lock_on_player=false;
						},
						stopSearchPlayer:function(){
							lock_on_player=false;
						},
						kill:function(){
							dead=true;
						},
						isDead:function(){
							return dead;
						}
					}
				}();
				arr.push(zombie);
			},
			removeZombie:function(index){
				arr.splice(index,1);
			},
			getZombies:function(){
				return arr;
			},
			getZombiesCopy:function(){
				var copy=createZombies();
				for(var i=0;i<arr.length;i++){
					var ch=arr[i].getMovingChar();
					copy.addZombie(ch.getAbsoluteX(),ch.getAbsoluteY(),ch.getAngle());
				}
				return copy;
			}
	}
}

var zombies=createZombies();

var player=function(){
	var character=movingChar();
	
	var scroll_speed=10;
	var start_x;
	var start_y;
	var in_play=false;
	var scrolling=false;
	var stickman_type=0;
	var sword_range=TILE_WH;
	var timer_limit=20;
	var timer=timer_limit;
	
	var putAtStart=function(){
		character.putAtXY(start_x*TILE_WH,start_y*TILE_WH);
	};
	
	return{
		getMovingChar:function(){
			return character;
		},
		init:function(x,y){
			stickman_type=0;
			start_x=x;
			start_y=y;
			putAtStart();
			character.setSpeed(3);
			scroll_speed=10;
			in_play=false;
		},
		isInPlay:function(){
			return in_play;
		},
		setInPlay:function(val){
			in_play=val;
			if(val==true)
				putAtStart();
			else{
				timer=0;
				zombies.addZombie(character.getAbsoluteX(),character.getAbsoluteY(),character.getAngle());
				playSe(seDead);
				showCharacterInstructions();
			}
		},
		setType:function(num){
			stickman_type=num;
		},
		getType:function(){
			return stickman_type;
		},
		moveTowardsStart:function(){
			character.moveTowards(start_x,start_y,scroll_speed);
		},
		getSwordRange:function(){
			return sword_range;
		},
		getScrollSpeed:function(){
			return scroll_speed;
		},
		setScrolling:function(val){
			scrolling=val;
		},
		isScrolling:function(){
			return scrolling;
		},
		incTimer:function(){
			timer++;
		},
		checkTimer:function(){
			return timer>timer_limit;
		}
	}
}();

function getMapCopy(){
	var newMap=[];
	for(var j=0;j<map_width;j++){
		var line=[];
		for(var i=0;i<map_height;i++)
			line.push(map[j][i]);
		newMap.push(line);
	}
	return newMap;
}

function undo(){
	undoTurn=true;
	$("#undo_button").attr("disabled",true);
}

function getTile(x,y){
	if(x>=0 && x<map_width && y>=0 && y<map_height)
		return map[x][y];
	return null;
}

function mouseMoveListener(event){
	var rect=document.getElementById("editor_canv").getBoundingClientRect();
	mouse_x = Screen.scaleX(event.pageX - rect.left);
	mouse_y = Screen.scaleY(event.pageY - rect.top);
	var ch=player.getMovingChar();
}
function keyListener(event){
	if(event.type=='keydown'){
		if(event.keyCode==27)
			pause=!pause;
		controls.setPressed(event.keyCode);
	}
	else if(event.type=='keyup')
		controls.setReleased(event.keyCode);
}
function exit(){
	$(".in_game").hide();
	$("#win_div").hide();
	exitGame=true;
}

function retry(){
	$("#win_div").hide();
	retryGame=true;
}

function disableAll(disable){
	$("#bridges_game").attr("disabled",disable);
	$("#switches_game").attr("disabled",disable);
	$("#walls_game").attr("disabled",disable);
	$("#fighter_game").attr("disabled",disable);
	$("#nothing_game").attr("disabled",disable);
}

function showTile(ctx,map,x,y){
	var ch=player.getMovingChar();
	const targetX = Math.floor(ch.getTargetX());
	const targetY = Math.floor(ch.getTargetY());
	const targetTile = getTile(targetX, targetY);
	if(x>=0 && x<map_width && y>=0 && y<map_height){
		var img=document.getElementById(getTileName(map[x][y])+"_img");
		const drawX = Math.floor(PLAYER_ABSOLUTE_X + (x - ch.getRealX()) * TILE_WH);
		const drawY = Math.floor(PLAYER_ABSOLUTE_Y + (y - ch.getRealY()) * TILE_WH);
		ctx.drawImage(img, drawX, drawY);
		if (player.isInPlay() && [0, 1, 2].includes(player.getType()) && targetX == x && targetY == y) {
			ctx.beginPath();
			if (
				(player.getType() == 0 && targetTile == 14)
				|| (player.getType() == 1 && targetTile == 12)
				|| (player.getType() == 2 && targetTile == 10)
			) {
				ctx.strokeStyle = '#0f0';
			} else {
				ctx.strokeStyle = '#f00';
			}
			ctx.lineWidth = 3;
			ctx.strokeRect(drawX, drawY, TILE_WH, TILE_WH);
		}
	}
}

function showSwordAnimations(ctx) {
	var playerCh=player.getMovingChar();
	var playerX=playerCh.getAbsoluteX();
	var playerY=playerCh.getAbsoluteY();
	for (let i = 0; i < swordAnimations.length; i++) {
		const sa = swordAnimations[i];

		const img = document.getElementById('blow_' + Math.floor(sa.timer / 5) + '_img');
		drawRotatedImage(ctx, img, PLAYER_ABSOLUTE_X - (playerX - sa.x) - 20, PLAYER_ABSOLUTE_Y - (playerY - sa.y) - 20, sa.angle);

		sa.timer ++;
		if (sa.timer >= 15) {
			sa.finished = true;
		}
	}
	swordAnimations = swordAnimations.filter(sa => !sa.finished);
}

function showZombies(ctx){
	var img=document.getElementById("zombie");
	var arr=zombies.getZombies();
	var playerCh=player.getMovingChar();
	var playerX=playerCh.getAbsoluteX();
	var playerY=playerCh.getAbsoluteY();
	for(var i=0;i<arr.length;i++){
		var ch=arr[i].getMovingChar();
		drawRotatedImage(ctx,img,PLAYER_ABSOLUTE_X-(playerX-ch.getAbsoluteX()),PLAYER_ABSOLUTE_Y-(playerY-ch.getAbsoluteY()),ch.getAngle());
	}
}
function showPlayer(ctx){
	var s="player_"+player.getType()+"_img";
	var img=document.getElementById(s);
	drawRotatedImage(ctx,img,PLAYER_ABSOLUTE_X,PLAYER_ABSOLUTE_Y,player.getMovingChar().getAngle());
}
function decidePlayerAngle(){
	var x=mouse_x-PLAYER_ABSOLUTE_X-20;
	var y=mouse_y-PLAYER_ABSOLUTE_Y-20;
	player.getMovingChar().setAngleToDist(x,y);
}

function getCollidingSquare(x,y){	
	if(y<0 || x<0 || x>=map_width || y>=map_height)
		return createSquare(x,y);
	if(map[x][y]<10)
		return null;
	return createSquare(x,y);
}

function collision(character,map){
	var r=character.getRadius();
	var x=character.getTmpCenterX();
	var y=character.getTmpCenterY();
	var x_left=Math.floor((x-r)/TILE_WH);
	var x_right=Math.floor((x+r)/TILE_WH);
	var y_up=Math.floor((y-r)/TILE_WH);
	var y_down=Math.floor((y+r)/TILE_WH);
	
	var squares=[];
	squares.push(getCollidingSquare(x_left,y_up));
	squares.push(getCollidingSquare(x_left,y_down));
	squares.push(getCollidingSquare(x_right,y_down));
	squares.push(getCollidingSquare(x_right,y_up));
	squares=squares.filter(function(a){
		return a!=null;
	});
	
	character.setMovable(squareCollisions(squares,x,y,r));
}

function playerOnFinish(player){
	var ch=player.getMovingChar();
	var x=ch.getCenterX()/TILE_WH;
	var y=ch.getCenterY()/TILE_WH;
	
	if(getTile(Math.floor(x),Math.floor(y))!=2)
		return false;
	
	var xDist=x%1-0.5;
	var yDist=y%1-0.5;
	
	return (Math.sqrt(xDist*xDist+yDist*yDist)<0.4);
}

function playFrame(ctx){
	if(undoTurn){
		player.setInPlay(false);
		undoTurn=false;
		map=backup_map;
		zombies=backup_zombies;
		stickNumber[backup_stick]++;
		setButtonNumbers();
		enableStick(backup_stick);
	}
	if(pause){
		$("#pause").show();
		return false;
	}
	else
		$("#pause").hide();
	var ch=player.getMovingChar();
	fill(ctx,"#ffffff");
	for(var x=ch.getX()-16;x<ch.getX()+17;x++)
		for(var y=ch.getY()-9;y<ch.getY()+9;y++)
			showTile(ctx,map,x,y);
	var zombieArr=zombies.getZombies();
	for(var i=0;i<zombieArr.length;i++){
		if(zombieArr[i].isDead()){
			zombies.removeZombie(i);
			continue;
		}
		if(player.isInPlay())
			zombieArr[i].searchPlayer(ch);
		else
			zombieArr[i].stopSearchPlayer();
		zombieArr[i].decideMovement();
		collision(zombieArr[i].getMovingChar(),map);
		for(var j=0;j<zombieArr.length;j++){
			if(i==j)
				continue;
			zombieCollision(zombieArr[i].getMovingChar(),zombieArr[j].getMovingChar());
		}
		zombieArr[i].move();
	}
	showZombies(ctx);
	if(player.isInPlay()){
		player.setScrolling(false);
		decidePlayerAngle();
		ch.decideMovement(controls.direction());
		collision(ch,map);
		ch.move();		
		if(playerZombieCollision(ch,zombieArr))
			player.setInPlay(false);
		else{
			showPlayer(ctx);
			showSwordAnimations(ctx);
			if(playerOnFinish(player)){
				$("#undo_button").attr("disabled",true);
				undoGame=false;
				return true;
			}

			const tileX = Math.floor(ch.getCenterX() / TILE_WH);
			const tileY = Math.floor(ch.getCenterY() / TILE_WH);
			const currentTile = getTile(tileX, tileY);
			if (currentTile && currentTile === 5) {
				const message = messages.find(m => m.x === tileX && m.y === tileY);
				if (message) {
					const text = message.message.split('\n');
					const lineHeight = 30;
					const boxHeight = text.length * lineHeight;
					ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
					ctx.fillRect(0, 0, WIDTH, boxHeight);
					ctx.fillStyle = '#fff';
					ctx.font = '20px Trebuchet MS, Helvetica, sans-serif';
					for (let i = 0; i < text.length; i++) {
						ctx.fillText(text[i], 0, 20 + lineHeight * i + 1);
					}
				}
			}
		}
	}
	else{
		if(player.checkTimer()){
			if(controls.keyPressed(3)){	//LEFT
				ch.moveHorizontallyTo(0,player.getScrollSpeed());
				player.setScrolling(true);
			}
			else if(controls.keyPressed(1)){	//RIGHT
				ch.moveHorizontallyTo(map_width,player.getScrollSpeed());
				player.setScrolling(true);
			}
			
			if(controls.keyPressed(0)){	//UP
				ch.moveVerticallyTo(0,player.getScrollSpeed());
				player.setScrolling(true);
			}
			else if(controls.keyPressed(2)){	//DOWN
				ch.moveVerticallyTo(map_height,player.getScrollSpeed());
				player.setScrolling(true);
			}
		}
		
		if(!player.isScrolling())
			player.moveTowardsStart();
		player.incTimer();
	}
	
	return false;
}

function actions(interval,ctx,mapNumber,map,map_code){
	if(retryGame){
		retryGame=false;
		clearInterval(interval);
		endGame=false;
		play(mapNumber,map_code);
		return;
	}
	if(nextLevel){
		clearInterval(interval);
		play(mapNumber+1);
		return;
	}
	if(exitGame){
		clearInterval(interval);
		if(mapNumber==-1){
			fill(ctx,"#eeeeee");
			$(".level_editor").show();
			$("#chosen_doors").hide();
			document.getElementById('editor_text_message').hide();
			playMusic(bgMusicEditor);
		}
		else{
			ctx.clearRect(0, 0, WIDTH, HEIGHT);
			drawTitleText(ctx);
			$("#volume_control").removeClass("volume_control_in_level_editor");
			$("#signature").show();
			$(".start").show();
			playMusic(bgMusicTitle);
		}
		$("#pause").hide();
		$("#go_back").show();
		
	}
	else
		if(!endGame)
			if(playFrame(ctx)){
				endGame=true;
				if(mapNumber>=cleared){
					cleared=mapNumber+1;
					saveCleared(cleared);
					setClearedLevels();
				}
				if(mapNumber>=0 && mapNumber<levels-1)
					$("#next_level").show();
				else
					$("#next_level").hide();
				$("#win_div").show();
				playSe(seWin);
			}
}

function disableZeroes(){
	if(stickNumber[0]==0)
		$("#bridges_game").attr("disabled",true);
	if(stickNumber[1]==0)
		$("#switches_game").attr("disabled",true);
	if(stickNumber[2]==0)
		$("#walls_game").attr("disabled",true);
	if(stickNumber[4]==0)
		$("#fighter_game").attr("disabled",true);
	if(stickNumber[5]==0)
		$("#nothing_game").attr("disabled",true);
}

function enableStick(num){
	switch(num){
		case 0: $("#bridges_game").attr("disabled",false); break;
		case 1: $("#switches_game").attr("disabled",false); break;
		case 2: $("#walls_game").attr("disabled",false); break;
		case 4: $("#fighter_game").attr("disabled",false); break;
		case 5: $("#nothing_game").attr("disabled",false); break;
	}
}

function setButtonNumbers(){
	$("#bridges_div").html(stickNumber[0]);
	$("#switches_div").html(stickNumber[1]);
	$("#walls_div").html(stickNumber[2]);
	$("#fighter_div").html(stickNumber[4]);
	$("#nothing_div").html(stickNumber[5]);
	disableZeroes();
}

function handleSwitchAdding(tile,x,y,w){
	var arr=[];
	arr[0]=[];
	arr[0][0]=x;
	arr[0][1]=y;
	for(var i=2;i<tile.length-1;i++){
		arr[i-1]=[];
		arr[i-1][0]=tile[i]%w;
		arr[i-1][1]=Math.floor(tile[i]/w);
	}
	switches.push(arr);
}

function putTileOnMap(tile,map,w){
	var x,y;
	y=Math.floor(tile[0]/w);
	x=tile[0]%w;

	const tileType = Number(tile[1]);
	map[x][y] = tileType;
	if (tileType === 12) {
		handleSwitchAdding(tile,x,y,w);
	} else if (tileType === 5) {
		handleMessageAdding(atob(tile[2]), x, y);
	}
}

function handleMessageAdding(message, x, y) {
	messages.push({ x, y, message });
}

function putStartOnMap(map,num,map_width){
	var x=Math.floor(num%map_width);
	var y=Math.floor(num/map_width);
	map[x][y]=1;
	player.init(x,y);
}
function readData(map_code){
	var map;
	var s=map_code.split(";");
	for(var i=0;i<6;i++)
		stickNumber[0+i]=s[3+i];
	setButtonNumbers();
	map_width=s[0];
	map_height=s[1];
	map=[];
	for(var x=0;x<map_width;x++){
		map[x]=[];
		for(var y=0;y<map_height;y++)
			map[x][y]=0;
	}
	putStartOnMap(map,s[2],map_width);
	switches=[];
	messages = [];
	for(var i=9;i<s.length-1;i++)
		putTileOnMap(s[i].split(","),map,map_width);
	return map;
}

function sendStickman(num){
	if(!pause){
		hideCharacterInstructions();
		$("#undo_button").attr("disabled",false);
		stickNumber[num]--;
		setButtonNumbers();
		player.setType(num);
		if(player.isInPlay()){
			var ch=player.getMovingChar();
			zombies.addZombie(ch.getAbsoluteX(),ch.getAbsoluteY(),ch.getAngle());
		}
		player.setInPlay(true);
		backup_map=getMapCopy();
		backup_zombies=zombies.getZombiesCopy();
		backup_stick=num;
	}
}

function showCharacterInstructions() {
	const charInstructionsDiv = $('#char_instructions');
	charInstructionsDiv.show();
}

function hideCharacterInstructions() {
	const charInstructionsDiv = $('#char_instructions');
	setTimeout(function() {
		charInstructionsDiv.hide();
		charInstructionsDiv.removeClass('hide_instructions');
		hideCharInstructions();
	}, 500);
	charInstructionsDiv.addClass('hide_instructions');
}

function handleSwitchPress(x,y){
	for(var i=0;i<switches.length;i++){
		if(switches[i][0][0]==x && switches[i][0][1]==y){
			for(var j=1;j<switches[i].length;j++){
				var doorX=switches[i][j][0];
				var doorY=switches[i][j][1];
				var tile=getTile(doorX,doorY);
				if(tile!=null && tile%10==3){
					map[doorX][doorY]=parseInt(tile)+10;
					map[doorX][doorY]%=20;
				}
			}
		}
	}
}

function gameClickListener(){
	if(player!=undefined && player.isInPlay()){
		var ch=player.getMovingChar();
		var tileX=Math.floor(ch.getTargetX());
		var tileY=Math.floor(ch.getTargetY());
		
		var tile=getTile(tileX,tileY);
		if(tile!=null){
			if(tile==14 && player.getType()==0 ||
			tile==10 && player.getType()==2){
				map[tileX][tileY]-=10;
				player.setInPlay(false);
				playSe(tile == 10 ? seWall : seBridge);
			}
			
			if(tile==12 && player.getType()==1){
				handleSwitchPress(tileX,tileY);
				player.setInPlay(false);
				playSe(seSwitch);
			}
		}
		if(player.getType()==4){
			var ch=player.getMovingChar();
			var x=ch.getCenterX();
			var y=ch.getCenterY();
			var sword_range=player.getSwordRange();
			var angle=ch.getAngle();
			const sword_cords = [];

			for (let range_diff = 0; range_diff <= 20; range_diff += 10) {
				for (let angle_diff = -3; angle_diff <= 3; angle_diff++) {
					var sword_y=y-(sword_range+range_diff)*Math.cos(angle+(angle_diff*Math.PI/12));
					var sword_x=x+(sword_range+range_diff)*Math.sin(angle+(angle_diff*Math.PI/12));
					sword_cords.push({ sword_x, sword_y });
					if (range_diff === 0 && angle_diff === 0) {
						addSwordAnimation(sword_x, sword_y, angle);
						playSe(seSword);
					}
				}
			}

			var zombieArr=zombies.getZombies();
			for(var i=0;i<zombieArr.length;i++){
				var ch=zombieArr[i].getMovingChar();
				sword_cords.forEach(sc => {
					const {sword_x, sword_y} = sc;
					if(segmentCircleIntersect(x,y,sword_x,sword_y,ch.getCenterX(),ch.getCenterY(),ch.getRadius())) {
						zombieArr[i].kill();
						playSe(seZombie);
					}
				})
			}
		}
	}
}

function addSwordAnimation(swordX, swordY, angle) {
	swordAnimations.push({
		x: swordX,
		y: swordY,
		angle: angle,
		timer: 0
	});
}

function moveToNextLevel(){
	$("#win_div").hide();
	nextLevel=true;
}

async function play(mapNumber,map_code){
	exitGame=false;
	endGame=false;
	nextLevel=false;
	pause=false;
	undoGame=false;
	$("#undo_button").attr("disabled",true);
	zombies.reset();
	playMusic(bgMusicGame);
	var interval;
	if(map_code==undefined){
		if(mapNumber==-1)
			map_code=exportedMapCode();
		if(mapNumber==-2)
			map_code=$("#level_code").val();
		if(mapNumber>=0)
			map_code = await readMap(mapNumber);
	}
	if(mapNumber>=0)
		$("#level_text").html("Level: "+(mapNumber+1));
	else
		$("#level_text").html("");
	stickNumber=[];
	disableAll(false);
	map=readData(map_code);
	var canv=document.getElementById("canv");
	var ctx=canv.getContext("2d");
	fill(ctx,"#ffffff");
	$(".level_editor").hide();
	$(".start").hide();
	$("#volume_control").addClass("volume_control_in_level_editor");
	$("#go_back").hide();
	$("#signature").hide();
	$(".in_game").show();
	interval=setInterval(function(){actions(interval,ctx,mapNumber,map,map_code);},20);
}

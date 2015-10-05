var exitGame;
var retryGame;
var stickNumber;

var map_width,map_height;
var switches;
var map_code;
var map;

var mouse_x;
var mouse_y;
var map_mouse_x;
var map_mouse_y;

var PLAYER_ABSOLUTE_X=400;
var PLAYER_ABSOLUTE_Y=260;

var player=function(){
	var player_x;
	var player_y;
	var player_angle;
	var speed;
	var player_tmp_x;
	var player_tmp_y;
	
	var start_x;
	var start_y;
	
	var in_play;
	var stickman_type;
	
	var movable=[true,true,true,true];
	
	putAtStart=function(){
			player_tmp_x=player_x=start_x*40 || 0;
			player_tmp_y=player_y=start_y*40 || 0;
			player_angle=0;
	};
	
	return{
		init:function(x,y){
			stickman_type=0;
			start_x=x;
			start_y=y;
			putAtStart();
			speed=3;
			in_play=false;
		},
		getX:function(){
			return Math.floor(player_x/40);
		},
		getY:function(){
			return Math.floor(player_y/40);
		},
		getRealX:function(){
			return player_x/40;
		},
		getRealY:function(){
			return player_y/40;
		},
		getAngle:function(){
			return player_angle;
		},
		decideMovement:function(dir){
			if(dir==-1){
				player_tmp_y=player_y;
				player_tmp_x=player_x;
			}
			else{
				//dir: 0=UP 1=RIGHT 2=DOWN 3=LEFT
				player_tmp_y=player_y-speed*Math.cos(player_angle+dir/2*Math.PI);
				player_tmp_x=player_x+speed*Math.sin(player_angle+dir/2*Math.PI);
			}
		},
		setMovable:function(arr){
			movable=arr;
		},
		move:function(){
			var changeX=player_tmp_x-player_x;
			var changeY=player_tmp_y-player_y;
			if((changeX>0 && movable[1]) || (changeX<0 && movable[3]))
				player_x=player_tmp_x;
			if((changeY>0 && movable[2]) || (changeY<0 && movable[0]))
				player_y=player_tmp_y;
		},
		setAngle:function(angle){
			player_angle=angle;
		},
		
		getTmpCenterX:function(){
			return player_tmp_x+20;
		},
		getTmpCenterY:function(){
			return player_tmp_y+20;
		},
		getRadius:function(){
			return 15;
		},
		isInPlay:function(){
			return in_play;
		},
		setInPlay:function(val){
			in_play=val;
			putAtStart();
		},
		setType:function(num){
			stickman_type=num;
		},
		getType:function(){
			return stickman_type;
		},		
		getTargetX:function(){
			return this.getRealX()+0.5+0.85*Math.sin(player_angle);
		},
		getTargetY:function(){
			return this.getRealY()+0.5-0.85*Math.cos(player_angle);
		}
	}
}();

function mouseMoveListener(event){
	var rect=document.getElementById("editor_canv").getBoundingClientRect();
	mouse_x=event.pageX-rect.left;
	mouse_y=event.pageY-rect.top;
	map_mouse_x=Math.floor((mouse_x)/40);	//+costam
	map_mouse_y=Math.floor((mouse_y)/40); //+costam
}
function keyListener(event){
	if(event.type=='keydown')
		controls.setPressed(event.keyCode);
	else if(event.type=='keyup')
		controls.setReleased(event.keyCode);
}
function exit(){
	$(".in_game").hide();
	exitGame=true;
}

function retry(){
	retryGame=true;
}

function disableAll(disable){
	$("#bridges_game").attr("disabled",disable);
	$("#switches_game").attr("disabled",disable);
	$("#walls_game").attr("disabled",disable);
	$("#thrower_game").attr("disabled",disable);
	$("#fighter_game").attr("disabled",disable);
	$("#nothing_game").attr("disabled",disable);
}

function showTile(ctx,map,x,y){
	if(x>=0 && x<map_width && y>=0 && y<map_height){
		var img=document.getElementById(getTileName(map[x][y])+"_img");
		ctx.drawImage(img,400+(x-player.getRealX())*40,260+(y-player.getRealY())*40);
	}
}
function showPlayer(ctx){
	var s="player_"+player.getType()+"_img";
	var img=document.getElementById(s);
	drawRotatedImage(ctx,img,PLAYER_ABSOLUTE_X,PLAYER_ABSOLUTE_Y,player.getAngle());
}
function decidePlayerAngle(){
	var x=mouse_x-PLAYER_ABSOLUTE_X;
	var y=mouse_y-PLAYER_ABSOLUTE_Y;
	var sinAlpha=x/(Math.sqrt(x*x+y*y));
	if(y<=0)
		player.setAngle(Math.asin(sinAlpha));
	else
		player.setAngle(Math.PI-Math.asin(sinAlpha));
}

function getCollidingSquare(x,y){	
	if(y<0 || x<0 || x>=map_width || y>=map_height)
		return createSquare(x,y);
	if(map[x][y]<10)
		return null;
	return createSquare(x,y);
}

function collision(player,map){
	var r=player.getRadius();
	var x=player.getTmpCenterX();
	var y=player.getTmpCenterY();
	var x_left=Math.floor((x-r)/40);
	var x_right=Math.floor((x+r)/40);
	var y_up=Math.floor((y-r)/40);
	var y_down=Math.floor((y+r)/40);
	
	var squares=[];
	squares.push(getCollidingSquare(x_left,y_up));
	squares.push(getCollidingSquare(x_left,y_down));
	squares.push(getCollidingSquare(x_right,y_down));
	squares.push(getCollidingSquare(x_right,y_up));
	squares=squares.filter(function(a){
		return a!=null;
	});
	
	player.setMovable(squareCollisions(squares,x,y,r));
}

function playFrame(ctx,map){
	fill(ctx,"#ffffff");
	for(var x=player.getX()-10;x<player.getX()+11;x++)
		for(var y=player.getY()-7;y<player.getY()+8;y++)
			showTile(ctx,map,x,y);
	if(player.isInPlay()){
		decidePlayerAngle();
		player.decideMovement(controls.direction());
		collision(player,map);
		player.move();
		showPlayer(ctx);
	}
}

function actions(interval,ctx,mapNumber,map,map_code){
	if(retryGame){
		retryGame=false;
		clearInterval(interval);
		play(mapNumber,map_code);
	}
	if(exitGame){
		clearInterval(interval);
		if(mapNumber==-1){
			fill(ctx,"#eeeeee");
			$(".level_editor").show();
			$("#chosen_doors").hide();
		}
		else{
			ctx.clearRect(0,0,800,600);
			var img=document.getElementById("tytuu");
			ctx.drawImage(img,200,10);
			$("#volume_control").removeClass("volume_control_in_level_editor");
			$("#signature").show();
			$(".start").show();
		}
		$("#go_back").show();
	}
	else
		playFrame(ctx,map);
}

function disableZeroes(){
	if(stickNumber[0]==0)
		$("#bridges_game").attr("disabled",true);
	if(stickNumber[1]==0)
		$("#switches_game").attr("disabled",true);
	if(stickNumber[2]==0)
		$("#walls_game").attr("disabled",true);
	if(stickNumber[3]==0)
		$("#thrower_game").attr("disabled",true);
	if(stickNumber[4]==0)
		$("#fighter_game").attr("disabled",true);
	if(stickNumber[5]==0)
		$("#nothing_game").attr("disabled",true);
}

function setButtonNumbers(){
	$("#bridges_div").html(stickNumber[0]);
	$("#switches_div").html(stickNumber[1]);
	$("#walls_div").html(stickNumber[2]);
	$("#thrower_div").html(stickNumber[3]);
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
	map[x][y]=tile[1];
	if(tile[1]==12)
		handleSwitchAdding(tile,x,y,w);
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
	for(var i=9;i<s.length-1;i++)
		putTileOnMap(s[i].split(","),map,map_width);
	return map;
}

function sendStickman(num){
	stickNumber[num]--;
	setButtonNumbers();
	player.setType(num);
	player.setInPlay(true);
}

function getTile(x,y){
	if(x>=0 && x<map_width && y>=0 && y<map_height)
		return map[x][y];
	return null;
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
		var tileX=Math.floor(player.getTargetX());
		var tileY=Math.floor(player.getTargetY());
		
		var tile=getTile(tileX,tileY);
		if(tile!=null){
			if(tile==14 && player.getType()==0 ||
			tile==10 && player.getType()==2){
				map[tileX][tileY]-=10;
				player.setInPlay(false);
			}
			
			if(tile==12 && player.getType()==1){
				handleSwitchPress(tileX,tileY);
				player.setInPlay(false);
			}
		}
	}
}

function play(mapNumber,map_code){
	exitGame=false;
	var interval;
	if(map_code==undefined){
		if(mapNumber==-1)
			map_code=exportedMapCode();
		if(mapNumber==-2)
			map_code=$("#level_code").val();
		if(mapNumber>=0)
			map_code=readMap(mapNumber);
	}
	player.init();
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
var exitGame;
var retryGame;
var stickNumber;

var map_width,map_height;
var switches;
var map;

function clickListener(event){
	var rect=document.getElementById("editor_canv").getBoundingClientRect();
	var x=Math.floor((event.pageX-rect.left)/40);	//+costam
	var y=Math.floor((event.pageY-rect.top)/40); //+costam
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

function actions(interval,ctx,mapNumber,map){
	if(retryGame){
		retryGame=false;
		clearInterval(interval);
		play(mapNumber,map);
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

function readData(map){
	var s=map.split(";");
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
	switches=[];
	for(var i=9;i<s.length-1;i++)
		putTileOnMap(s[i].split(","),map,map_width);
}

function play(mapNumber,map){
	exitGame=false;
	var interval;
	if(map==undefined){
		if(mapNumber==-1)
			map=exportedMapCode();
		if(mapNumber==-2)
			map=$("#level_code").val();
		if(mapNumber>=0)
			map=readMap(mapNumber);
	}
	stickNumber=[];
	disableAll(false);
	readData(map);
	var canv=document.getElementById("canv");
	var ctx=canv.getContext("2d");
	fill(ctx,"#ffffff");
	$(".level_editor").hide();
	$(".start").hide();
	$("#volume_control").addClass("volume_control_in_level_editor");
	$("#go_back").hide();
	$("#signature").hide();
	$(".in_game").show();
	interval=setInterval(function(){actions(interval,ctx,mapNumber,map);},20);
}
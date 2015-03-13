var exitGame;
var retryGame;

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
	var canv=document.getElementById("canv");
	var ctx=canv.getContext("2d");
	fill(ctx,"#ffffff");
	$(".level_editor").hide();
	$(".start").hide();
	$("#volume_control").addClass("volume_control_in_level_editor");
	$("#go_back").hide();
	$("#signature").hide();
	$(".in_game").show();
	disableAll(false);
	interval=setInterval(function(){actions(interval,ctx,mapNumber,map);},20);
}
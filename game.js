var exitGame;

function clickListener(event){
	var rect=document.getElementById("editor_canv").getBoundingClientRect();
	var x=Math.floor((event.pageX-rect.left)/40);	//+costam
	var y=Math.floor((event.pageY-rect.top)/40); //+costam
	exitGame=true;
}

function checkForExit(interval,ctx,mapNumber){
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

function play(mapNumber){
	exitGame=false;
	var map,interval;
	if(mapNumber==-1)
		map=exportedMapCode();
	if(mapNumber==-2)
		map=$("#level_code").val();
	if(mapNumber>=0)
		map=readMap(mapNumber);
	var canv=document.getElementById("canv");
	var ctx=canv.getContext("2d");
	fill(ctx,"#000000");
	$(".level_editor").hide();
	$(".start").hide();
	$("#volume_control").addClass("volume_control_in_level_editor");
	$("#go_back").hide();
	$("#signature").hide();
	interval=setInterval(function(){checkForExit(interval,ctx,mapNumber);},20);
}
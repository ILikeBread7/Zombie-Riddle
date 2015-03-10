var cleared;
var editor_tile;
var editor_map;
var editor_switches;
var editor_last_click_x;
var editor_last_click_y;
var choosing_doors;
var editor_map_width;
var editor_map_height;

function countLevels(){
	var result;
	$.ajax({
		url:"levels/levels.txt",
		dataType:"text",
		async:false,
		success:function(data){
			result=data;
		},
		error:function(){
			result=0;
		}
	});
	return result;
}
function readCookie(name,cookies){
	var c=cookies.split(';');
	for(var i=0;i<c.length;i++){
		if(c[i].length>=name.length && c[i].substring(0,7)==name){
			var val=c[i].split('=');
			return val[1];
		}
	}
	return 0;
}
function changeVol(){
	var volume=document.getElementById("volume");
	var audio=document.getElementById("bgMusic");
	audio.volume=volume.value;
}
function mainMenu(ctx){
	ctx.clearRect(0,0,800,600);
	var img=document.getElementById("tytuu");
	ctx.drawImage(img,200,10);
	$(".main_menu").show();
	$("#volume_control").removeClass("volume_control_in_level_editor");
	$(".controls").show();
	$("#signature").show();
}

function clearLevel(s){
	$(s).removeClass("level_inactive");
	$(s).removeClass("level_active");
	$(s).addClass("level_cleared");
}
function activateLevel(s){
	$(s).removeClass("level_inactive");
	$(s).removeClass("level_cleared");
	$(s).addClass("level_active");
}
function deactivateLevel(s){
	$(s).removeClass("level_cleared");
	$(s).removeClass("level_active");
	$(s).addClass("level_inactive");
}
function setCleared(i,cleared){
	var s="#level"+i;
	if(cleared>i)
		clearLevel(s);
	if(cleared==i)
		activateLevel(s);
	if(cleared<i)
		deactivateLevel(s);
}
function startLevel(num){
	if($("#level"+num).hasClass("level_active") || $("#level"+num).hasClass("level_cleared"))
		play(num);
}
function adjustMap(w,h){
	editor_map=[];
	editor_switches=[];
	for(var x=0;x<w;x++){
		editor_map[x]=[];
		for(var y=0;y<h;y++)
			editor_map[x][y]=0;
	}
	editor_map_width=w;
	editor_map_height=h;
}
function editorMapSize(){
	var editCanv=document.getElementById("editor_canv");
	var w=$("#width").val();
	var h=$("#height").val();
	editCanv.width=w*40;
	editCanv.height=h*40;
	adjustMap(w,h);
}
function findStart(){
	for(var y=0;y<editor_map_height;y++)
		for(var x=0;x<editor_map_width;x++)
			if(editor_map[x][y]==1)
				return (x+y*editor_map_width);
	return "0";
}
function encodeDoors(sw){
	var result="";
	for(var i=1;i<sw.length;i++)
		result+=(sw[i][0]+sw[i][1]*editor_map_width)+",";
	return result;
}
function findLinkedDoors(x,y){
	for(var i=0;i<editor_switches.length;i++){
		var sw=editor_switches[i];
		if(sw[0][0]==x && sw[0][1]==y)
			return encodeDoors(sw);
	}
	return "";
}
function encodeTiles(){
	var result="";
	for(var x=0;x<editor_map_width;x++)
		for(var y=0;y<editor_map_height;y++){
			var tile=editor_map[x][y];
			if(tile==12){
				result+=(x+y*editor_map_width)+","+tile+","+findLinkedDoors(x,y)+";";
			}
			else
				if(tile>1)
					result+=(x+y*editor_map_width)+","+tile+";";
		}
	return result;
}
function exportMap(){
	$("#map_code").val(exportedMapCode());
}
function putStart(start){
	var ctx=document.getElementById("editor_canv").getContext("2d");
	var x,y,img;
	x=start%editor_map_width;
	y=Math.floor(start/editor_map_width);
	editor_map[x][y]=1;
	img=document.getElementById("start_point_img");
	ctx.drawImage(img,x*40,y*40);
}
function getTileName(tile){
	if(tile==0)
		return "floor";
	if(tile==2)
		return "finish_point";
	if(tile==3)
		return "open_door"
	if(tile==10)
		return "wall";
	if(tile==11)
		return "steel_wall";
	if(tile==12)
		return "switch";
	if(tile==13)
		return "door";
	if(tile==14)
		return "hole";
}
function addSwitch(data){
	var switchArr=[];
	var x,y;
	x=data[0]%editor_map_width;
	y=Math.floor(data[0]/editor_map_width);
	var arr=[];
	arr[0]=x;
	arr[1]=y;
	switchArr.push(arr);
	for(var i=2;i<data.length-1;i++){
		x=data[i]%editor_map_width;
		y=Math.floor(data[i]/editor_map_width);
		var arr=[];
		arr[0]=x;
		arr[1]=y;
		switchArr.push(arr);
	}
	editor_switches.push(switchArr);
}
function putTile(tile){
	var data=tile.split(",");
	var ctx=document.getElementById("editor_canv").getContext("2d");
	var x,y,img;
	x=data[0]%editor_map_width;
	y=Math.floor(data[0]/editor_map_width);
	editor_map[x][y]=data[1];
	if(data[1]==12)
		addSwitch(data);
	img=document.getElementById(getTileName(data[1])+"_img");
	ctx.drawImage(img,x*40,y*40);
}
function importMap(){
	var s=$("#map_code").val().split(";");
	$("#width").val(s[0]);
	$("#height").val(s[1]);
	$('#apply_wh').click();
	editor_switches=[];
	$("#bridges_input").val(s[3]);
	$("#switches_input").val(s[4]);
	$("#walls_input").val(s[5]);
	$("#thrower_input").val(s[6]);
	$("#fighter_input").val(s[7]);
	$("#nothing_input").val(s[8]);
	putStart(s[2]);
	for(var i=9;i<s.length-1;i++)
		putTile(s[i]);
}
function getNum(tile){
	if(tile=="floor")
		return 0;
	if(tile=="start_point")
		return 1;
	if(tile=="finish_point")
		return 2;
	if(tile=="open_door")
		return 3;
	if(tile=="wall")
		return 10;
	if(tile=="steel_wall")
		return 11;
	if(tile=="switch")
		return 12;
	if(tile=="door")
		return 13;
	if(tile=="hole")
		return 14;
}
function stopChoosingDoors(correct){
	if(choosing_doors==true){
		choosing_doors=false;
		$("#doors_list").html("");
		$("#chosen_doors").hide();
		if(correct==false)
			editor_switches.pop();
	}
}
function chooseDoors(x,y){
	var arr=[];
	arr[0]=[];
	arr[0][0]=x;
	arr[0][1]=y;
	editor_switches.push(arr);
	choosing_doors=true;
	$("#chosen_doors").show();
}
function deletePreviousSwitch(x,y){
	for(var i=0;i<editor_switches.length;i++){
		if(editor_switches[i][0][0]==x && editor_switches[i][0][1]==y){
			editor_switches.splice(i,1);
			alert(editor_switches.length+" found");
			return;
		}
	}
	alert(editor_switches.length);
}
function editorClick(event){
	var rect=document.getElementById("editor_canv").getBoundingClientRect();
	var x=Math.floor((event.pageX-rect.left)/40);
	var y=Math.floor((event.pageY-rect.top)/40);
	if(choosing_doors){
		var last=editor_switches.length-1;
		var arr=[];
		arr[0]=x;
		arr[1]=y;
		editor_switches[last].push(arr);
		$("#doors_list").append(x+" "+y+"<br>");
	}
	else{
		var tile=getNum(editor_tile);
		if(tile==12)
			deletePreviousSwitch(x,y);
		editor_map[x][y]=tile;
		var ctx=document.getElementById("editor_canv").getContext("2d");
		var img=document.getElementById(editor_tile+"_img");
		ctx.drawImage(img,x*40,y*40);
		last_click_x=x;
		last_click_y=y;
		if(editor_tile=="switch")
			chooseDoors(x,y);
	}
}
function editorUnclick(event){
	if(!choosing_doors){
		var rect=document.getElementById("editor_canv").getBoundingClientRect();
		var x=Math.floor((event.pageX-rect.left)/40);
		var y=Math.floor((event.pageY-rect.top)/40);
		var ctx=document.getElementById("editor_canv").getContext("2d");
		var img=document.getElementById(editor_tile+"_img");
		if(x<last_click_x){
			var tmp=x;
			x=last_click_x;
			last_click_x=tmp;
		}
		if(y<last_click_y){
			var tmp=y;
			y=last_click_y;
			last_click_y=tmp;
		}
		var tile=getNum(editor_tile);
		for(var i=last_click_x;i<=x;i++)
			for(var j=last_click_y;j<=y;j++){
				ctx.drawImage(img,i*40,j*40);
				editor_map[i][j]=tile;
			}
	}
}
function startAction(){
	$(".main_menu").hide();
	$("#go_back").show();
	for(var i=0;$("#level"+i).length>0;i++)
		setCleared(i,cleared);
	$(".start").show();
}
function instrAction(){
	$(".main_menu").hide();
	$(".instr").show();
}
function tileSelected(tile){
	$("#selected_tile").css("background-image", "url('"+tile+".png')");
	editor_tile=tile;
}
function levelEditAction(){
	$(".main_menu").hide();
	$("#signature").hide();
	var canv=document.getElementById("canv");
	var ctx=canv.getContext("2d");
	fill(ctx,"#eeeeee");
	$("#volume_control").addClass("volume_control_in_level_editor");
	$("#go_back").css("top", "555px");
	$("#go_back").show();
	$(".level_editor").show();
	$("#chosen_doors").hide();
}
function goBackInstr(){
	$(".instr").hide();
	$(".start").hide();
	$(".level_editor").hide();
	$("#go_back").css("top", "");
	var canv=document.getElementById("canv");
	var ctx=canv.getContext("2d");
	mainMenu(ctx)
}
function addLevels(levels){
	for(var i=0;i<levels;i++){
		var button="<button class=\"level_button\" id=\"level"+i+"\" onclick=\"this.blur(); startLevel("+i+");\">Level "+(i+1)+"</button>";
		$("#levels").append(button);
	}
}
function init(){
	var canv=document.getElementById("canv");
	canv.addEventListener("click",clickListener);
	var ctx=canv.getContext("2d");
	//document.cookie="cleared=3; expires=19 Jan 2038 03:14:07 UTC";
	var cookies=document.cookie;
	cleared=readCookie("cleared",cookies);
	var levels=countLevels();
	editor_tile="floor";
	addLevels(levels);
	var editor_canv=document.getElementById("editor_canv");
	editor_canv.addEventListener("mousedown",editorClick);
	editor_canv.addEventListener("mouseup",editorUnclick);
	mainMenu(ctx);
}
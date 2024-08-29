var editor_tile;
var editor_map;
var editor_switches;
var editor_last_click_x;
var editor_last_click_y;
var choosing_doors;
var editor_map_width;
var editor_map_height;

let editorMessages;

var sound_enabled = false;
var initialized = false;

function showCharInstructions(charId) {
	$('#char_instruction_div_' + charId).show();
	$('#char_instructions_common').show();
}

function hideCharInstructions() {
	$('.char_instruction_div').hide();
	$('#char_instructions_common').hide();
}

function enableSound() {
	audioHandler.init();
	sound_enabled = true;
	hideEnableSoundDiv();
	if (initialized) {
		playMusic(bgMusicTitle);
	}
}

function disableSound() {
	sound_enabled = false;
	const volume = document.getElementById("volume");
	volume.value = 0;
	changeVol();
	hideEnableSoundDiv();
}

function hideEnableSoundDiv() {
	$("#enable_sound").hide();
}

async function countLevels(){
	var result;
	await $.ajax({
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
function changeVol(){
	const volume = document.getElementById("volume").value;
	audioHandler.changeVolume(volume);
	if (volume > 0) {
		playMusic(bgmToPlay);
	}
}
function mainMenu(ctx){
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	drawTitleText(ctx);
	$(".main_menu").show();
	$("#volume_control").removeClass("volume_control_in_level_editor");
	$(".controls").show();
	$("#signature").show();
	if (initialized) {
		playMusic(bgMusicTitle);
	}
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
async function startLevel(num){
	if($("#level"+num).hasClass("level_active") || $("#level"+num).hasClass("level_cleared"))
		await play(num);
}
function adjustMap(w,h){
	editor_map=[];
	editor_switches=[];
	editorMessages = [];
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
	if (w == editor_map_width && h == editor_map_height) {
		return;
	}
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

function encodeTiles() {
	let result = '';
	for (var x = 0; x < editor_map_width; x++)
		for (var y = 0; y < editor_map_height; y++) {
			var tile = editor_map[x][y];
			if (tile === 12) {
				result += (x + y * editor_map_width) + ',' + tile + ',' + findLinkedDoors(x, y) + ';';
			} else if (tile > 1) {
				result += (x + y * editor_map_width) + ',' + tile;
				if (tile === 5) {
					result += (',' + btoa(findMessage(x, y)));
				}
				result += ';';
			}
		}
	return result;
}

function findMessage(x, y) {
	const message = editorMessages.find(m => m.x === x && m.y === y);
	if (message) {
		return message.message;
	}
	return '';
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
	var data = tile.split(",").map((value, index) => index < 2 ? Number(value) : value);
	var ctx=document.getElementById("editor_canv").getContext("2d");
	var x,y,img;
	x=data[0]%editor_map_width;
	y=Math.floor(data[0]/editor_map_width);
	editor_map[x][y]=data[1];
	if (data[1] === 12) {
		addSwitch(data);
	}
	if (data[1] === 5) {
		addMessage(data);
	}
	img=document.getElementById(getTileName(data[1])+"_img");
	ctx.drawImage(img,x*40,y*40);
}

function addMessage(data) {
	const x = data[0] % editor_map_width;
	const y = Math.floor(data[0] / editor_map_width);
	editorMessages.push({ x, y, message: atob(data[2]) });
}

function importMap(){
	var s=$("#map_code").val().split(";");
	$("#width").val(s[0]);
	$("#height").val(s[1]);
	$('#apply_wh').click();
	editor_switches=[];
	editorMessages = [];
	$("#bridges_input").val(s[3]);
	$("#switches_input").val(s[4]);
	$("#walls_input").val(s[5]);
	//$("#thrower_input").val(s[6]);
	$("#fighter_input").val(s[7]);
	$("#nothing_input").val(s[8]);
	putStart(s[2]);
	for(var i=9;i<s.length-1;i++)
		putTile(s[i]);
}

function getNum(tile) {
	switch(tile) {
		case 'floor':
			return 0;
		case 'start_point':
			return 1;
		case 'finish_point':
			return 2;
		case 'open_door':
			return 3;
		case 'questionmark':
			return 5;
		case 'wall':
			return 10;
		case 'steel_wall':
			return 11;
		case 'switch':
			return 12;
		case 'door':
			return 13;
		case 'hole':
			return 14;
	}
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

function startWritingMessage(x, y) {
	document.getElementById('editor_text_message').show();
	const message = { x, y };
	editorMessages.push(message);
}

function confirmMessage() {
	const messageEditor = document.getElementById('editor_text');
	const message = messageEditor.value;
	messageEditor.value = '';
	document.getElementById('editor_text_message').hide();
	if (message) {
		const currentMessage = editorMessages[editorMessages.length - 1];
		currentMessage.message = message;
	} else {
		editorMessages.pop();
	}
}

function deletePreviousSwitch(x,y){
	for(var i=0;i<editor_switches.length;i++){
		if(editor_switches[i][0][0]==x && editor_switches[i][0][1]==y){
			editor_switches.splice(i,1);
			return;
		}
	}
}

function deletePreviousMessage(x, y) {
	for (let i = 0; i < editorMessages.length; i++) {
		const message = editorMessages[i];
		if (message.x === x && message.y === y) {
			editorMessages.splice(i, 1);
			return;
		}
	}
}

function editorClick(event){
	var rect=document.getElementById("editor_canv").getBoundingClientRect();
	let x = Math.floor((event.pageX - (rect.left + window.scrollX)) / Screen.factor / 40);
	let y = Math.floor((event.pageY - (rect.top + window.scrollY)) / Screen.factor / 40);
	if(choosing_doors){
		var last=editor_switches.length-1;
		var arr=[];
		arr[0]=x;
		arr[1]=y;
		editor_switches[last].push(arr);
		$("#doors_list").append(x+" "+y+"\n");
	}
	else{
		var tile=getNum(editor_tile);

		switch (editor_tile) {
			case 'switch':
				deletePreviousSwitch(x, y);
			break;
			case 'questionmark':
				deletePreviousMessage(x, y);
			break;
		}

		editor_map[x][y]=tile;
		var ctx=document.getElementById("editor_canv").getContext("2d");
		var img=document.getElementById(editor_tile+"_img");
		ctx.drawImage(img,x*40,y*40);
		last_click_x=x;
		last_click_y=y;

		switch (editor_tile) {
			case 'switch':
				chooseDoors(x, y);
			break;
			case 'questionmark':
				startWritingMessage(x, y);
			break;
		}
	}
}
function editorUnclick(event){
	if(!choosing_doors){
		var rect=document.getElementById("editor_canv").getBoundingClientRect();
		let x = Math.floor((event.pageX - (rect.left + window.scrollX)) / Screen.factor / 40);
		let y = Math.floor((event.pageY - (rect.top + window.scrollY)) / Screen.factor / 40);
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
function setClearedLevels(){
	for(var i=0;$("#level"+i);i++)
		setCleared(i,cleared);
}
function startAction(){
	$(".main_menu").hide();
	$("#go_back").show();
	setClearedLevels();
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
	$("#go_back").css("top", "675px");
	$("#go_back").show();
	$(".level_editor").show();
	editorMapSize();
	$("#chosen_doors").hide();
	document.getElementById('editor_text_message').hide();
	playMusic(bgMusicEditor);
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
		const levelsDiv = $("#levels");
		levelsDiv.innerHTML += button;
	}
}
async function init(){
	document.getElementById('fullscreen').addEventListener('click', e => {
		e.target.blur();
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.body.requestFullscreen();
		}
	});

	var canv=document.getElementById("canv");
	canv.addEventListener("mousemove",mouseMoveListener);
	document.addEventListener("keydown",keyListener);
	document.addEventListener("keyup",keyListener);
	canv.addEventListener("click",gameClickListener);
	var ctx=canv.getContext("2d");
	cleared = readCleared();
	levels = await countLevels();
	editor_tile="floor";
	addLevels(levels);
	var editor_canv=document.getElementById("editor_canv");
	editor_canv.addEventListener("mousedown",editorClick);
	editor_canv.addEventListener("mouseup",editorUnclick);
	$("#loading").hide();
	$("#after_loading").show();
	if (enableSound) {
		audioHandler.init();
	}
	mainMenu(ctx);
	initialized = true;
}

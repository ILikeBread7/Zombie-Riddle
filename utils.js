function drawRotatedImage(ctx,img,x,y,degree){
	ctx.save();
	ctx.translate(x+img.width/2,y+img.height/2);
	ctx.rotate(degree);
	ctx.drawImage(img,-img.width/2,-img.height/2);
	ctx.restore();
}

function fill(ctx,color){
	ctx.fillStyle=color;
	ctx.fillRect(0,0,800,600);
}

function exportedMapCode(){
	var s=editor_map_width+";"+editor_map_height+";"+findStart()+";";
	s+=$("#bridges_input").val()+";";
	s+=$("#switches_input").val()+";";
	s+=$("#walls_input").val()+";";
	//s+=$("#thrower_input").val()+";";
	s+="0;";
	s+=$("#fighter_input").val()+";";
	s+=$("#nothing_input").val()+";";
	s+=encodeTiles();
	return s;
}

async function readMap(mapNumber){
	var map="";
	await $.ajax({
		url:("levels/"+mapNumber),
		dataType:"text",
		async:false,
		success:function(data){
			map=data;
		}
	});
	return map;
}
function getTileName(tile){
	if(tile==0)
		return "floor";
	if(tile==1)
		return "start_point";
	if(tile==2)
		return "finish_point";
	if(tile==3)
		return "open_door";
	if(tile==4)
		return "bridge";
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
function dist(x1,y1,x2,y2){
	var dx=x1-x2;
	var dy=y1-y2;
	return Math.sqrt(dx*dx+dy*dy);
}
function segmentCircleIntersect(ax,ay,bx,by,cx,cy,r){
	if(dist(ax,ay,cx,cy)<=r || dist(bx,by,cx,cy)<=r)
		return true;
	
	var d=dist(ax,ay,bx,by);
	var alpha=((bx-ax)*(cx-ax)+(by-ay)*(cy-ay))/(d*d);
	var mx=ax+(bx-ax)*alpha;
	var my=ay+(by-ay)*alpha;
	
	if(dist(mx,my,cx,cy)>r)
		return false;
	if(dist(mx,my,ax,ay)<=d && dist(mx,my,bx,by)<=d)
		return true;

	return false;
}

const bgMusicTitle = 'POL-antique-market-short.mp3';
const bgMusicGame = 'POL-stealth-mode-short.mp3';
const bgMusicEditor = 'POL-love-line-short.mp3';
const seSword = 'sword.wav';
const seDead = 'dead.wav';
const seZombie = 'zombie.wav';
const seBridge = 'bridge.wav';
const seWall = 'wall.wav';
const seSwitch = 'switch.wav';
const seWin = 'win.wav';

let bgmToPlay = bgMusicTitle;

const audioHandler = (() => {
	const trackNames = [
		bgMusicTitle,
		bgMusicGame,
		bgMusicEditor,
		seSword,
		seDead,
		seZombie,
		seBridge,
		seWall,
		seSwitch,
		seWin
	];

	const trackVolumes = new Map([
		[bgMusicTitle, 0.5],
		[bgMusicGame, 0.5],
		[bgMusicEditor, 0.5],
		[seSword, 2],
		[seDead, 2.5],
		[seZombie, 2],
		[seBridge, 2],
		[seWall, 2],
		[seSwitch, 2],
		[seWin, 2]
	]);

	let tracksMapPromise = null;
	let audioCtx = null;
	let globalVolume = 1;

	const playFunc = (track, loop, volume) => {
		const audioBuffer = track;
		const trackSource = audioCtx.createBufferSource();

		const gainNode = audioCtx.createGain();
		trackSource.loop = loop;
		trackSource.buffer = audioBuffer;
		trackSource.connect(gainNode).connect(audioCtx.destination);

		gainNode.gain.value = volume * globalVolume;

		trackSource.start();
		return { trackSource, gainNode };
	}


	let currentBgm = { name: null, track: null };

	return {
		init: function() {
			if (tracksMapPromise !== null) {
				return;
			}
			tracksMapPromise = (async () => {
				const AudioContext = window.AudioContext || window.webkitAudioContext;
				audioCtx = new AudioContext();
		
				const tracks = await Promise.all(trackNames.map(async trackName => {
					const response = await fetch(`audio/${trackName}`);
					const arrayBuffer = await response.arrayBuffer();
					const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
					return audioBuffer;
				}));
			
				return new Map((() => {
					const result = [];
					for (let i = 0; i < trackNames.length; i++) {
						result.push([trackNames[i], tracks[i]]);
					}
					return result;
				})());
			})();
		},
		playBgm: function(trackName) {
			if (trackName === currentBgm.name) {
				return;
			}
			tracksMapPromise.then(tm => {
				const track = tm.get(trackName);
				if (currentBgm.track !== null) {
					currentBgm.track.trackSource.stop();
				}
				currentBgm = { name: trackName, track: playFunc(track, true, trackVolumes.get(trackName)) };
			});
		},
		playEffect: function(trackName) {
			tracksMapPromise.then(tm => {
				const track = tm.get(trackName);
				playFunc(track, false, trackVolumes.get(trackName));
			});
		},
		changeVolume(volume) {
			globalVolume = volume;
			if (currentBgm && currentBgm.track) {
				currentBgm.track.gainNode.gain.value = trackVolumes.get(currentBgm.name) * globalVolume;
			}
		}
	};

})();

function playMusic(music){
	bgmToPlay = music;
	audioHandler.playBgm(music);
}
function playSe(se){
	audioHandler.playEffect(se);
}
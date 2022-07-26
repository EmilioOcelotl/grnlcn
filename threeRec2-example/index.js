// const GUI = require('js/lil-gui.module.min.js');

// Hubo que ajustar contextos
// seleccionador entre audio input y entre muestra fija
// la muestra fija puede ser un audio independiente de los procesamientos, si son lo mismo, a veces se queda fijado. 

import { GUI } from './js/lil-gui.module.min.js';
var audioCtx = new AudioContext();

// por sí mismo la instancia de estos módulos podría ser una clase 

let source, request, gainNode, randomNum, sz, strt, flduration; 
let source2, request2, gainNode2, randomNum2, sz2, strt2, flduration2; 
let source3, request3, gainNode3, randomNum3, sz3, strt3, flduration3; 

let bufferLengthAnalyser; 

var onsetdetector; 
var audioblocksize = 256; //lowest latency possible

var webaudio; 

let renderer2, scene, camera, composer, controls, container; 
let sphere, sphereCopy;

let analyser, dataArray; 
let light, light2; 

let mute = false; 

function init(){

    const overlay = document.getElementById( 'overlay' );
    overlay.remove();

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );
    instructions.remove(); 
    blocker.remove();
    
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 0.1, 3000 );
    camera.position.z = 20;

    renderer2 = new THREE.WebGLRenderer();
    renderer2.autoClear = false;
    renderer2.setPixelRatio( window.devicePixelRatio );

    // renderer2 = new THREE.WebGLRenderer();
    renderer2.setSize( container.offsetWidth, container.offsetHeight );
    container.appendChild( renderer2.domElement );

    //renderer2.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer2.domElement ); 

    window.addEventListener( 'resize', onWindowResize);

    light = new THREE.PointLight( 0xffffff, 1 );
    light.position.set( 40, 40, 40 );
    scene.add( light );

    light2 = new THREE.PointLight( 0xffffff, 1 );
    light2.position.set( -40, -40, -40 );
    scene.add( light2 );    
    
    const geometry = new THREE.SphereGeometry( 5, 64, 64 );    
    const geometry2 = new THREE.SphereGeometry( 5, 64, 64 );

    const material = new THREE.MeshStandardMaterial( { color: 0xffffff} );
    sphere = new THREE.Mesh( geometry, material );
    sphereCopy = new THREE.Mesh ( geometry2, material); 
    scene.add( sphere );
    
    /////////////////////////////////
    ////////////// AUDIO ////////////
    /////////////////////////////////
    
    webaudio = new MMLLWebAudioSetup(audioblocksize,2,callback,setup); 
    // primero el onset detector
    // Se supone que luego sigue la opción incorporada de gui que crea botones y así. Lo más importante es checar el callback 
    // luego el Setup de audio que ya tiene incorporado lo de usar el mic 
    

    //setInterval(random, 1000);
    // setInterval(random2, 1000);

    samples(); 
    animate();
    createPanel(); 
    
}

function animate(){

    var time2 = Date.now() * 0.0005;

    requestAnimationFrame ( animate ); 
    renderer2.render( scene, camera );

    sphere.rotation.x += 0.001;

    sphere.rotation.y += -0.001;

    for( var i = 0; i < sphere.geometry.attributes.position.count; i++){
	sphere.geometry.attributes.position.setX(i, (sphereCopy.geometry.attributes.position.getX(i) * (1+dataArray[i%512])/64));
	sphere.geometry.attributes.position.setY(i, (sphereCopy.geometry.attributes.position.getY(i) * (1+dataArray[i%512])/64));
	sphere.geometry.attributes.position.setZ(i, (sphereCopy.geometry.attributes.position.getZ(i) * (1+dataArray[i%512])/64));
    }

    if(!mute){
	analyser.getByteFrequencyData(dataArray);
    }
    
    sphere.geometry.attributes.position.needsUpdate = true; 

    light.position.x = Math.sin( time2 * 0.7/2 ) * 24;
    light.position.y = Math.cos( time2* 0.5/2 ) * 15;
    light.position.z = Math.cos( time2 * 0.3/2 ) * 24;
    light2.position.x = Math.sin( time2 * 0.7/2 ) * -24;
    light2.position.y = Math.cos( time2* 0.5/2 ) * -15;
    light2.position.z = Math.cos( time2 * 0.3/2 ) * -24;
    
}

const startButton = document.getElementById( 'start' );
startButton.addEventListener( 'click', init );

function random(){

    // centroide espectral para afinación 
    // source.start(); 
    source.playbackRate.setValueAtTime(Math.random() * 2, 1); 
    // source.playbackRate.value = 0.125 + (Math.random() *1.5);
    sz = 0.01;
    strt = Math.random() * flduration; 
    source.loopStart = strt;
    source.loopEnd = strt + sz;
    // source.detune.value = Math.random() * 100 -50; 
    // source.loopEnd = 9.2 + (Math.random() * 8);
    // console.log(flduration*Math.random()); 
}

function random2(){

    source2.playbackRate.setValueAtTime(Math.random() * 2, 1); 
    // source2.playbackRate.value = 0.125 + (Math.random() *1.5);
    sz2 = 0.01;
    strt2 = Math.random() * flduration2; 
    source2.loopStart = strt2;
    source2.loopEnd = strt2 + sz2; 
    // source.loopEnd = 9.2 + (Math.random() * 8);
}

// init();

var setup = function SetUp(sampleRate) {
        
    console.log("setup!");    
    onsetdetector = new MMLLOnsetDetector(sampleRate); //default threshold 0.34
   console.log(webaudio) ; 
 
    var pruebaGrain = webaudio.audiocontext.createGain(); 

    // aquí es donde se tienen que crear los objetos con el contexto de audio
    // cerrar el otro contexto de audio 
    webaudio.audiocontext.close();
    // asignar el nuevo contexto de audio a la librería 
    webaudio.audiocontext = audioCtx;
    // webaudio.audioinput.disconnect(webaudio.audiocontext.destination);    
    //audioinput.connect(self.node);
    // webaudio.audioinput.disconnect(webaudio.node); // esto podría funcionar para desactivar el el mic  

    console.log(webaudio); 
    // console.log(pruebaGrain); 
    
};

var callback = function CallBack(input,output,n) {
   
    var detection = onsetdetector.next( input.monoinput );
    
    if(detection && !mute) {
	
        console.log('onsetnow');
	random();
	random2(); 

    }

    /*
    //for each sample
    for (i = 0; i < n; ++i) {
        
        output.outputL[i] = input.inputL[i];
        output.outputR[i] = input.inputR[i];
        
	}
    */
    
};

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();   
    renderer2.setSize( window.innerWidth, window.innerHeight );
    
}

function createPanel(){
    const panel = new GUI({width:310});
    const folder1 = panel.addFolder( 'Reproducción' );
    var objRepro = {iniciar:repro}
    folder1.add(objRepro,'iniciar'); 
    var objAlto = {detener:stop}
    folder1.add(objAlto,'detener');
    // const folder2 = panel.addFolder( 'Grabación' );
    // const folder3 = panel.addFolder( 'Transformación' );
}


function repro(){
    console.log("iniciar o desmutear");
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    gainNode2.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode3.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    mute = false; 
}

function stop(){
    console.log("detener o más bien mutear");
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);  
    gainNode2.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode3.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    mute = true; 
}

function samples(){

    // Primera fuente 

    source = audioCtx.createBufferSource();
    request = new XMLHttpRequest();
    request.open('GET', 'audio/cello.mp3', true);
    request.responseType = 'arraybuffer';

    /*
    var gainPrueba = webaudio.audiocontext;
    console.log(gainPrueba); 
    */
    
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    
    request.onload = function() {
	let audioData = request.response;
	
	audioCtx.decodeAudioData(audioData, function(buffer) {
	    Array.prototype.reverse.call( buffer.getChannelData(0) );
            Array.prototype.reverse.call( buffer.getChannelData(1) );
            source.buffer = buffer;
            // myBuffer = buffer;
            flduration = buffer.duration;
            //source.buffer = myBuffer;
            // source.playbackRate.value = 1;
	    source.loop = true; 
	    source.loopStart = 8.1;
	    source.loopEnd = 8.2;
	    // source.detune.value = 500; 
	    // gainNode1.value = 1; 
	    source.connect(gainNode); 
            gainNode.connect(audioCtx.destination);

	    // si es el mismo sonido procedasado lo que detona los cambios en el sonido procesado, entonces puede que en algún momento se quede estático
	    
	    // gainNode.connect(webaudio.node); // 
            //source.loop = true;
	},
				 
				 function(e){"Error with decoding audio data" + e.error});
				 
    }
    
    request.send();
    source.start();

    // Segunda fuente 
    
    source2 = audioCtx.createBufferSource();
    request2 = new XMLHttpRequest();
    request2.open('GET', 'audio/cello.mp3', true);
    request2.responseType = 'arraybuffer';
   
    gainNode2 = audioCtx.createGain();
    gainNode2.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    
    request2.onload = function() {
	let audioData2 = request2.response;
	
	audioCtx.decodeAudioData(audioData2, function(buffer) {
            //myBuffer = buffer;
            flduration2 = buffer.duration;
            source2.buffer = buffer;
            source2.playbackRate.value = 1;
	    source2.loop = true; 
	    source2.loopStart = 18.1;
	    source2.loopEnd = 18.2;
	    // source.detune.value = 500; 
	    // gainNode1.value = 1; 
	    source2.connect(gainNode2); 
            gainNode2.connect(audioCtx.destination);

	    
	    // Parece ser que no se pueden conectar porque son de distintos contextos de audio, entonces hay que unificarlos 

	    gainNode2.connect(webaudio.node); 

            //source.loop = true;
	},
				 
				 function(e){"Error with decoding audio data" + e.error});
    }
    
    analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    source2.connect(analyser);
    source3.connect(analyser); 
    analyser.fftSize = 1024;
    bufferLengthAnalyser = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLengthAnalyser);
    analyser.getByteTimeDomainData(dataArray)
    analyser.smoothingTimeConstant = 0.95;

    request2.send(); 
    source2.start(); 

    // Tercera fuente 
    
    source3 = audioCtx.createBufferSource();
    request3 = new XMLHttpRequest();
    request3.open('GET', 'audio/cello.mp3', true);
    request3.responseType = 'arraybuffer';
   
    gainNode3 = audioCtx.createGain();
    gainNode3.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    
    request3.onload = function() {
	let audioData3 = request3.response;
	
	audioCtx.decodeAudioData(audioData3, function(buffer) { // esto igual y no es realmente necesario  
            //myBuffer = buffer;
            flduration3 = buffer.duration;
            source3.buffer = buffer;
            //source3.playbackRate.value = 1;
	    source3.loop = true; 
	    //source3.loopStart = 18.1;
	    // source3.loopEnd = 18.2;
	    // source.detune.value = 500; 
	    // gainNode1.value = 1; 
	    source3.connect(gainNode3); 
            gainNode3.connect(audioCtx.destination);

	    
	    // Parece ser que no se pueden conectar porque son de distintos contextos de audio, entonces hay que unificarlos 

	    gainNode3.connect(webaudio.node); 

            //source.loop = true;
	},
				 
				 function(e){"Error with decoding audio data" + e.error});
    }
    
    request3.send(); 
    source3.start(); 

    
}

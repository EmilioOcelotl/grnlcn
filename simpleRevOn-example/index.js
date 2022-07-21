var audioCtx = new AudioContext();

let source, request, gainNode, randomNum, sz, strt, flduration; 
let source2, request2, gainNode2, randomNum2, sz2, strt2, flduration2; 

var onsetdetector; 
var audioblocksize = 256; //lowest latency possible

var webaudio; 

function init(){
  
    webaudio = new MMLLWebAudioSetup(audioblocksize,1,callback,setup); 
    
    // primero el onset detector
    // Se supone que luego sigue la opción incorporada de gui que crea botones y así. Lo más importante es checar el callback 
    // luego el Setup de audio que ya tiene incorporado lo de usar el mic 
    
    source = audioCtx.createBufferSource();
    request = new XMLHttpRequest();
    request.open('GET', 'audio/cello.mp3', true);
    request.responseType = 'arraybuffer';
   
    gainNode1 = audioCtx.createGain();
    gainNode1.gain.setValueAtTime(0.5, audioCtx.currentTime);  
    
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
	    source.connect(gainNode1); 
            gainNode1.connect(audioCtx.destination);
            //source.loop = true;
	},
				 
				 function(e){"Error with decoding audio data" + e.error});
				 
    }
    
    request.send();
    source.start();
    
    source2 = audioCtx.createBufferSource();
    request2 = new XMLHttpRequest();
    request2.open('GET', 'audio/cello.mp3', true);
    request2.responseType = 'arraybuffer';
   
    gainNode2 = audioCtx.createGain();
    gainNode2.gain.setValueAtTime(0.5, audioCtx.currentTime);  

    
    request2.onload = function() {
	let audioData = request2.response;
	
	audioCtx.decodeAudioData(audioData, function(buffer) {
            myBuffer = buffer;
            flduration2 = buffer.duration;
            source2.buffer = myBuffer;
            source2.playbackRate.value = 1;
	    source2.loop = true; 
	    source2.loopStart = 18.1;
	    source2.loopEnd = 18.2;
	    // source.detune.value = 500; 
	    // gainNode1.value = 1; 
	    source2.connect(gainNode2); 
            gainNode2.connect(audioCtx.destination);
            //source.loop = true;
	},
				 
				 function(e){"Error with decoding audio data" + e.error});
				 
    }

    request2.send(); 
    source2.start(); 

    //setInterval(random, 1000);
    // setInterval(random2, 1000);
    
}

const startButton = document.getElementById( 'start' );
startButton.addEventListener( 'click', init );

function random(){

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
    
};

var callback = function CallBack(input,output,n) {
    
    var detection = onsetdetector.next(input.monoinput);
    
    if(detection) {
	
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
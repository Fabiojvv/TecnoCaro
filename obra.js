let nombrestrazo1=[0,1,2,3,4,5,6,7,8,9,10,11,18,26,28,30,31,32,38,39,45,49];
let nombrestrazo2=[13,14,15,16,17,19,21,22,23,24,25,27,29,33,36,37,40,41,42,43,44,46,47,48,50,51];
let trazos1=[];
let trazos2 = [];
let cantidad = 51;
let colores;

let MouseMoviendose;
let x, y,fx,fy;
let capaFondo1,capaFondo2,capaFigura;

let mic;
let amp;
let pitch;
let audioCotext;

let haySonido = false;
let antesHabiaSonido; // moemoria del estado anterior del sonido 

let FREC_MIN = 200;
let FREC_MAX = 400;

let AMP_MIN = 0.01;
let AMP_MAX = 0.2;


let gestorAmp;
let gestorPitch;


const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';


function preload(){
  for( let i=0 ; i<nombrestrazo1.length ; i++ ){
    let nombre = "data/trazo"+nf(nombrestrazo1[i],2)+".png"; 
    trazos1[i] = loadImage( nombre );
  }
  for( let i=0 ; i<nombrestrazo2.length ; i++ ){
    let nombre = "data/trazo"+nf(nombrestrazo2[i],2)+".png"; 
    trazos2[i] = loadImage( nombre );
  }
  colores = new Colores( "data/obra.jpg" );

}

function setup() {
  createCanvas(1000, 850);
  capaFondo1 = createGraphics(int(width*1.2),int(height*1.2));  
  capaFondo2 = createGraphics(int(width*1.2),int(height*1.2));  
  capaFigura = createGraphics(int(width*1.2),int(height*1.2));  
  x=width/2;
  y=height/2;
  // capaFondo1.background(200,30,24);
  capaFondo1.imageMode( CENTER ); 
  // capaFondo2.background(200,30,24);
  capaFondo2.imageMode( CENTER ); 
  // capaFigura.background(200,30,24);
  capaFigura.imageMode( CENTER );  
  imageMode( CENTER );   
  audioContext = getAudioContext(); // inicia el motor de audio
  mic = new p5.AudioIn(); // inicia el micrófono
  mic.start(startPitch); // se enciende el micrófono y le transmito el analisis de frecuencia (pitch) al micrófono. Conecto la libreria con el micrófono

  userStartAudio();// por la dudas para forzar inicio de audio en algunos navegadores

  gestorAmp =  new GestorSenial( AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial( FREC_MIN, FREC_MAX);
  
  antesHabiaSonido = false;
  x = capaFigura.width/2;
  y = capaFigura.height/2;
}


let contador = 0

function draw() {
  // Obtener la actual del mouse
  
  let vol = mic.getLevel(); // cargo en vol la amplitud del micrófono (señal cruda);
  gestorAmp.actualizar(vol);
console.log(vol)
console.log(gestorAmp.filtrada)
  haySonido = gestorAmp.filtrada >AMP_MIN; // umbral de ruido que define el estado haySonido
  let tamanioTrazos =map( gestorAmp.filtrada, AMP_MIN, AMP_MAX,70, 100 );

  let inicioElSonido = haySonido && !antesHabiaSonido; // evendo de INICIO de un sonido
  let finDelSonido = !haySonido && antesHabiaSonido; // evento de fIN de un sonido 


  if(haySonido){
    let graveAgudo = gestorPitch.filtrada;
    if (graveAgudo<0.5) {
      let cual = int(random(trazos1.length));
      let distancia = random(0, 600);
      let a = random(PI * 2);
      let cx = x + distancia * cos(a);
      let cy = y + distancia * sin(a);
      let unColor = colores.darColor();
      if(random(100)<20){
        tamanioTrazos =map( gestorAmp.filtrada, AMP_MIN, AMP_MAX,120, 150 );
        capaFondo1.tint(unColor);
        capaFondo1.image(trazos1[cual], cx, cy, tamanioTrazos, tamanioTrazos); //añadido tamanioTrazos
      }else{
        capaFondo2.tint(unColor);
        capaFondo2.image(trazos1[cual], cx, cy, tamanioTrazos, tamanioTrazos); //añadido tamanioTrazos
      }
    } else {
      let cual = int(random(trazos2.length));
      let distancia = random(0, 600);
      let a = random(PI * 2);
      let cx = x + distancia * cos(a);
      let cy = y + distancia * sin(a);
      let unColor = colores.darColor();
      capaFigura.tint(unColor);
      capaFigura.image(trazos2[cual], cx, cy, tamanioTrazos, tamanioTrazos); 
    }
  }

  let m1x,m1y, m2x,m2y, m3x,m3y;
  let cantidadMovimiento = 200;
  m1x=sin(contador*0.03)*cantidadMovimiento;
  m1y=sin(contador*.002)*cantidadMovimiento;
  m2x=sin(contador*0.012)*cantidadMovimiento;
  m2y=sin(contador*0.032)*cantidadMovimiento;
  m3x=sin(contador*0.008)*cantidadMovimiento;
  m3y=sin(contador*0.007)*cantidadMovimiento;

  if(!haySonido){ //Estado SILENCIO  
    contador++;
    fx = 0;
    fy = 0;
  }
  background(200,30,24);
  image(capaFondo1,width/2+fx+m1x,height/2+fy+m1y);
  image(capaFondo2,width/2+fx+m2x,height/2+fy+m2y);
  image(capaFigura,width/2+fx+m3x,height/2+fy+m3y);

}

function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext , mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      //console.log(frequency);
      gestorPitch.actualizar(frequency);    
      //console.log(frequency);
    } 
    getPitch();
  })
}
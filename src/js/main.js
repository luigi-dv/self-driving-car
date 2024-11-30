const myCanvas=document.getElementById("myCanvas");
myCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = myCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(myCanvas.width/2,myCanvas.width*0.9);

const N=100;
const startY=100;
const stallFrames=300;
const minProgress=2.1*stallFrames;

let cars=[];
let traffic=null;
let bestCar=null;
let generation=1;
let frame=0;
let checkpoints=[];

const saved=BrainStorage.load();
if(saved){
    generation=saved.generation;
}
startSimulation(saved?saved.brain:null);
updateButtons();

animate();

function save(){
    BrainStorage.save(bestCar.brain,{
        generation:generation,
        distance:getDistance(bestCar)
    });
    updateButtons();
}

function discard(){
    BrainStorage.discard();
    generation=1;
    startSimulation(null);
    updateButtons();
}

function restore(){
    const record=BrainStorage.restore();
    if(record){
        generation=record.generation;
        startSimulation(record.brain);
    }
    updateButtons();
}

function updateButtons(){
    document.getElementById("restoreButton").disabled=
        !BrainStorage.hasBackup();
}

function startSimulation(parentBrain=null){
    cars=generateCars(N,parentBrain);
    traffic=new Traffic(road);
    bestCar=cars[0];
    frame=0;
    checkpoints=cars.map(c=>c.y);
}

function nextGeneration(){
    const parent=getBestCar(cars,false);
    generation++;
    startSimulation(
        getDistance(parent)>0?parent.brain:null
    );
}

function isGenerationOver(){
    if(cars.every(c=>c.damaged)){
        return true;
    }
    if(frame%stallFrames==0){
        const moving=cars.some(
            (c,i)=>!c.damaged && checkpoints[i]-c.y>=minProgress
        );
        checkpoints=cars.map(c=>c.y);
        return !moving;
    }
    return false;
}

function getBestCar(cars,aliveOnly=true){
    let best=null;
    for(let i=0;i<cars.length;i++){
        if(aliveOnly && cars[i].damaged){
            continue;
        }
        if(best==null || cars[i].y<best.y){
            best=cars[i];
        }
    }
    return best||getBestCar(cars,false);
}

function getDistance(car){
    return startY-car.y;
}

function generateCars(N,parentBrain=null){
    const cars=[];
    for(let i=0;i<N;i++){
        const car=new Car(road.getLaneCenter(1),startY,30,50,"AI");
        if(NeuralNetwork.matches(parentBrain,car.brain)){
            car.brain=NeuralNetwork.clone(parentBrain);
            if(i!=0){
                NeuralNetwork.mutate(car.brain,0.1);
            }
        }
        cars.push(car);
    }
    return cars;
}

function animate(time){
    traffic.update(road.borders,bestCar.y);
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic.cars);
    }
    frame++;
    if(isGenerationOver()){
        nextGeneration();
    }
    bestCar=getBestCar(cars);

    myCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+myCanvas.height*0.7);

    road.draw(carCtx);
    traffic.draw(carCtx);
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
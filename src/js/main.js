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
let recordDistance=0;
let mutationAmount=
    parseFloat(localStorage.getItem("mutationAmount"))||0.1;
let checkpoints=[];

const saved=BrainStorage.load();
startSimulation(saved?saved.brain:null);
if(saved){
    if(NeuralNetwork.matches(saved.brain,bestCar.brain)){
        generation=saved.generation;
    }else{
        setStatus("Saved brain does not fit the network");
    }
}
document.getElementById("mutationInput").value=mutationAmount;
updateButtons();
updateStats();

animate();

function save(){
    BrainStorage.save(bestCar.brain,{
        generation:generation,
        distance:getDistance(bestCar)
    });
    updateButtons();
    setStatus("Brain saved");
}

function discard(){
    const discarded=BrainStorage.discard();
    generation=1;
    recordDistance=0;
    startSimulation(null);
    updateButtons();
    setStatus(discarded
        ?"Brain discarded, restore to undo"
        :"Started over");
}

function restore(){
    const record=BrainStorage.restore();
    if(record){
        generation=record.generation;
        startSimulation(record.brain);
        setStatus("Brain restored");
    }
    updateButtons();
}

function exportBrain(){
    const record={
        brain:bestCar.brain,
        generation:generation,
        distance:getDistance(bestCar),
        savedAt:Date.now()
    };
    const link=document.createElement("a");
    link.href=URL.createObjectURL(new Blob(
        [JSON.stringify(record)],
        {type:"application/json"}
    ));
    link.download="brain-gen"+generation+".json";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus("Brain exported");
}

function importBrain(input){
    const file=input.files[0];
    if(!file){
        return;
    }
    const reader=new FileReader();
    reader.onload=()=>{
        const record=BrainStorage.parse(reader.result);
        if(record && NeuralNetwork.matches(record.brain,bestCar.brain)){
            generation=record.generation;
            startSimulation(record.brain);
            setStatus("Brain imported, save to keep it");
        }else{
            setStatus("This file does not fit the network");
        }
    };
    reader.readAsText(file);
    input.value="";
}

function setStatus(message){
    document.getElementById("status").textContent=message;
}

function setMutation(value){
    mutationAmount=parseFloat(value);
    localStorage.setItem("mutationAmount",mutationAmount);
    updateStats();
}

function updateButtons(){
    document.getElementById("restoreButton").disabled=
        !BrainStorage.hasBackup();

    const record=BrainStorage.load();
    document.getElementById("savedStat").textContent=record
        ?"gen "+record.generation
        :"none";
}

function updateStats(){
    const distance=Math.max(0,getDistance(bestCar));
    recordDistance=Math.max(recordDistance,distance);

    document.getElementById("generationStat").textContent=generation;
    document.getElementById("aliveStat").textContent=
        cars.filter(c=>!c.damaged).length+"/"+cars.length;
    document.getElementById("distanceStat").textContent=
        Math.round(distance);
    document.getElementById("recordStat").textContent=
        Math.round(recordDistance);
    document.getElementById("mutationStat").textContent=
        Math.round(mutationAmount*100)+"%";
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
    recordDistance=Math.max(recordDistance,getDistance(parent));
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
                NeuralNetwork.mutate(car.brain,mutationAmount);
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
    if(frame%10==0){
        updateStats();
    }

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
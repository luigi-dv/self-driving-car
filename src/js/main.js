const myCanvas=document.getElementById("myCanvas");
myCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = myCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(myCanvas.width/2,myCanvas.width*0.9);

const N=100;
let cars=[];
let traffic=null;
let bestCar=null;

const saved=BrainStorage.load();
startSimulation(saved?saved.brain:null);
updateButtons();

animate();

function save(){
    BrainStorage.save(bestCar.brain);
    updateButtons();
}

function discard(){
    BrainStorage.discard();
    startSimulation(null);
    updateButtons();
}

function restore(){
    const record=BrainStorage.restore();
    if(record){
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
}

function generateCars(N,parentBrain=null){
    const cars=[];
    for(let i=0;i<N;i++){
        const car=new Car(road.getLaneCenter(1),100,30,50,"AI");
        if(parentBrain){
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
    bestCar=cars.find(
        c=>c.y===Math.min(
            ...cars.map(c=>c.y)
        ));

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
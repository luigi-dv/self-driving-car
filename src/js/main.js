const myCanvas=document.getElementById("myCanvas");
myCanvas.width=340;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=380;

const carCtx = myCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(
    myCanvas.width/2,
    Settings.laneCount*Settings.laneWidth,
    Settings.laneCount
);

const registry=new PolicyRegistry(HighwayPolicies);
let profile=PolicyProfile.none();
let orchestrator=null;
let cars=[];
let traffic=null;
let bestCar=null;
let generation=1;
let frame=0;
let checkpoints=[];
let recordDistance=0;
let mutationAmount=
    parseFloat(localStorage.getItem("mutationAmount"))||0.1;

start();

function start(){
    setupRegions();

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
}

function setupRegions(){
    const input=document.getElementById("regionInput");
    for(let i=0;i<registry.profiles.length;i++){
        const option=document.createElement("option");
        option.value=registry.profiles[i].name;
        option.textContent=registry.profiles[i].name.replace("_"," ");
        option.title=registry.profiles[i].regions.join(", ");
        input.appendChild(option);
    }

    const name=localStorage.getItem("region")||Settings.region;
    profile=registry.get(name)||registry.profiles[0]||profile;
    input.value=profile.name;
    road.handedness=profile.handedness;
}

function setRegion(name){
    profile=registry.get(name)||profile;
    road.handedness=profile.handedness;
    localStorage.setItem("region",profile.name);
    startSimulation(bestCar.brain);
    setStatus("Driving under "+profile.name.replace("_"," "));
}

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

    const compliance=bestCar.compliance;
    document.getElementById("fitnessStat").textContent=
        Math.round(bestCar.fitness);
    document.getElementById("violationStat").textContent=
        compliance?compliance.violations.length:0;
    document.getElementById("scenario").textContent=
        traffic.director.current
            ?traffic.director.current.title
            :"";
    document.getElementById("directive").textContent=
        describeDirective(bestCar.directive);
    document.getElementById("violation").textContent=
        compliance && compliance.last
            ?compliance.last.message
            :"";
}

function describeDirective(directive){
    if(directive==null){
        return "";
    }
    const reasons=directive.reasons.length>0
        ?directive.reasons.join(". ")
        :"Cruise";
    return reasons+" (lane "+directive.lane+", "
        +Math.round(Units.toKmh(directive.speed))+" km/h)";
}

function startSimulation(parentBrain=null){
    cars=generateCars(Settings.carCount,parentBrain);
    traffic=new Traffic(road,profile);
    orchestrator=new PolicyOrchestrator(profile,traffic);
    bestCar=cars[0];
    frame=0;
    checkpoints=cars.map(c=>c.y);
}

function nextGeneration(){
    const parent=getBestCar(cars,false);
    recordDistance=Math.max(recordDistance,getDistance(parent));
    generation++;
    startSimulation(
        parent.fitness>0?parent.brain:null
    );
}

function isGenerationOver(){
    const settings=Settings.generation;
    if(cars.every(c=>c.damaged) || frame>=settings.maxFrames){
        return true;
    }
    if(frame>0 && frame%settings.stallFrames==0){
        const moving=cars.some(
            (c,i)=>!c.damaged
                && checkpoints[i]-c.y>=settings.minProgress
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
        if(best==null || cars[i].fitness>best.fitness){
            best=cars[i];
        }
    }
    return best||getBestCar(cars,false);
}

// Cars left far behind the best one are out of the traffic it meets
function retireStragglers(){
    const limit=bestCar.y+Settings.generation.dropBehind;
    for(let i=0;i<cars.length;i++){
        if(cars[i].y>limit){
            cars[i].damaged=true;
        }
    }
}

function getDistance(car){
    return Settings.startY-car.y;
}

function generateCars(N,parentBrain=null){
    const cars=[];
    for(let i=0;i<N;i++){
        const car=new Car(
            road.laneToX(0),Settings.startY,30,50,"AI"
        );
        if(parentBrain==null && Settings.seedBaselineBrain){
            parentBrain=BaselineBrain.create(car.sensor.rayCount);
        }
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

function drawDirective(ctx,car){
    if(car.directive==null || car.damaged){
        return;
    }
    const x=road.laneToX(car.directive.lane)+car.directive.offset;
    const y=car.y-70;
    ctx.fillStyle="rgba(0,120,255,0.8)";
    ctx.beginPath();
    ctx.moveTo(x,y-10);
    ctx.lineTo(x-7,y+4);
    ctx.lineTo(x+7,y+4);
    ctx.fill();
}

function animate(time){
    if(isGenerationOver()){
        nextGeneration();
    }

    traffic.update(cars,bestCar.y);
    orchestrator.update(cars);
    const borders=road.borders.concat(traffic.getBorders());
    for(let i=0;i<cars.length;i++){
        cars[i].update(borders,traffic.vehicles);
    }
    frame++;
    bestCar=getBestCar(cars);
    retireStragglers();
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
    drawDirective(carCtx,bestCar);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
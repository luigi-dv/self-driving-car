const myCanvas=document.getElementById("myCanvas");
const networkCanvas=document.getElementById("networkCanvas");

const carCtx = myCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(
    Sizing.roadWidth/2,
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
let paused=false;
let speed=1;
let statsDue=false;

// Longest time one frame may spend on simulation steps, in ms
const stepBudget=12;
const activations=["step","sigmoid","tanh","relu"];
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");

start();

function start(){
    loadNetwork();
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
    Panels.updatePolicy(profile,orchestrator);
    Panels.updateModel(bestCar.brain);
    Panels.syncNetworkControls(bestCar.brain);
    updateTimeControls();
    Sizing.init();
    FitnessChart.draw();
    updateButtons();
    updateStats();

    requestAnimationFrame(animate);
}

// The network the last session ended with, before the first cars exist
function loadNetwork(){
    const neurons=parseInt(localStorage.getItem("hiddenNeurons"));
    const activation=localStorage.getItem("hiddenActivation");
    if(neurons>=4 && neurons<=12){
        Car.hiddenLayers=[neurons];
    }
    if(activations.includes(activation)){
        Car.hiddenActivation=activation;
    }
}

function setupRegions(){
    const input=document.getElementById("regionInput");
    for(let i=0;i<registry.profiles.length;i++){
        const name=registry.profiles[i].name;
        const button=document.createElement("button");
        button.type="button";
        button.className="plain lamp";
        button.setAttribute("role","radio");
        button.textContent=Copy.profileName(name);
        button.title=registry.profiles[i].regions.join(", ");
        button.onclick=()=>setRegion(name);
        input.appendChild(button);
    }

    const name=localStorage.getItem("region")||Settings.region;
    profile=registry.get(name)||registry.profiles[0]||profile;
    road.handedness=profile.handedness;
    markRegion();
    Panels.updateScenarioList(profile);
}

// The radio buttons follow the profile
function markRegion(){
    const buttons=document.getElementById("regionInput").children;
    for(let i=0;i<buttons.length;i++){
        buttons[i].setAttribute(
            "aria-checked",String(registry.profiles[i]==profile)
        );
    }
}

function setRegion(name){
    profile=registry.get(name)||profile;
    road.handedness=profile.handedness;
    localStorage.setItem("region",profile.name);
    markRegion();
    Panels.updateScenarioList(profile);
    startSimulation(bestCar.brain);
    Panels.updatePolicy(profile,orchestrator);
    setStatus("Driving under "+Copy.profileName(profile.name));
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
    clearHistory();
    startSimulation(null);
    updateButtons();
    setStatus(discarded
        ?"Brain discarded, bring it back to undo"
        :"Started over");
}

function restore(){
    const record=BrainStorage.restore();
    if(record && !NeuralNetwork.matches(record.brain,bestCar.brain)){
        setStatus("The brain is back, but does not fit this network");
    }else if(record){
        generation=record.generation;
        clearHistory();
        startSimulation(record.brain);
        setStatus("Brain brought back");
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
            clearHistory();
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
    const violations=compliance?compliance.violations.length:0;
    document.getElementById("fitnessStat").textContent=
        Math.round(bestCar.fitness);
    document.getElementById("violationStat").textContent=violations;
    document.getElementById("scenario").textContent=
        traffic.director.current
            ?traffic.director.current.title
            :"";
    document.getElementById("directive").textContent=
        describeDirective(bestCar.directive);

    Panels.updateFrame(frame);
    Panels.updateWhy(bestCar,road);
    Panels.updateLastViolation(compliance);
    Panels.updateViolations(cars);
    Panels.updateCurrentScenario(traffic.director.current);
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
    updateStats();
}

function nextGeneration(){
    const parent=getBestCar(cars,false);
    recordDistance=Math.max(recordDistance,getDistance(parent));
    GenerationHistory.push({
        generation:generation,
        best:parent.fitness,
        average:cars.reduce((sum,c)=>sum+c.fitness,0)/cars.length
    });
    FitnessChart.draw();
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
    ctx.fillStyle=Theme.directive;
    ctx.beginPath();
    ctx.moveTo(x,y-10);
    ctx.lineTo(x-7,y+4);
    ctx.lineTo(x+7,y+4);
    ctx.fill();
}

// Runs the simulation for speed steps, as many as fit in the budget.
// The readouts are written once per drawn frame at most
function animate(time){
    if(!paused){
        const started=performance.now();
        for(let i=0;i<speed;i++){
            simulateStep();
            if(performance.now()-started>=stepBudget){
                break;
            }
        }
        if(statsDue){
            statsDue=false;
            updateStats();
        }
    }
    render(time);
    requestAnimationFrame(animate);
}

// Every step reads the current globals: a generation change inside
// the step replaces cars, traffic and orchestrator
function simulateStep(){
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
    statsDue=statsDue || frame%10==0;
}

function render(time){
    carCtx.clearRect(0,0,myCanvas.width,myCanvas.height);
    carCtx.save();
    carCtx.translate(0,-bestCar.y+myCanvas.height*0.7);

    road.draw(carCtx);
    traffic.draw(carCtx);
    carCtx.globalAlpha=Theme.learningAlpha;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);
    drawDirective(carCtx,bestCar);

    carCtx.restore();

    networkCtx.lineDashOffset=reducedMotion.matches?0:-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
}

function togglePause(){
    paused=!paused;
    updateTimeControls();
    setStatus(paused?"Paused":"Running");
}

function stepOnce(){
    if(!paused){
        return;
    }
    simulateStep();
    updateStats();
    render(performance.now());
}

function setSpeed(value){
    speed=value;
    updateTimeControls();
}

function updateTimeControls(){
    const button=document.getElementById("pauseButton");
    button.setAttribute("aria-pressed",String(paused));
    button.textContent=paused?"Resume":"Pause";
    document.getElementById("stepButton").disabled=!paused;
    [1,4,16].forEach(value=>{
        document.getElementById("speed"+value+"Button")
            .setAttribute("aria-pressed",String(value==speed));
    });
}

function clearHistory(){
    GenerationHistory.clear();
    FitnessChart.draw();
}

function previewNetwork(){
    Panels.updateNetworkControls(bestCar.brain);
}

function applyNetwork(){
    const neurons=parseInt(document.getElementById("neuronsInput").value);
    const activation=document.getElementById("activationInput").value;
    Car.hiddenLayers=[neurons];
    Car.hiddenActivation=activation;
    localStorage.setItem("hiddenNeurons",neurons);
    localStorage.setItem("hiddenActivation",activation);

    generation=1;
    recordDistance=0;
    clearHistory();
    startSimulation(null);
    Panels.updateModel(bestCar.brain);
    Panels.updateNetworkControls(bestCar.brain);
    setStatus("Restarted with "+neurons+" neurons, "+activation);
}

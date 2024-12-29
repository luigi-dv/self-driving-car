// Runs the rules of the active regional profile for every car: builds
// its perception, lets each rule plan and audit, then turns the result
// into guidance for the network and into a fitness score
class PolicyOrchestrator{
    static rules=[];

    static register(rule){
        PolicyOrchestrator.rules.push(rule);
        PolicyOrchestrator.rules.sort((a,b)=>a.stage-b.stage);
    }

    constructor(profile,traffic){
        this.profile=profile;
        this.traffic=traffic;
        this.road=traffic.road;
        this.speedLimit=Units.toSpeed(Settings.speedLimitKmh);
        this.rules=PolicyOrchestrator.rules
            .filter(r=>r.isEnabled(profile))
            .map(r=>new r(profile));
    }

    update(cars){
        for(let i=0;i<cars.length;i++){
            if(!cars[i].damaged){
                this.#drive(cars[i]);
            }
        }
    }

    #drive(car){
        if(car.compliance==null){
            car.compliance=new ComplianceRecord();
            car.memory.perception={};
        }
        const perception=new Perception(
            car,this.traffic,car.memory.perception
        );
        const directive=new Directive(perception.lane,this.speedLimit);

        for(let i=0;i<this.rules.length;i++){
            this.rules[i].plan(
                perception,directive,this.#getMemory(car,this.rules[i])
            );
        }
        for(let i=0;i<this.rules.length;i++){
            const violation=this.rules[i].audit(
                perception,directive,this.#getMemory(car,this.rules[i])
            );
            if(violation){
                car.compliance.add(this.rules[i].name,violation);
            }
        }

        car.directive=directive;
        car.signals.hazards=directive.hazards;
        if(car.compliance.disqualified){
            car.damaged=true;
        }
        this.#guide(car,directive);
    }

    #getMemory(car,rule){
        if(car.memory[rule.name]==null){
            car.memory[rule.name]={};
        }
        return car.memory[rule.name];
    }

    #guide(car,directive){
        const targetX=this.road.laneToX(directive.lane)+directive.offset;
        const laneError=(targetX-car.x)/this.road.laneWidth;
        car.guidance=[
            clamp(laneError,-1,1),
            clamp((directive.speed-car.speed)/car.maxSpeed,-1,1),
            clamp(car.angle/(Math.PI/4),-1,1)
        ];

        const weights=Settings.fitness;
        car.compliance.penalty+=
            Math.max(0,car.speed-directive.speed-0.1)
                *weights.speedingWeight
            +Math.abs(laneError)*weights.laneWeight;
        car.fitness=Settings.startY-car.y-car.compliance.penalty;
    }
}

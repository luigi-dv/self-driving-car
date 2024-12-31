// Cruises, brakes hard with the hazard lights on, then drives on
class HazardBrakeTechnique extends Technique{
    constructor(brakeAt,duration,slowSpeed){
        super();
        this.brakeAt=brakeAt;
        this.duration=duration;
        this.slowSpeed=slowSpeed;
    }

    drive(vehicle,world){
        const braking=vehicle.age>this.brakeAt
            && vehicle.age<this.brakeAt+this.duration;
        vehicle.signals.hazards=braking;
        return this.follow(
            vehicle,world,
            braking?this.slowSpeed:vehicle.cruiseSpeed
        );
    }
}

class HazardJamScenario extends Scenario{
    static title="Sudden braking ahead";
    static length=2000;

    static spawn(traffic,originY,focusY){
        for(let lane=0;lane<traffic.road.laneCount;lane++){
            traffic.spawn(
                lane,originY+250-lane*45,2.3,
                new HazardBrakeTechnique(200,500,0.5)
            );
        }
    }
}

ScenarioDirector.register(HazardJamScenario);

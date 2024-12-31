// Overtakes with the turn signal left on, to tell the traffic behind
// it is staying in the passing lane
class SustainedPassTechnique extends Technique{
    drive(vehicle,world){
        vehicle.signals.blinker=
            world.road.laneToX(1)>world.road.laneToX(0)?1:-1;
        return this.follow(vehicle,world,vehicle.cruiseSpeed);
    }
}

class SustainedPassScenario extends Scenario{
    static title="Long overtake ahead";
    static length=2400;

    static isApplicable(profile){
        return Settings.laneCount>1;
    }

    static spawn(traffic,originY,focusY){
        for(let i=0;i<3;i++){
            traffic.spawn(0,originY-i*120,1.3);
        }
        traffic.spawn(1,originY+90,1.6,new SustainedPassTechnique());
    }
}

ScenarioDirector.register(SustainedPassScenario);

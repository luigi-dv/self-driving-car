// Drives fast in its lane and, where the profile gives the signal a
// meaning, flashes the high beams at whoever holds it up
class FastApproachTechnique extends Technique{
    drive(vehicle,world){
        const speed=this.follow(vehicle,world,vehicle.cruiseSpeed,true);
        vehicle.signals.highBeam=speed<vehicle.cruiseSpeed
            && world.profile.signals.rear_high_beam_flash!=null;
        return speed;
    }
}

// Slow vehicles to overtake while a faster one comes from behind in
// the fastest lane
class FastApproachScenario extends Scenario{
    static title="Faster traffic behind";
    static length=2600;

    static spawn(traffic,originY,focusY){
        const laneMax=traffic.road.laneCount-1;
        traffic.spawn(0,originY,1.3);
        if(laneMax>1){
            traffic.spawn(1,originY-260,1.5);
        }
        traffic.spawn(
            laneMax,
            focusY+Settings.traffic.lookBehind-100,
            3.1,
            new FastApproachTechnique()
        );
    }
}

ScenarioDirector.register(FastApproachScenario);

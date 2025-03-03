// Stop-and-go traffic that opens the emergency corridor where the
// profile asks for it, then picks up speed again
class GridlockTechnique extends CrawlTechnique{
    drive(vehicle,world){
        const corridor=world.profile.exceptions.emergency_corridor||{};

        vehicle.offset=0;
        if(this.isCrawling(vehicle) && corridor.enabled){
            const laneMax=world.road.laneCount-1;
            vehicle.offset=Settings.corridor.offset*PolicyProfile.sideSign(
                vehicle.lane==laneMax
                    ?corridor.lane_max_offset
                    :corridor.other_lanes_offset
            );
        }
        return super.drive(vehicle,world);
    }
}

// The emergency vehicle the corridor is for
class EmergencyRunTechnique extends Technique{
    constructor(duration){
        super();
        this.duration=duration;
    }

    drive(vehicle,world){
        vehicle.signals.flashing=true;
        return vehicle.age<this.duration?vehicle.cruiseSpeed:3.4;
    }
}

class GridlockScenario extends Scenario{
    static title="Gridlock";
    static length=1400;

    static spawn(traffic,originY,focusY){
        const laneMax=traffic.road.laneCount-1;
        for(let lane=0;lane<=laneMax;lane++){
            for(let i=0;i<4;i++){
                traffic.spawn(
                    lane,originY-i*95-lane*20,2.2,
                    new GridlockTechnique(1500,0.15)
                );
            }
        }

        const corridor=traffic.profile.exceptions.emergency_corridor||{};
        if(corridor.enabled && laneMax>0){
            traffic.spawn(
                laneMax-0.5,
                focusY+Settings.traffic.lookBehind-100,
                1.2,
                new EmergencyRunTechnique(1500),
                {width:36,color:Theme.trafficSpecial}
            );
        }
    }
}

ScenarioDirector.register(GridlockScenario);

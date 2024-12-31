class StoppedEmergencyTechnique extends Technique{
    drive(vehicle,world){
        vehicle.signals.flashing=true;
        return 0;
    }
}

// An emergency vehicle stopped on the shoulder with its lights on
class EmergencyStopScenario extends Scenario{
    static title="Emergency vehicle on the shoulder";
    static length=1600;

    static spawn(traffic,originY,focusY){
        traffic.spawn(
            -1,originY-200,0,
            new StoppedEmergencyTechnique(),
            {color:"white"}
        );
        if(traffic.road.laneCount>1){
            traffic.spawn(1,originY+150,2.1);
        }
    }
}

ScenarioDirector.register(EmergencyStopScenario);

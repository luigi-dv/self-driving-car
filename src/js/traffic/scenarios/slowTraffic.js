// Slow vehicles to overtake and to return behind
class SlowTrafficScenario extends Scenario{
    static title="Slow traffic";
    static length=2200;

    static spawn(traffic,originY,focusY){
        traffic.spawn(0,originY,1.3);
        traffic.spawn(0,originY-320,1.5);
        if(traffic.road.laneCount>2){
            traffic.spawn(1,originY-700,1.4);
        }
    }
}

ScenarioDirector.register(SlowTrafficScenario);

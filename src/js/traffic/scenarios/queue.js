// A slow queue in every lane but the base one, that clears after a while
class QueueScenario extends Scenario{
    static title="Queue";
    static length=1800;

    static isApplicable(profile){
        return Settings.laneCount>1;
    }

    static spawn(traffic,originY,focusY){
        for(let lane=1;lane<traffic.road.laneCount;lane++){
            for(let i=0;i<5;i++){
                traffic.spawn(
                    lane,originY-i*110-lane*30,2.2,
                    new CrawlTechnique(1200,0.8)
                );
            }
        }
    }
}

ScenarioDirector.register(QueueScenario);

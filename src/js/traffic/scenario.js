// A scenario puts vehicles and road features ahead of the leading car so
// a policy rule has something to react to
class Scenario{
    static title="Scenario";
    static length=2200;

    static isApplicable(profile){
        return true;
    }

    static spawn(traffic,originY,focusY){
    }
}

class ScenarioDirector{
    static scenarios=[];

    static register(scenario){
        ScenarioDirector.scenarios.push(scenario);
    }

    constructor(traffic){
        this.traffic=traffic;
        this.queue=[];
        this.current=null;
        this.nextY=null;
    }

    update(focusY){
        if(this.nextY==null){
            this.nextY=focusY;
        }
        if(focusY>this.nextY){
            return;
        }

        const scenario=this.#next();
        if(scenario){
            scenario.spawn(
                this.traffic,
                focusY-Settings.traffic.spawnAhead,
                focusY
            );
            this.current=scenario;
            this.nextY=focusY-scenario.length;
        }
    }

    #next(){
        if(this.queue.length==0){
            this.queue=ScenarioDirector.scenarios.filter(
                s=>s.isApplicable(this.traffic.profile)
            );
            if(Settings.traffic.shuffleScenarios){
                this.queue=shuffle(this.queue);
            }
        }
        return this.queue.shift()||null;
    }
}

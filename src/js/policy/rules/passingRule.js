// Shared by the PASSING_RULES: when the vehicle ahead is slower, move to
// one of the lanes the profile allows or stay behind at a safe distance
class PassingRule extends PolicyRule{
    static stage=PolicyStage.PASSING;

    // Lanes the profile allows to overtake from a lane, best first
    getPassLanes(perception,lane){
        return [];
    }

    plan(perception,directive,memory){
        const base=directive.lane;
        const time=perception.timeToCollision(base,directive.speed);
        if(time<Settings.planner.timeToCollision){
            const lane=this.getPassLanes(perception,base).find(
                l=>perception.canEnter(l)
                    && perception.timeToCollision(l,directive.speed)>time
            );
            if(lane!==undefined){
                directive.changeLane(lane,"Overtake slower vehicle");
            }
        }

        this.keepDistance(perception,directive,perception.lane);
        if(directive.lane!=perception.lane){
            this.keepDistance(perception,directive,directive.lane);
        }
    }

    keepDistance(perception,directive,lane){
        const lead=perception.lead(lane);
        if(lead==null){
            return;
        }
        const safeGap=Settings.planner.safeGap;
        const speed=lead.gap>=safeGap
            ?lead.vehicle.speed
                +(lead.gap-safeGap)/Settings.planner.brakingHorizon
            :lead.vehicle.speed*Math.max(0,lead.gap/safeGap);
        directive.limitSpeed(speed,"Keep distance");
    }

    // LEFT and RIGHT in the file are sides of the road, lanes are
    // counted from the slow side
    sideToLaneDelta(side,road){
        const leftDelta=road.handedness=="RHT"?1:-1;
        return side=="LEFT"?leftDelta:-leftDelta;
    }
}

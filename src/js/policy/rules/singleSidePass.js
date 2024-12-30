// PASSING_RULES / RULE_SINGLE_SIDE_PASS
// Overtake strictly on the fast side. Passing on the inside is a
// violation, except in a slow queue (CONGESTION_OVERRIDE).
class SingleSidePassRule extends PassingRule{
    static isEnabled(profile){
        return profile.passing.mode=="SINGLE_SIDE_PASS";
    }

    getPassLanes(perception,lane){
        const delta=this.sideToLaneDelta(
            this.profile.passing.allowed_passing_side,
            perception.road
        );
        return [lane+delta];
    }

    plan(perception,directive,memory){
        super.plan(perception,directive,memory);
        if(this.profile.passing.undertaking_allowed){
            return;
        }

        // A slower vehicle further in must not be passed on the inside:
        // go behind it to overtake properly or hold its speed
        const lane=directive.lane;
        const inner=this.#getSlowerInside(perception,directive);
        if(lane!=perception.lane || inner==null){
            return;
        }

        const allowance=this.getCongestionAllowance(perception);
        if(allowance!=null){
            directive.limitSpeed(
                inner.vehicle.speed+allowance,
                "Congestion: pass the queue slowly"
            );
        }else if(perception.canEnter(lane+1)){
            directive.changeLane(lane+1,"Move out to overtake");
        }else{
            directive.limitSpeed(inner.vehicle.speed,"No undertaking");
        }
    }

    // Nearest slower vehicle ahead in any of the lanes further in
    #getSlowerInside(perception,directive){
        let nearest=null;
        for(let l=directive.lane+1;l<=perception.laneMax;l++){
            const lead=perception.lead(l);
            if(lead && !lead.vehicle.isObstacle
                && lead.vehicle.speed<directive.speed
                && lead.gap<3*Settings.planner.safeGap
                && (nearest==null || lead.gap<nearest.gap)){
                nearest=lead;
            }
        }
        return nearest;
    }

    audit(perception,directive,memory){
        if(this.profile.passing.undertaking_allowed){
            return null;
        }
        const allowance=this.getCongestionAllowance(perception);
        for(let i=0;i<perception.passed.length;i++){
            const passed=perception.passed[i];
            if(passed.lane<=perception.lane
                || passed.lane>perception.laneMax){
                continue;
            }
            const delta=perception.speed-passed.vehicle.speed;
            if(delta>(allowance||0)+Settings.planner.speedTolerance){
                return {
                    severity:"SOFT",
                    message:"Passed on the inside"
                };
            }
        }
        return null;
    }

    // CONGESTION_OVERRIDE: speed difference allowed to pass on the
    // inside while the traffic is a queue, null when it is not
    getCongestionAllowance(perception){
        return null;
    }
}

PolicyOrchestrator.register(SingleSidePassRule);

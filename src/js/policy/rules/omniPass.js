// PASSING_RULES / RULE_OMNI_PASS
// On a multi-lane highway a slower vehicle may be passed on either
// side when the gap allows it.
class OmniPassRule extends PassingRule{
    static isEnabled(profile){
        return profile.passing.mode=="OMNI_PASS";
    }

    getPassLanes(perception,lane){
        if(perception.road.laneCount<2){
            return [];
        }
        switch(this.profile.passing.allowed_passing_side){
            case "BOTH":
                return [lane+1,lane-1];
            default:
                return [lane+this.sideToLaneDelta(
                    this.profile.passing.allowed_passing_side,
                    perception.road
                )];
        }
    }
}

PolicyOrchestrator.register(OmniPassRule);

// Stages order the rules: a later stage can overrule an earlier one
const PolicyStage={
    LANE_SELECTION:10,
    PASSING:20,
    MERGE:30,
    EXCEPTION:40,
    SIGNAL:50
};

class PolicyRule{
    static stage=PolicyStage.LANE_SELECTION;

    static isEnabled(profile){
        return false;
    }

    constructor(profile){
        this.profile=profile;
    }

    get name(){
        return this.constructor.name;
    }

    // Adjusts the directive of a car
    plan(perception,directive,memory){
    }

    // Returns {severity,message} when the car broke the rule
    audit(perception,directive,memory){
        return null;
    }

    static penaltyToSeverity(penalty){
        switch(penalty){
            case "HARD_VIOLATION":
                return "HARD";
            case "SOFT_VIOLATION":
                return "SOFT";
            default:
                return null;
        }
    }
}

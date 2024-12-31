// EXCEPTION_HANDLERS / EMERGENCY_CORRIDOR_SPLIT
// In stop-and-go traffic open a corridor without waiting for a siren:
// the fastest lane moves to its outer edge, all the others the
// opposite way.
class EmergencyCorridorRule extends PolicyRule{
    static stage=PolicyStage.EXCEPTION;

    static isEnabled(profile){
        const corridor=profile.exceptions.emergency_corridor||{};
        return corridor.enabled===true;
    }

    constructor(profile){
        super(profile);
        this.config=profile.exceptions.emergency_corridor;
        this.triggerKmh=PolicyProfile.speedKmh(this.config,"trigger_speed");
    }

    plan(perception,directive,memory){
        if(this.#isGridlock(perception)){
            directive.shift(
                this.#getSign(perception)*Settings.corridor.offset,
                "Emergency corridor"
            );
        }
    }

    audit(perception,directive,memory){
        if(!this.#isGridlock(perception)){
            memory.frames=0;
            return null;
        }
        memory.frames=(memory.frames||0)+1;
        if(memory.frames<=Settings.corridor.graceFrames){
            return null;
        }

        const center=perception.road.laneToX(perception.lane);
        const shifted=(perception.car.x-center)*this.#getSign(perception);
        if(shifted<Settings.corridor.offset/2){
            memory.frames=0;
            return {
                severity:"SOFT",
                message:"Blocking the emergency corridor"
            };
        }
        return null;
    }

    #isGridlock(perception){
        return perception.laneMax>0
            && perception.averageSpeedKmh!=null
            && perception.averageSpeedKmh<this.triggerKmh;
    }

    #getSign(perception){
        return PolicyProfile.sideSign(
            perception.lane==perception.laneMax
                ?this.config.lane_max_offset
                :this.config.other_lanes_offset
        );
    }
}

PolicyOrchestrator.register(EmergencyCorridorRule);

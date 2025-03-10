// The words the page uses for rules and scenarios, keyed by class name
class Copy{
    // What a rule asks of a driver under the given profile
    static rules={
        StrictDisciplineRule:profile=>
            "Keep to the slow lane, go back after passing",
        FlexibleCruiseRule:profile=>
            "Any lane, but make way for faster traffic behind",
        SingleSidePassRule:profile=>{
            const side=String(profile.passing.allowed_passing_side)
                .toLowerCase();
            const exception=profile.passing.congestion_exception||{};
            const limit=PolicyProfile.speedKmh(exception,"max_queue_speed");
            return "Pass on the "+side+" only"
                +(exception.enabled && limit!=null
                    ?", except past a queue under "+Math.round(limit)+" km/h"
                    :"");
        },
        OmniPassRule:profile=>
            "Pass on either side",
        MainlinePriorityRule:profile=>
            "Traffic from the ramp gives way",
        CooperativeMergeRule:profile=>
            "Make room for traffic from the ramp",
        ZipperMergeRule:profile=>
            "Merge in turn where a lane ends",
        EmergencyCorridorRule:profile=>
            "Open a corridor when traffic stops",
        EmergencyMoveOverRule:profile=>
            "Leave the lane beside a stopped emergency vehicle",
        HighBeamYieldRule:profile=>
            "Give way when flashed from behind",
        SustainedBlinkerRule:profile=>
            "A held indicator means the car ahead stays out",
        HazardDecelerationRule:profile=>
            "Slow early for hazard lights ahead",
        CourtesyHazardsRule:profile=>
            "A short hazard flash after merging says thanks"
    };

    // What a scenario tests
    static scenarios={
        SlowTrafficScenario:{
            tests:"Which side to pass on"
        },
        FastApproachScenario:{
            tests:"Giving way to faster traffic"
        },
        QueueScenario:{
            tests:"Passing inside a queue"
        },
        RampMergeScenario:{
            tests:"Who gives way at a ramp"
        },
        LaneClosureScenario:{
            tests:"Merging in turn"
        },
        GridlockScenario:{
            tests:"Opening an emergency corridor"
        },
        EmergencyStopScenario:{
            tests:"Moving over for a stopped emergency vehicle"
        },
        SustainedPassScenario:{
            tests:"Reading a held indicator"
        },
        HazardJamScenario:{
            tests:"Slowing early for hazard lights"
        }
    };

    static rule(className,profile){
        const write=Copy.rules[className];
        return write?write(profile):"";
    }

    static scenario(className){
        return Copy.scenarios[className]||{tests:""};
    }

    // "SingleSidePassRule" -> "Single side pass"
    static ruleName(className){
        const words=String(className).replace(/Rule$/,"")
            .replace(/([a-z])([A-Z])/g,"$1 $2").toLowerCase();
        return words.charAt(0).toUpperCase()+words.slice(1);
    }

    // "EU_STRICT" -> "EU strict"
    static profileName(name){
        const parts=String(name).split("_");
        return [parts[0]].concat(
            parts.slice(1).map(p=>p.toLowerCase())
        ).join(" ");
    }
}

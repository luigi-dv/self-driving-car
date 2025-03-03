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

    // What a scenario tests, and what happens in it
    static scenarios={
        SlowTrafficScenario:{
            tests:"Which side to pass on",
            about:"Slow vehicles sit in the lanes ahead. The car has to "
                +"get past them on the side its region allows, then go "
                +"back to its lane."
        },
        FastApproachScenario:{
            tests:"Giving way to faster traffic",
            about:"While the car overtakes, a faster vehicle closes in "
                +"from behind in the fast lane and, where the region "
                +"gives it a meaning, flashes its high beams."
        },
        QueueScenario:{
            tests:"Passing inside a queue",
            about:"A slow queue fills every lane but the slow one, then "
                +"clears. Where the region allows it, the car may pass "
                +"the queue on the inside at a small speed difference."
        },
        RampMergeScenario:{
            tests:"Who gives way at a ramp",
            about:"A vehicle speeds up along the acceleration lane and "
                +"joins the slow lane when there is a gap. The region "
                +"decides whether the traffic on the road makes room."
        },
        LaneClosureScenario:{
            tests:"Merging in turn",
            about:"A stretch of one lane is closed for works. Traffic "
                +"in the closing lane drives up to the closure and "
                +"merges there, one vehicle at a time."
        },
        GridlockScenario:{
            tests:"Opening an emergency corridor",
            about:"Traffic slows to a crawl and an emergency vehicle "
                +"comes through from behind. Where the region asks for "
                +"it, every lane moves aside to open a corridor."
        },
        EmergencyStopScenario:{
            tests:"Moving over for a stopped emergency vehicle",
            about:"An emergency vehicle stands on the shoulder with its "
                +"lights on. Where the region asks for it, the car "
                +"leaves the lane beside it or slows down."
        },
        SustainedPassScenario:{
            tests:"Reading a held indicator",
            about:"A vehicle ahead overtakes with its indicator left "
                +"on, which tells the traffic behind that it is staying "
                +"in the passing lane."
        },
        HazardJamScenario:{
            tests:"Slowing early for hazard lights",
            about:"A vehicle ahead brakes hard with its hazard lights "
                +"on, then drives on. The car should slow down before "
                +"it gets there."
        }
    };

    static rule(className,profile){
        const write=Copy.rules[className];
        return write?write(profile):"";
    }

    static scenario(className){
        return Copy.scenarios[className]||{tests:"",about:""};
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

    // ["DE","FR","PL"] -> "DE, FR and PL"
    static list(items){
        if(items.length<2){
            return items.join("");
        }
        return items.slice(0,-1).join(", ")+" and "+items[items.length-1];
    }
}

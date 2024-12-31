class PolicyProfile{
    constructor(name,data={}){
        this.name=name;
        this.regions=data.applicable_regions||[];
        this.handedness=data.traffic_handedness||"RHT";
        this.laneSelection=data.lane_selection||{};
        this.passing=data.passing_rules||{};
        this.merge=data.merge_protocol||{};
        this.exceptions=data.exception_handlers||{};
        this.signals=data.perception_intent_mapping||{};
    }

    static none(){
        return new PolicyProfile("NONE");
    }

    // The file mixes km/h and mph, the simulation only works in km/h
    static speedKmh(section,key){
        if(section[key+"_kmh"]!=null){
            return section[key+"_kmh"];
        }
        if(section[key+"_mph"]!=null){
            return section[key+"_mph"]*Settings.units.kmhPerMph;
        }
        return null;
    }

    // Screen direction of a side named in the file
    static sideSign(side){
        return String(side).includes("LEFT")?-1:1;
    }

    mapsSignal(signal,intent){
        return this.signals[signal]==intent;
    }
}

class PolicyRegistry{
    constructor(policies={}){
        this.version=policies.version;
        this.convention=policies.coordinate_convention||{};
        this.profiles=[];

        const profiles=policies.regional_profiles||{};
        for(const name in profiles){
            this.profiles.push(new PolicyProfile(name,profiles[name]));
        }
    }

    get(name){
        return this.profiles.find(p=>p.name==name)||null;
    }

    getByRegion(region){
        return this.profiles.find(p=>p.regions.includes(region))||null;
    }
}

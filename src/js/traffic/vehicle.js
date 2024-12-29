// A driving technique decides, every frame, the speed a traffic vehicle
// wants and may change its lane, lateral offset and signals
class Technique{
    drive(vehicle,world){
        return this.follow(vehicle,world,vehicle.cruiseSpeed);
    }

    follow(vehicle,world,speed,includeCars=false){
        const lead=world.getLead(vehicle,includeCars);
        if(lead){
            const gap=vehicle.y-lead.y-(vehicle.height+lead.height)/2;
            if(gap<Settings.traffic.minGap){
                return 0;
            }
            if(gap<Settings.traffic.followGap){
                return Math.min(speed,lead.speed);
            }
        }
        return speed;
    }
}

class CruiseTechnique extends Technique{
}

// Crawls for a while, then picks up its cruise speed again
class CrawlTechnique extends Technique{
    constructor(duration,crawlSpeed){
        super();
        this.duration=duration;
        this.crawlSpeed=crawlSpeed;
    }

    isCrawling(vehicle){
        return vehicle.age<this.duration;
    }

    drive(vehicle,world){
        return this.follow(
            vehicle,world,
            this.isCrawling(vehicle)?this.crawlSpeed:vehicle.cruiseSpeed
        );
    }
}

class TrafficVehicle extends Car{
    static #nextId=1;

    constructor(road,lane,y,speed,technique=new CruiseTechnique(),options={}){
        super(
            road.laneToX(lane),y,
            options.width||30,
            options.height||50,
            "DUMMY",speed,
            options.color||getRandomColor()
        );
        this.id=TrafficVehicle.#nextId++;
        this.road=road;
        this.lane=lane;
        this.cruiseSpeed=speed;
        this.speed=speed;
        this.technique=technique;

        this.offset=0;
        this.age=0;
        this.intent=null;
        this.blinkerFrames=0;
    }

    update(world){
        this.age++;
        const target=Math.max(0,this.technique.drive(this,world));
        const wanted=target>0?target+this.friction:0;
        this.maxSpeed=approach(
            this.maxSpeed,wanted,
            wanted<this.maxSpeed?0.1:0.04
        );
        this.blinkerFrames=this.signals.blinker!=0
            ?this.blinkerFrames+1
            :0;

        const targetX=this.road.laneToX(this.lane)+this.offset;
        this.x+=clamp(targetX-this.x,-1.2,1.2);
        super.update([],[]);
    }
}

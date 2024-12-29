// What one car knows about the traffic around it in a single frame
class Perception{
    constructor(car,traffic,memory){
        this.car=car;
        this.traffic=traffic;
        this.road=traffic.road;
        this.laneMax=this.road.laneCount-1;
        this.lane=clamp(this.road.xToLane(car.x),0,this.laneMax);
        this.speed=car.speed;

        this.entries=[];
        this.shoulder=[];
        this.leads=[];
        this.rears=[];
        this.passed=[];
        this.overtakers=[];
        this.closure=null;
        this.averageSpeedKmh=null;

        this.#observeVehicles(memory);
        this.#observeClosures();
    }

    #observeVehicles(memory){
        const ahead=new Set();
        const behind=new Set();
        let speedSum=0;
        let speedCount=0;

        const targets=this.traffic.vehicles.concat(this.traffic.obstacles);
        for(let i=0;i<targets.length;i++){
            const vehicle=targets[i];
            const distance=this.car.y-vehicle.y;
            if(Math.abs(distance)>Settings.planner.range+vehicle.height/2){
                continue;
            }

            const entry={
                vehicle:vehicle,
                lane:this.road.xToLane(vehicle.x),
                ahead:distance>0,
                gap:Math.abs(distance)
                    -(this.car.height+vehicle.height)/2,
                closing:distance>0
                    ?this.speed-vehicle.speed
                    :vehicle.speed-this.speed
            };
            this.entries.push(entry);

            if(!vehicle.isObstacle){
                (entry.ahead?ahead:behind).add(vehicle.id);
                if(!entry.ahead && memory.ahead
                    && memory.ahead.has(vehicle.id)){
                    this.passed.push(entry);
                }
                if(entry.ahead && memory.behind
                    && memory.behind.has(vehicle.id)){
                    this.overtakers.push(entry);
                }
            }

            if(entry.lane<0 || entry.lane>this.laneMax){
                this.shoulder.push(entry);
                continue;
            }
            if(!vehicle.isObstacle && Math.abs(distance)<300){
                speedSum+=vehicle.speed;
                speedCount++;
            }
            this.#occupiedLanes(vehicle).forEach(lane=>{
                const slots=entry.ahead?this.leads:this.rears;
                if(slots[lane]==null || entry.gap<slots[lane].gap){
                    slots[lane]=entry;
                }
            });
        }

        memory.ahead=ahead;
        memory.behind=behind;
        if(speedCount>=2){
            this.averageSpeedKmh=Units.toKmh(speedSum/speedCount);
        }
    }

    #observeClosures(){
        const features=this.traffic.features;
        for(let i=0;i<features.length;i++){
            const feature=features[i];
            if(feature.closedLane==null){
                continue;
            }
            const distance=this.car.y-this.car.height/2-feature.y;
            if(distance>-feature.length
                && (this.closure==null || distance<this.closure.distance)){
                this.closure={
                    lane:feature.closedLane,
                    distance:distance
                };
            }
        }
    }

    // A vehicle changing lanes takes room in both of them
    #occupiedLanes(vehicle){
        const position=this.road.xToLanePosition(vehicle.x);
        const lanes=new Set([Math.round(position)]);
        if(Math.abs(position-Math.round(position))>0.25){
            lanes.add(Math.floor(position));
            lanes.add(Math.ceil(position));
        }
        return [...lanes].filter(l=>l>=0 && l<=this.laneMax);
    }

    lead(lane){
        return this.leads[lane]||null;
    }

    rear(lane){
        return this.rears[lane]||null;
    }

    // Frames left before reaching the vehicle ahead at a given speed
    timeToCollision(lane,speed=this.speed){
        const lead=this.lead(lane);
        if(lead==null){
            return Infinity;
        }
        const closing=speed-lead.vehicle.speed;
        return closing<=0
            ?Infinity
            :Math.max(0,lead.gap)/closing;
    }

    canEnter(lane,
        frontGap=Settings.planner.safeGap,
        rearGap=Settings.planner.safeGap/2){
        if(lane<0 || lane>this.laneMax){
            return false;
        }
        if(lane==this.lane){
            return true;
        }
        const reaction=Settings.planner.reactionFrames;
        const lead=this.lead(lane);
        const rear=this.rear(lane);
        if(lead && lead.gap<frontGap+Math.max(0,lead.closing)*reaction){
            return false;
        }
        if(rear && rear.gap<rearGap+Math.max(0,rear.closing)*reaction){
            return false;
        }
        return true;
    }

    // Vehicles outside the lanes that are about to join them
    merging(){
        return this.shoulder.filter(e=>e.vehicle.intent=="MERGE");
    }
}

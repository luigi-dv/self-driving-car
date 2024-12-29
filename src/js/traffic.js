class RoadFeature{
    constructor(startY,endY){
        this.startY=startY;
        this.endY=endY;
        this.obstacles=[];
        this.borders=[];
    }

    draw(ctx,road){
    }
}

class Traffic{
    constructor(road,profile){
        this.road=road;
        this.profile=profile;

        this.vehicles=[];
        this.features=[];
        this.obstacles=[];
        this.cars=[];
        this.focusY=0;
        this.director=new ScenarioDirector(this);
    }

    spawn(lane,y,speed,technique,options){
        const vehicle=new TrafficVehicle(
            this.road,lane,y,speed,technique,options
        );
        this.vehicles.push(vehicle);
        return vehicle;
    }

    addFeature(feature){
        this.features.push(feature);
        return feature;
    }

    update(cars,focusY){
        this.cars=cars;
        this.focusY=focusY;
        this.director.update(focusY);

        this.obstacles=[];
        for(let i=0;i<this.features.length;i++){
            this.obstacles.push(...this.features[i].obstacles);
        }
        for(let i=0;i<this.vehicles.length;i++){
            this.vehicles[i].update(this);
        }

        const settings=Settings.traffic;
        this.vehicles=this.vehicles.filter(
            v=>v.y<focusY+settings.lookBehind
                && v.y>focusY-settings.lookAhead
        );
        this.features=this.features.filter(
            f=>f.endY<focusY+settings.lookBehind
        );
    }

    getBorders(){
        const borders=[];
        for(let i=0;i<this.features.length;i++){
            borders.push(...this.features[i].borders);
        }
        return borders;
    }

    // Nearest thing ahead in the path of a traffic vehicle
    getLead(vehicle,includeCars=false){
        let lead=null;
        const consider=other=>{
            if(other==vehicle || other.y>=vehicle.y || other.damaged){
                return;
            }
            const reach=(other.width+vehicle.width)/2+6;
            if(Math.abs(other.x-vehicle.x)>=reach){
                return;
            }
            if(lead==null
                || other.y+other.height/2>lead.y+lead.height/2){
                lead=other;
            }
        };

        this.vehicles.forEach(consider);
        this.obstacles.forEach(consider);
        if(includeCars){
            this.cars.forEach(consider);
        }
        return lead;
    }

    // True when a traffic vehicle can move into a lane without cutting
    // anybody off, the learning cars included
    isGapFree(vehicle,lane,front,back){
        const laneX=this.road.laneToX(lane);
        const blocks=other=>{
            if(other==vehicle || other.damaged){
                return false;
            }
            if(Math.abs(other.x-laneX)>=(other.width+vehicle.width)/2){
                return false;
            }
            const distance=other.y-vehicle.y;
            const half=(other.height+vehicle.height)/2;
            return distance<0
                ?-distance-half<front
                :distance-half<back;
        };

        return !this.vehicles.some(blocks)
            && !this.obstacles.some(blocks)
            && !this.cars.some(blocks);
    }

    draw(ctx){
        for(let i=0;i<this.features.length;i++){
            this.features[i].draw(ctx,this.road);
        }
        for(let i=0;i<this.vehicles.length;i++){
            this.vehicles[i].draw(ctx);
        }
    }
}

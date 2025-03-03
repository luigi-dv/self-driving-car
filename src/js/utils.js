function lerp(A,B,t){
    return A+(B-A)*t;
}

function clamp(value,min,max){
    return Math.max(min,Math.min(max,value));
}

function approach(value,target,step){
    return value<target
        ?Math.min(target,value+step)
        :Math.max(target,value-step);
}

function shuffle(items){
    const result=items.slice();
    for(let i=result.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
}

function getIntersection(A,B,C,D){
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);

    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t
            }
        }
    }

    return null;
}

function polysIntersect(poly1, poly2){
    for(let i=0;i<poly1.length;i++){
        for(let j=0;j<poly2.length;j++){
            const touch=getIntersection(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if(touch){
                return true;
            }
        }
    }
    return false;
}

function getRGBA(value){
    if(value==0){
        return "rgba(0,0,0,0)";
    }
    const alpha=Math.min(1,Math.abs(value));
    const rgb=value>0?Theme.weightPositive:Theme.weightNegative;
    return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+alpha+")";
}

function getInputRGBA(value){
    if(value==0){
        return "rgba(0,0,0,0)";
    }
    const alpha=Math.min(1,Math.abs(value));
    const rgb=value>0?Theme.inputPositive:Theme.weightNegative;
    return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+alpha+")";
}

function getRandomColor(){
    return Theme.traffic[Math.floor(Math.random()*Theme.traffic.length)];
}

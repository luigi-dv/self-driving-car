// Fills the readouts around the canvases from the state of the simulation
class Panels{
    static #restHint="A different network starts training again from "
        +"generation 1. The saved brain stays saved, but will not fit.";
    static #svg="http://www.w3.org/2000/svg";

    // Violations of the current generation, counted once per record
    static #counts=new Map();
    static #counted=new WeakMap();
    static #countedCars=null;
    static #countSignature=null;
    static #countCells=new Map();

    static #laneCount=0;
    static #heads=[];
    static #here=[];
    static #reasonSignature=null;

    // The scenarios of the profile in director order, and the board rows
    static #scenarios=[];
    static #rows=[];
    static #shown=undefined;

    static updateFrame(frame){
        const max=Settings.generation.maxFrames;
        Panels.#setText(
            "frameStat",
            frame.toLocaleString("en-US")+" of "+max.toLocaleString("en-US")
        );
        document.getElementById("frameBar").style.width=
            Math.min(100,frame/max*100)+"%";
    }

    static updateWhy(car,road){
        const directive=car.directive;
        const current=road.xToLane(car.x);
        const target=directive?directive.lane:null;

        if(road.laneCount!=Panels.#laneCount){
            Panels.#buildLanes(road.laneCount);
        }
        // Screen order, the same mapping as Road.laneToX
        for(let lane=0;lane<road.laneCount;lane++){
            const index=road.handedness=="RHT"
                ?road.laneCount-1-lane
                :lane;
            Panels.#heads[index].classList.toggle("is-target",lane==target);
            Panels.#here[index].classList.toggle("is-here",lane==current);
        }

        Panels.#setText(
            "whyLane",
            directive?Panels.#laneName(directive.lane,road):"no lane yet"
        );
        Panels.#setText(
            "whySpeed",
            directive
                ?Math.round(Units.toKmh(directive.speed))+" km/h"
                :"no speed"
        );
        Panels.#setText(
            "whySpeedNow",
            Math.round(Units.toKmh(car.speed))+" km/h"
        );

        let reasons=[];
        if(directive){
            reasons=[...new Set(directive.reasons)];
            if(reasons.length==0){
                reasons=["Cruise"];
            }
        }
        const signature=reasons.join("|");
        if(signature!=Panels.#reasonSignature){
            Panels.#reasonSignature=signature;
            document.getElementById("whyReasons").replaceChildren(
                ...reasons.map(reason=>
                    Panels.#create("li","",Panels.#sentence(reason))
                )
            );
        }
    }

    static updateLastViolation(compliance){
        const last=compliance?compliance.last:null;
        document.getElementById("violationLine").hidden=last==null;
        document.getElementById("violationEmpty").hidden=last!=null;
        Panels.#setText(
            "violation",
            last?Panels.#sentence(last.message):""
        );
        Panels.#setText("violationRule",last?Copy.ruleName(last.rule):"");
        Panels.#setText(
            "violationSeverity",
            last?Panels.#severityText(last.severity):""
        );
    }

    // The count of every rule of the profile, over all cars of the generation
    static updateViolations(cars){
        if(cars!==Panels.#countedCars){
            Panels.#countedCars=cars;
            Panels.#counts=new Map();
            Panels.#counted=new WeakMap();
        }
        for(let i=0;i<cars.length;i++){
            const record=cars[i].compliance;
            if(record==null){
                continue;
            }
            const violations=record.violations;
            for(let j=Panels.#counted.get(record)||0;j<violations.length;j++){
                const count=Panels.#counts.get(violations[j].rule)
                    ||{total:0,hard:0};
                count.total++;
                if(violations[j].severity=="HARD"){
                    count.hard++;
                }
                Panels.#counts.set(violations[j].rule,count);
            }
            Panels.#counted.set(record,violations.length);
        }
        Panels.#showCounts();
    }

    static #showCounts(){
        const signature=[...Panels.#countCells.keys()].map(rule=>{
            const count=Panels.#counts.get(rule);
            return rule+":"+(count?count.total+":"+count.hard:"0");
        }).join("|");
        if(signature==Panels.#countSignature){
            return;
        }
        Panels.#countSignature=signature;

        Panels.#countCells.forEach((cell,rule)=>{
            const count=Panels.#counts.get(rule)||{total:0,hard:0};
            cell.textContent=count.total==0
                ?"kept"
                :count.total+" broken"
                    +(count.hard>0?", "+count.hard+" out":"");
            cell.parentNode.classList.toggle("is-broken",count.total>0);
        });
    }

    // The scenarios of the profile, in the order the director plays them
    static updateScenarioList(profile){
        Panels.#scenarios=ScenarioDirector.scenarios.filter(
            scenario=>scenario.isApplicable(profile)
        );
        Panels.#rows=Panels.#scenarios.map(
            scenario=>Panels.#boardRow(scenario)
        );
        document.getElementById("scenarioList").replaceChildren(
            ...Panels.#rows.map(row=>row.item)
        );
        Panels.#shown=undefined;
    }

    static updateCurrentScenario(current){
        if(current===Panels.#shown){
            return;
        }
        Panels.#shown=current;
        const index=Panels.#scenarios.indexOf(current);
        Panels.#rows.forEach((row,i)=>{
            Panels.#setBoardState(
                row,
                index<0 || i>index?"ahead":(i==index?"now":"done")
            );
        });
    }

    static updatePolicy(profile,orchestrator){
        document.getElementById("policyName").textContent=
            Copy.profileName(profile.name);
        document.getElementById("policyHandedness").textContent=
            profile.handedness=="LHT"
                ?"driving on the left"
                :"driving on the right";
        document.getElementById("policyRegions").textContent=
            Copy.list(profile.regions);

        Panels.#countCells=new Map();
        const rules=orchestrator?orchestrator.rules:[];
        document.getElementById("policyRules").replaceChildren(
            ...rules.map(rule=>{
                const row=document.createElement("tr");
                const name=Panels.#create("th","",Copy.ruleName(rule.name));
                name.scope="row";
                const count=Panels.#create("td","count");
                row.appendChild(name);
                row.appendChild(
                    Panels.#create("td","asks",Copy.rule(rule.name,profile))
                );
                row.appendChild(count);
                Panels.#countCells.set(rule.name,count);
                return row;
            })
        );
        Panels.#countSignature=null;
        Panels.#showCounts();
    }

    // Describes the network that is running now
    static updateModel(network){
        const sizes=Panels.#getSizes(network);
        document.getElementById("modelHidden").textContent=
            sizes.slice(1,-1).join(" + ");
        document.getElementById("modelParams").textContent=
            Panels.#countParameters(sizes);
    }

    // Puts the staged values of the network controls back to the running ones
    static syncNetworkControls(network){
        document.getElementById("neuronsInput").value=Car.hiddenLayers[0];
        document.getElementById("activationInput").value=
            Car.hiddenActivation;
        Panels.updateNetworkControls(network);
    }

    static updateNetworkControls(network){
        const neurons=parseInt(
            document.getElementById("neuronsInput").value
        );
        const activation=document.getElementById("activationInput").value;
        document.getElementById("neuronsStat").textContent=neurons;

        const parts=[];
        if(neurons!=Car.hiddenLayers[0]){
            parts.push(Car.hiddenLayers[0]+" to "+neurons+" neurons");
        }
        if(activation!=Car.hiddenActivation){
            parts.push(Car.hiddenActivation+" to "+activation);
        }
        const changed=parts.length>0;

        if(changed){
            const sizes=Panels.#getSizes(network);
            const before=Panels.#countParameters(sizes);
            const after=Panels.#countParameters(
                [sizes[0],neurons,sizes[sizes.length-1]]
            );
            if(before!=after){
                parts.push(before+" to "+after+" numbers");
            }
        }

        const hint=document.getElementById("networkHint");
        hint.textContent=changed
            ?"Restarts training from generation 1: "+parts.join(", ")+"."
            :Panels.#restHint;
        hint.classList.toggle("is-pending",changed);
        document.getElementById("networkApply").disabled=!changed;
    }

    // One arrow head and one marker slot per lane, in screen order
    static #buildLanes(laneCount){
        Panels.#laneCount=laneCount;
        Panels.#heads=[];
        Panels.#here=[];
        for(let i=0;i<laneCount;i++){
            const head=Panels.#create("span","head");
            const svg=document.createElementNS(Panels.#svg,"svg");
            svg.setAttribute("viewBox","0 0 36 36");
            const path=document.createElementNS(Panels.#svg,"path");
            path.setAttribute("d","M18 5v22M8 18l10 10 10-10");
            path.setAttribute("fill","none");
            path.setAttribute("stroke","currentColor");
            path.setAttribute("stroke-width","5");
            svg.appendChild(path);
            head.appendChild(svg);
            Panels.#heads.push(head);
            Panels.#here.push(Panels.#create("span",""));
        }
        document.getElementById("whyLaneMap").replaceChildren(
            ...Panels.#heads
        );
        document.getElementById("whyHere").replaceChildren(...Panels.#here);
    }

    static #boardRow(scenario){
        const copyText=Copy.scenario(scenario.name);
        const item=document.createElement("li");
        const state=Panels.#create("span","state");
        const detail=Panels.#create("span","detail");
        item.appendChild(Panels.#create("span","what",scenario.title));
        item.appendChild(Panels.#create("span","tests",copyText.tests));
        item.appendChild(state);
        item.appendChild(detail);
        return {item:item,state:state,detail:detail,about:copyText.about};
    }

    static #setBoardState(row,state){
        row.item.className=state=="done"
            ?"is-done"
            :(state=="now"?"is-now":"");
        if(state=="now"){
            row.item.setAttribute("aria-current","step");
        }else{
            row.item.removeAttribute("aria-current");
        }
        row.state.textContent=state=="done"
            ?"Passed"
            :(state=="now"?"Now":"Ahead");
        row.detail.textContent=state=="now"?row.about:"";
    }

    static #laneName(lane,road){
        if(lane<0 || lane>=road.laneCount){
            return "ramp";
        }
        if(road.laneCount==3){
            return ["slow lane","middle lane","fast lane"][lane];
        }
        return "lane "+(lane+1);
    }

    static #severityText(severity){
        if(severity=="HARD"){
            return "hard, car out";
        }
        return "soft, "+Settings.fitness.softPenalty+" fitness lost";
    }

    static #sentence(text){
        return /[.!?]$/.test(text)?text:text+".";
    }

    // Neurons per layer, inputs first
    static #getSizes(network){
        return [
            network.levels[0].weights.length,
            ...network.levels.map(level=>level.biases.length)
        ];
    }

    static #countParameters(sizes){
        let total=0;
        for(let i=0;i<sizes.length-1;i++){
            total+=(sizes[i]+1)*sizes[i+1];
        }
        return total;
    }

    static #setText(id,text){
        const element=document.getElementById(id);
        if(element.textContent!=text){
            element.textContent=text;
        }
    }

    static #create(tag,className,text=null){
        const element=document.createElement(tag);
        if(className!=""){
            element.className=className;
        }
        if(text!=null){
            element.textContent=text;
        }
        return element;
    }
}

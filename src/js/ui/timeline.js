// The generations as a line, newest on top: the one driving now, then the
// finished ones, each with a bar for the best fitness it reached
class HistoryLine{
    // Finished generations kept on the line
    static #length=20;

    static #rows=[];
    static #scale=1;
    static #stops=[];
    static #scenarios=[];
    static #shown=undefined;

    // One mark per scenario of the profile, in the order they are driven
    static setScenarios(profile){
        HistoryLine.#scenarios=ScenarioDirector.scenarios.filter(
            scenario=>scenario.isApplicable(profile)
        );
        HistoryLine.#stops=HistoryLine.#scenarios.map(
            scenario=>document.createElement("i")
        );
        document.getElementById("scenarioStops").replaceChildren(
            ...HistoryLine.#stops
        );
        HistoryLine.#shown=undefined;
    }

    static updateDrive(current){
        if(current===HistoryLine.#shown){
            return;
        }
        HistoryLine.#shown=current;
        const index=HistoryLine.#scenarios.indexOf(current);
        HistoryLine.#stops.forEach((stop,i)=>{
            stop.className=index<0 || i>index
                ?""
                :(i==index?"is-now":"is-done");
        });
    }

    // The finished generations, from the history
    static rebuild(profile){
        const entries=GenerationHistory.entries
            .slice(-HistoryLine.#length).reverse();
        let region=profile.name;
        HistoryLine.#rows=entries.map(entry=>{
            const row=HistoryLine.#row(entry,entry.region!=region);
            region=entry.region;
            return row;
        });

        const line=document.getElementById("historyLine");
        while(line.children.length>1){
            line.removeChild(line.lastChild);
        }
        HistoryLine.#rows.forEach(row=>line.appendChild(row.item));
        HistoryLine.#scale=0;
    }

    // The generation that is driving
    static updateNow(best,cars){
        const fitness=Math.max(0,best.fitness);
        const scale=Math.max(
            1,fitness,...HistoryLine.#rows.map(row=>row.best)
        );
        if(scale!=HistoryLine.#scale){
            HistoryLine.#scale=scale;
            HistoryLine.#rows.forEach(row=>{
                row.bar.style.width=HistoryLine.#share(row.best)+"%";
            });
        }
        document.getElementById("fitnessBar").style.width=
            HistoryLine.#share(fitness)+"%";
        document.getElementById("aliveNow").textContent=
            HistoryLine.countAlive(cars);
        document.getElementById("brokenNow").textContent=
            HistoryLine.countBroken(cars);
    }

    static countAlive(cars){
        return cars.filter(car=>!car.damaged).length;
    }

    static countBroken(cars){
        return cars.reduce(
            (total,car)=>total
                +(car.compliance?car.compliance.violations.length:0),
            0
        );
    }

    static format(value){
        return Math.round(value).toLocaleString("en-US");
    }

    static #share(value){
        return Math.max(0,Math.min(100,value/HistoryLine.#scale*100));
    }

    static #row(entry,regionChanged){
        const item=document.createElement("li");
        const bar=document.createElement("i");
        const track=HistoryLine.#cell("bar");
        track.appendChild(bar);

        item.appendChild(HistoryLine.#cell("gen",entry.generation));
        item.appendChild(track);
        item.appendChild(
            HistoryLine.#cell("num",HistoryLine.format(entry.best))
        );
        item.appendChild(
            HistoryLine.#cell("num tech",HistoryLine.format(entry.average))
        );
        item.appendChild(HistoryLine.#cell("num tech",entry.alive));
        item.appendChild(HistoryLine.#cell("num tech",entry.broken));
        if(regionChanged){
            item.appendChild(
                HistoryLine.#cell("drive",Copy.profileName(entry.region))
            );
        }
        return {item:item,bar:bar,best:Math.max(0,entry.best)};
    }

    static #cell(className,text=null){
        const cell=document.createElement("span");
        cell.className=className;
        if(text!=null){
            cell.textContent=text;
        }
        return cell;
    }
}

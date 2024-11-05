class BrainStorage{
    static #key="bestBrain";
    static #backupKey="bestBrainBackup";

    static save(brain,info={}){
        const record={
            brain:brain,
            generation:info.generation||1,
            distance:info.distance||0,
            savedAt:Date.now()
        };
        localStorage.setItem(
            BrainStorage.#key,
            JSON.stringify(record)
        );
        return record;
    }

    static load(){
        return BrainStorage.parse(
            localStorage.getItem(BrainStorage.#key)
        );
    }

    static discard(){
        const saved=localStorage.getItem(BrainStorage.#key);
        if(saved==null){
            return false;
        }
        localStorage.setItem(BrainStorage.#backupKey,saved);
        localStorage.removeItem(BrainStorage.#key);
        return true;
    }

    static restore(){
        const backup=localStorage.getItem(BrainStorage.#backupKey);
        if(backup==null){
            return null;
        }
        const saved=localStorage.getItem(BrainStorage.#key);
        localStorage.setItem(BrainStorage.#key,backup);
        if(saved==null){
            localStorage.removeItem(BrainStorage.#backupKey);
        }else{
            localStorage.setItem(BrainStorage.#backupKey,saved);
        }
        return BrainStorage.load();
    }

    static hasBackup(){
        return BrainStorage.parse(
            localStorage.getItem(BrainStorage.#backupKey)
        )!=null;
    }

    static parse(text){
        try{
            const data=JSON.parse(text);
            if(!data){
                return null;
            }
            if(data.levels){
                return {
                    brain:data,
                    generation:1,
                    distance:0,
                    savedAt:null
                };
            }
            return data.brain && data.brain.levels?data:null;
        }catch(error){
            return null;
        }
    }
}

import * as fs from "fs";
import * as simulator from "@ffxiv-teamcraft/simulator";

let file_data = fs.readFileSync(process.argv[2], {"encoding": "UTF-8"});
const data = JSON.parse(file_data);

function get_recipe(name: string): simulator.Craft {
    for (const r of data) {
        if (r['name']['en'] == name) {
            return {
                // Simulator doesn't care what the job ID actually is
                job: 0,
                id: r['id'],
                rlvl: r['level'],
                progress: r['difficulty'],
                durability: r['durability'],
                quality: r['maxQuality'],
                lvl: r['baseLevel'],
                suggestedCraftsmanship: r['suggestedCraftsmanship'] || 0,
                suggestedControl: r['suggestedControl'] || 0,
                // Use no consumables or high-quality ingredients
                hq: 0,
                quickSynth: 0,
                ingredients: [],
            };
        }
    }
}

const recipe = get_recipe(process.argv[3]);

const firnagzen_stats = new simulator.CrafterStats(
    /*jobId*/ 0,
    /*craftsmanship*/ 2356,
    /*control*/ 2324,
    /*cp*/ 471,
    /*specialist*/ false,
    /*level*/ 80,
    /*levels*/ [80, 80, 80, 80, 80, 80, 80, 80]);

function action_reg_index_of(name: string): number {
    return simulator.CraftingActionsRegistry.ALL_ACTIONS.findIndex(el => el.name == name);
}

function rotation_from_friendly(friendly_rotation: string[]): number[] {
    return friendly_rotation.map(action_reg_index_of);
}

function instantiate_rotation(rotation: number[]): simulator.CraftingAction[] {
    return rotation.map(el => simulator.CraftingActionsRegistry.ALL_ACTIONS[el].action);
}

const friendly_rotation: string[] = [
    "Reflect",
    "Manipulation",
    "PrudentTouch",
    "PrudentTouch",
    "WasteNot",
    "StandardTouch",
    "Innovation",
    "PreparatoryTouch",
    "PreparatoryTouch",
    "GreatStrides",
    "ByregotsBlessing",
    "Veneration",
    "Groundwork",
    "Groundwork",
];
const rotation = instantiate_rotation(rotation_from_friendly(friendly_rotation));

function action_to_friendly(action: simulator.CraftingAction): string {
    return simulator.CraftingActionsRegistry.ALL_ACTIONS.find(el => el.action == action).name
}

function actions_to_friendly(actions: simulator.CraftingAction[]): string[] {
    return actions.map(action_to_friendly);
}

function explore(rotation: simulator.CraftingAction[]): simulator.CraftingAction[] {
    // Debug
    // console.log("exploring:", actions_to_friendly(rotation));
    
    // Too deep?
    if (rotation.length > 15) {
        return null;
    }

    // Success?
    const sim = new simulator.Simulation(recipe, rotation, firnagzen_stats);
    sim.run(false, Infinity, true);
    if (sim.success && sim.quality > 0.95 * sim.recipe.quality) {
        // Only do the reliability check if the craft succeeds at all
        // const reliability = sim.getReliabilityReport();
        // if ((reliability.successPercent > 99) && (reliability.medianHQPercent > 99)) {
        //     return sim.actions;
        // }
        return sim.actions;
    }

    // Explore children
    for (const {action} of simulator.CraftingActionsRegistry.ALL_ACTIONS) {
        const next_rotation = [...rotation, action];
        const result = explore(next_rotation);
        if (result) {
            return result;
        }
    }

    // No luck, return
    return null;
}

const result = explore(rotation);
if (result) {
    console.log("Found solution: ", actions_to_friendly(result));
    const sim = new simulator.Simulation(recipe, result, firnagzen_stats);
    const reliability = sim.getReliabilityReport();
    console.log("Average HQ: ", reliability.averageHQPercent);
    console.log("Median HQ: ", reliability.medianHQPercent);
    console.log("Success rate: ", reliability.successPercent);
} else {
    console.log("No solution found!");
}

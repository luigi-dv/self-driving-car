# Neural Network - Self Driving Car 

This repository contains the code for a Self-driving car implemented without the use of external libraries, entirely written in JavaScript.

## Introduction

The goal of this project is to create a neural network-based model for autonomous navigation in a simulated environment. The neural network is trained to make decisions and control the movements of the car, allowing it to navigate through various scenarios.

## Features

- **Neural Network Implementation:** The self-driving car is powered by a neural network designed to analyze input data and make decisions based on the learned patterns.

- **JavaScript Implementation:** The entire codebase is written in JavaScript, making it accessible and easy to understand. This project serves as an educational resource for those interested in neural networks and self-driving car technology.

- **Simulation Environment:** The self-driving car operates in a simulated environment, providing a controlled setting for training and testing the neural network.

- **Generations:** When every car has crashed or stopped making progress, the best brain becomes the parent of the next generation. The parent is kept untouched in one car and mutated in the others.

- **Endless Traffic:** Traffic rows are generated at random ahead of the best car, so a brain has to learn to overtake instead of memorising one road.

- **Configurable Network:** The hidden layers and their activation function (`step`, `sigmoid`, `tanh`, `relu`) are set with `Car.hiddenLayers` and `Car.hiddenActivation` in `src/js/car.js`.

## Highway Policies

The cars drive under the highway rules of a region. The rules live in [`src/config/av_highway_policies.yaml`](src/config/av_highway_policies.yaml), one profile per region (`EU_STRICT`, `UK_STRICT`, `NA_FLEXIBLE`, `JP_STRICT`), and the profile is picked in the panel.

Lanes are counted from the slow side: `lane_0` is the outermost lane and `lane_max` the fastest one, on the right or on the left depending on `traffic_handedness`.

Every frame, for every car:

1. **Perception** (`policy/perception.js`) collects the vehicles around the car, the gaps, the lane closures and the signals.
2. **Orchestrator** (`policy/orchestrator.js`) runs the rules the profile enables, in stages: lane selection, passing, merge, exceptions, signals. A later stage can overrule an earlier one.
3. Each **rule** (`policy/rules/`) adjusts the **directive** of the car (lane, speed, offset in the lane, signals) and audits what the car really did.
4. The directive becomes three extra inputs of the network: lane error, speed error and heading. Violations and deviations lower the fitness, a hard violation takes the car out.

| Matrix entry | Rule | Profiles |
| --- | --- | --- |
| `MODE_STRICT_DISCIPLINE` | `strictDiscipline.js` | EU, UK, JP |
| `MODE_FLEXIBLE_CRUISE` | `flexibleCruise.js` | NA |
| `RULE_SINGLE_SIDE_PASS` and `CONGESTION_OVERRIDE` | `singleSidePass.js` | EU, UK, JP |
| `RULE_OMNI_PASS` | `omniPass.js` | NA |
| `PRIORITY_MAINLINE_ABSOLUTE` | `mainlinePriority.js` | EU, UK, JP |
| `PRIORITY_SHARED_COOPERATIVE` | `cooperativeMerge.js` | NA |
| `LANE_CLOSURE_ZIPPER` | `zipperMerge.js` | EU, UK, JP |
| `EMERGENCY_CORRIDOR_SPLIT` | `emergencyCorridor.js` | EU |
| `EMERGENCY_MOVE_OVER` | `emergencyMoveOver.js` | NA |
| High-beam flash from behind | `highBeamYield.js` | EU, UK |
| Sustained turn signal during a pass | `sustainedBlinker.js` | EU |
| Hazard lights at speed | `hazardDeceleration.js` | all |
| Brief hazards after a merge | `courtesyHazards.js` | UK, JP |

The traffic is scripted to put each rule to the test. A **scenario** (`traffic/scenarios/`) places vehicles and road features ahead of the best car, and every traffic vehicle follows a **technique** (cruise, ramp merge, zipper, gridlock, emergency run and so on).

To add a rule, create a class that extends `PolicyRule` and register it with `PolicyOrchestrator.register`. To add a region, add a profile to the YAML file. The numbers that are not part of the policy (gaps, timings, scale, fitness weights) are in `src/js/settings.js`.

## Controls
## Controls

The buttons between the road and the network, from top to bottom:

| Button | Action |
| --- | --- |
| Save | Stores the best brain in the browser (`localStorage`). |
| Discard | Removes the saved brain and restarts with random brains. The removed brain is kept as a backup. |
| Restore | Brings the discarded brain back. If a newer brain was saved in between, the two are swapped. |
| Next generation | Ends the current generation without waiting. |
| Export | Downloads the best brain as a JSON file. |
| Import | Loads a brain from a JSON file. Press Save to keep it. |

The selector under the buttons changes the regional profile and restarts the generation with the same brain.

The slider sets how much the brains are mutated in the next generation.

## Getting Started

Follow these steps to get the self-driving car simulation up and running on your local machine:

1. **Clone the Repository:**
```bash
git clone https://github.com/luigi-dv/self-driving-car.git
```
2. **Navigate to the Project Directory:**
   ```bash
   cd self-driving-car
   ```

3. **Open the Simulation:**
- Serve the folder and open it in a web browser. The policy file is loaded over http, so opening `index.html` straight from the disk runs the simulation without policies.
   ```bash
   python3 -m http.server 8000
   ```

4. **Explore the Code:**
- Take a look at the JavaScript code in the `src` directory to understand the implementation of the neural network and the self-driving car logic.

## Dependencies

This project is built without relying on external libraries. The neural network and simulation are implemented from scratch using JavaScript, showcasing the core concepts of self-driving car technology.

## Contributing

If you find issues or have ideas for improvements, feel free to contribute! Follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project was inspired by a passion for self-driving car technology and a desire to explore neural network implementations.
- Special thanks to the open-source community for valuable contributions and insights.

Happy coding and enjoy exploring the world of self-driving cars with neural networks!


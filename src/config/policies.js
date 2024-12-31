// AV Highway Behavioral Logic: Global Policy Matrix
//
// One profile per region. Every profile has the same five sections,
// each one is read by the rules in src/js/policy/rules:
//
//   lane_selection             STRICT_DISCIPLINE | FLEXIBLE_CRUISE
//   passing_rules              SINGLE_SIDE_PASS (+ congestion_exception) | OMNI_PASS
//   merge_protocol             mainline ABSOLUTE | SHARED_COOPERATIVE, zipper_merge
//   exception_handlers         emergency_corridor, emergency_move_over
//   perception_intent_mapping  signal of another vehicle -> expected reaction
//
// Lanes are counted from the slow side: lane_0 is the outermost slow lane,
// lane_max the innermost fast lane, for either traffic handedness (RHT/LHT).
// Speeds can be given in km/h (_kmh) or in mph (_mph).
const HighwayPolicies={
    version:"1.0",
    coordinate_convention:{
        lane_0:"outermost_slow_lane",
        lane_max:"innermost_fast_lane"
    },
    regional_profiles:{
        // Continental Europe: keep right, pass on the left, emergency corridor
        EU_STRICT:{
            applicable_regions:["DE","FR","PL","ES","IT","AT","CZ","NL"],
            traffic_handedness:"RHT",
            lane_selection:{
                mode:"STRICT_DISCIPLINE",
                default_lane:"lane_0",
                return_to_base_immediately:true,
                middle_lane_cruising_penalty:"HARD_VIOLATION"
            },
            passing_rules:{
                mode:"SINGLE_SIDE_PASS",
                allowed_passing_side:"LEFT",
                undertaking_allowed:false,
                congestion_exception:{
                    enabled:true,
                    max_queue_speed_kmh:60,
                    max_passing_delta_kmh:20
                }
            },
            merge_protocol:{
                mainline_priority:"ABSOLUTE",
                ramp_agent_must_yield:true,
                zipper_merge:{
                    enforced:true,
                    merge_point:"TERMINAL_NODE"
                }
            },
            exception_handlers:{
                emergency_corridor:{
                    enabled:true,
                    trigger_speed_kmh:10,
                    lane_max_offset:"FAR_LEFT",
                    other_lanes_offset:"FAR_RIGHT"
                },
                emergency_move_over:{
                    enabled:false
                }
            },
            perception_intent_mapping:{
                rear_high_beam_flash:"YIELD_LANE_WHEN_SAFE",
                sustained_left_blinker:"AGENT_REMAINING_IN_PASSING_LANE",
                downstream_hazards_on:"PREEMPTIVE_DECELERATION"
            }
        },

        // United Kingdom and Ireland: keep left, pass on the right
        UK_STRICT:{
            applicable_regions:["UK","IE"],
            traffic_handedness:"LHT",
            lane_selection:{
                mode:"STRICT_DISCIPLINE",
                default_lane:"lane_0",
                return_to_base_immediately:true,
                middle_lane_cruising_penalty:"HARD_VIOLATION"
            },
            passing_rules:{
                mode:"SINGLE_SIDE_PASS",
                allowed_passing_side:"RIGHT",
                undertaking_allowed:false,
                congestion_exception:{
                    enabled:true,
                    max_queue_speed_mph:37,
                    max_passing_delta_mph:12
                }
            },
            merge_protocol:{
                mainline_priority:"ABSOLUTE",
                ramp_agent_must_yield:true,
                zipper_merge:{
                    enforced:true,
                    merge_point:"TERMINAL_NODE"
                }
            },
            exception_handlers:{
                emergency_corridor:{
                    enabled:false
                },
                emergency_move_over:{
                    enabled:false
                }
            },
            perception_intent_mapping:{
                rear_high_beam_flash:"YIELD_LANE_WHEN_SAFE",
                downstream_hazards_on:"PREEMPTIVE_DECELERATION",
                brief_hazards_after_merge:"COURTESY_ACKNOWLEDGMENT"
            }
        },

        // North America: any lane, pass on both sides, move over law
        NA_FLEXIBLE:{
            applicable_regions:["US","CA"],
            traffic_handedness:"RHT",
            lane_selection:{
                mode:"FLEXIBLE_CRUISE",
                default_lane:"ANY",
                return_to_base_immediately:false,
                middle_lane_cruising_penalty:"NONE",
                yield_lane_max_to_faster_rear:true
            },
            passing_rules:{
                mode:"OMNI_PASS",
                allowed_passing_side:"BOTH",
                undertaking_allowed:true,
                congestion_exception:{
                    enabled:false
                }
            },
            merge_protocol:{
                mainline_priority:"SHARED_COOPERATIVE",
                ramp_agent_must_yield:true,
                mainline_courtesy_lane_shift:true,
                zipper_merge:{
                    enforced:false,
                    merge_point:"DYNAMIC"
                }
            },
            exception_handlers:{
                emergency_corridor:{
                    enabled:false
                },
                emergency_move_over:{
                    enabled:true,
                    trigger_distance_m:150,
                    action:"VACATE_ADJACENT_LANE",
                    fallback_speed_reduction_kmh:25
                }
            },
            perception_intent_mapping:{
                downstream_hazards_on:"PREEMPTIVE_DECELERATION"
            }
        },

        // Japan: keep left, pass on the right
        JP_STRICT:{
            applicable_regions:["JP"],
            traffic_handedness:"LHT",
            lane_selection:{
                mode:"STRICT_DISCIPLINE",
                default_lane:"lane_0",
                return_to_base_immediately:true,
                middle_lane_cruising_penalty:"SOFT_VIOLATION"
            },
            passing_rules:{
                mode:"SINGLE_SIDE_PASS",
                allowed_passing_side:"RIGHT",
                undertaking_allowed:false,
                congestion_exception:{
                    enabled:true,
                    max_queue_speed_kmh:40,
                    max_passing_delta_kmh:15
                }
            },
            merge_protocol:{
                mainline_priority:"ABSOLUTE",
                ramp_agent_must_yield:true,
                zipper_merge:{
                    enforced:true,
                    merge_point:"TERMINAL_NODE"
                }
            },
            exception_handlers:{
                emergency_corridor:{
                    enabled:false
                },
                emergency_move_over:{
                    enabled:false
                }
            },
            perception_intent_mapping:{
                downstream_hazards_on:"PREEMPTIVE_DECELERATION",
                brief_hazards_after_merge:"COURTESY_ACKNOWLEDGMENT"
            }
        }
    }
};

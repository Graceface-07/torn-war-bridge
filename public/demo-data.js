/**
 * Demo Data Generator
 * Provides realistic mock data for demonstrating the Command Hub
 */

const DemoData = {
    /**
     * Generate mock player data
     */
    getPlayerData: () => {
        return {
            player_id: 2089736,
            name: "CommanderDelta",
            level: 42,
            faction: {
                faction_id: 12345,
                faction_name: "Elite Warriors",
                position: "Leader",
                days_in_faction: 523
            },
            life: {
                current: 8750,
                maximum: 10000
            },
            strength: 125000000,
            defense: 98000000,
            speed: 110000000,
            dexterity: 105000000,
            total_stats: 438000000,
            money_onhand: 15750000,
            points: 89,
            profile_image: "https://www.torn.com/images/v2/default-avatars/default_male.png",
            age: 2156,
            property: "Private Island",
            gender: "Male",
            status: {
                description: "Online",
                state: "okay"
            },
            personalstats: {
                attackswon: 18542,
                attackslost: 892,
                defendswon: 5234,
                defendslost: 1123,
                respectforfaction: 45234,
                killstreak: 87
            }
        };
    },

    /**
     * Generate mock faction data
     */
    getFactionData: () => {
        return {
            ID: 12345,
            name: "Elite Warriors",
            tag: "ELTW",
            leader: 2089736,
            co_leader: 2089740,
            respect: 1250000,
            age: 1523,
            best_chain: 8752,
            capacity: 50,
            members: {
                2089736: {
                    name: "CommanderDelta",
                    level: 42,
                    days_in_faction: 523,
                    position: "Leader",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 300
                    }
                },
                2089740: {
                    name: "TacticalAlpha",
                    level: 38,
                    days_in_faction: 489,
                    position: "Co-leader",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 600
                    }
                },
                2089745: {
                    name: "StrikerBeta",
                    level: 35,
                    days_in_faction: 412,
                    position: "Officer",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 1200
                    }
                },
                2089750: {
                    name: "DefenderGamma",
                    level: 33,
                    days_in_faction: 378,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Offline",
                        timestamp: Math.floor(Date.now() / 1000) - 3600
                    }
                },
                2089755: {
                    name: "SniperOmega",
                    level: 31,
                    days_in_faction: 334,
                    position: "Member",
                    status: "Hospital",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 900
                    }
                },
                2089760: {
                    name: "MedicZeta",
                    level: 29,
                    days_in_faction: 298,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 1800
                    }
                },
                2089765: {
                    name: "ScoutEpsilon",
                    level: 27,
                    days_in_faction: 245,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Offline",
                        timestamp: Math.floor(Date.now() / 1000) - 7200
                    }
                },
                2089770: {
                    name: "TankTheta",
                    level: 26,
                    days_in_faction: 212,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 450
                    }
                },
                2089775: {
                    name: "AssassinKappa",
                    level: 25,
                    days_in_faction: 189,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 300
                    }
                },
                2089780: {
                    name: "SupportSigma",
                    level: 24,
                    days_in_faction: 156,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Offline",
                        timestamp: Math.floor(Date.now() / 1000) - 14400
                    }
                },
                2089785: {
                    name: "RangerPhi",
                    level: 23,
                    days_in_faction: 134,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 750
                    }
                },
                2089790: {
                    name: "GuardianPsi",
                    level: 22,
                    days_in_faction: 98,
                    position: "Member",
                    status: "Okay",
                    last_action: {
                        status: "Online",
                        timestamp: Math.floor(Date.now() / 1000) - 200
                    }
                }
            },
            stats: {
                respect: 1250000,
                territory: {
                    "sector_1": "Owned",
                    "sector_3": "Owned",
                    "sector_7": "Owned"
                }
            },
            territory: {
                "sector_1": "Owned",
                "sector_3": "Owned", 
                "sector_7": "Owned"
            }
        };
    },

    /**
     * Generate mock war analysis data
     */
    getWarAnalysis: () => {
        const factionData = DemoData.getFactionData();
        const members = Object.values(factionData.members);
        const totalMembers = members.length;
        const activeMembers = members.filter(m => 
            m.last_action.timestamp > Date.now() / 1000 - 86400
        ).length;

        return {
            totalMembers,
            activeMembers,
            readiness: Math.round((activeMembers / totalMembers) * 100),
            bestChain: 8752,
            respect: 1250000,
            verdict: "HIGHLY FAVORABLE - Strong chance of victory",
            lineup: [
                {
                    attacker: { name: "CommanderDelta", total: 438000000 },
                    target: { name: "EnemyAlpha", total: 420000000 },
                    expectedRespect: 125,
                    tier: "S"
                },
                {
                    attacker: { name: "TacticalAlpha", total: 385000000 },
                    target: { name: "EnemyBeta", total: 390000000 },
                    expectedRespect: 118,
                    tier: "A"
                },
                {
                    attacker: { name: "StrikerBeta", total: 320000000 },
                    target: { name: "EnemyGamma", total: 315000000 },
                    expectedRespect: 102,
                    tier: "A"
                }
            ],
            totalExpectedRespect: 345,
            tierBreakdown: {
                S: 1,
                A: 2,
                B: 0,
                C: 0,
                D: 0
            },
            recommendations: [
                "Target 3 matches identified",
                "Proceed with confidence",
                "Monitor enemy activity before engagement"
            ],
            beatableTargets: ["EnemyAlpha", "EnemyBeta", "EnemyGamma", "EnemyDelta", "EnemyEpsilon"]
        };
    }
};

module.exports.loop = function () {
    console.log("Game is at " + Game.time)

    let harvesters = getCreepsByRole(CreepRole.harvester)

    let spawnBabies = getCreepsByRole(CreepRole.spawnBaby)

    console.log('h ' + harvesters.length)
    console.log('s ' + spawnBabies.length)

    for (const i in Game.spawns) {
        Game.spawns[i].spawnCreep([WORK, CARRY, MOVE], 'Worker' + Game.time, {
            memory: { role: determineRole() }
        })
    }

    for (const i in Game.creeps) {
        const creep = Game.creeps[i]

        if (creep.store.getFreeCapacity() === 0 || creep.memory.isUpgrading) {
            // full
            creep.memory.isUpgrading = (creep.store.getUsedCapacity() > 0)
            if (creep.memory.role === CreepRole.harvester) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller.pos)
                }
            } else if (creep.memory.role === CreepRole.spawnBaby) {
                let spawn = Game.spawns["Mikey's Spawn"]
                if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn.pos)
                }
            } else if (creep.memory.role === CreepRole.miner) {
                // TODO: mine
                let target = getTarget(creep)
                if (target) {
                    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        } else {
            // hungry
            let target = getTarget(creep)
            if (target) {
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
}

// ENUMS
const CreepRole = {
    harvester: "harvester",
    spawnBaby: "spawn baby",
    miner: "miner",
}

// FUNCTIONS
function getCreepsByRole(role) {
    return Object.keys(Game.creeps).filter(i => {
        return Game.creeps[i].memory.role === role
    })
}

function determineRole() {
    if (getCreepsByRole(CreepRole.spawnBaby).length < 2)
        return CreepRole.spawnBaby

    // if (getCreepsByRole(CreepRole.miner).length < 2)
    //     return CreepRole.miner

    return CreepRole.harvester
}

function getTarget(creep) {
    let target = null
    if (creep.memory.role === CreepRole.harvester) {
        target = creep.room.controller.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
    } else if (creep.memory.role === CreepRole.spawnBaby) {
        let spawn = Game.spawns["Mikey's Spawn"]
        target = spawn.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
    } else if (creep.memory.role === CreepRole.miner) {
        target = creep.pos.findClosestByRange(FIND_MINERALS)
    }
    return target
}
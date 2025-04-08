export const skills = {
    absorbRoots: {
        name: 'Absorb Roots',
        description: 'Se cura o dano causado.',
        triggers: ['onAttack'],
        apply: (hero, target) => {
            if(target){
                target.takeDamage(hero.attack, hero);
                hero.heal(hero.stats.attack);
            }
        }
    },
    autoDefense: {
        name: 'Auto Defense',
        description: 'Sofre menos dano do counterAttack (-1)',
        triggers: [],
        apply: (hero, target) => {
            if (hero.ability === 'Auto Defense') {
                console.log(`${hero.name} reduz o dano do contra-ataque!`);
                target.takeDamage(Math.max(0, target.attack - 1));
            }
        }
    },
    beyondFront: {
        name: 'Beyond Front',
        description: 'Causa dano nas 3 casas em sequência da direção do ataque se estiverem ocupadas.',
        triggers: ['onAttack'],
        apply: (hero, target) => {
            const board = hero.scene.board;
        
            const fromHex = board.getHexByLabel(hero.state.position);
            const toHex = board.getHexByLabel(target.state.position);
        
            const hits = [target];
            const line = board.getHexesInLine(fromHex, toHex, 2);
        
            for (const hex of line) {
                const maybeHero = board.heros[hex.label];
                if (maybeHero && maybeHero !== hero && maybeHero.state.isAlive) {
                    hits.push(maybeHero);
                } else {
                    break; // Parar se não tem inimigo
                }
            }
        
            hits.forEach((h, index) => {
                const dmg = index === 0 ? hero.stats.attack : Math.floor(hero.stats.attack * 0.5);
                h.takeDamage(dmg, hero);
            });
        }
    },           
    brokenDefense: {
        name: 'Broken Defense',
        description: 'Causa mais dano em inimigos com "Taunt". (+2)',
        triggers: ['onAttack'],
        apply: (hero, target) => {
            if (target.ability === 'Taunt') {
                const bonusDamage = hero.attack + 2;
                console.log(`${hero.name} causa dano extra a ${target.name} devido a "Broken Defense"!`);
                target.takeDamage(bonusDamage, hero);
            } else {
                console.log(`${hero.name} ataca ${target.name} normalmente.`);
                target.takeDamage(hero.attack, hero);
            }
        }
    },
    firstPunch: {
        name: 'First Punch',
        description: 'Primeiro ataque da partida causa mais dano (+2)',
        triggers: ['onTurnStart', 'onAttack'],
        apply: (hero, target = null) => {
            if (!hero.state.firstPunchApplied && hero.state.isAlive && !hero.state.hasPunched && target === null) {
                hero.increaseAttack(2);
                hero.state.firstPunchApplied = true;
                console.log(`${hero.name} prepara um soco poderoso! (+2 ataque)`);
                return;
            }

            if (target && !hero.state.hasPunched) {
                console.log(`${hero.name} usa seu First Punch causando dano adicional!`);
                target.takeDamage(hero.attack, hero);
                hero.increaseAttack(-2);
                hero.state.hasPunched = true;
                return;
            } 

            if (target && hero.state.hasPunched) {
                target.takeDamage(hero.attack, hero);
                return;
            }
        }
    },
    goodLuck: {
        name: 'Good Luck',
        description: 'Tem 50% de chance de aumentar um de ataque.',
        triggers: ['onTurnEnd'],
        apply: (hero) => {
            if(Math.random() < 0.5) {
                console.log(`${hero.name} teve sorte! (+1 ataque)`);
                hero.increaseAttack(1);
            } else {
                console.log(`${hero.name} não teve sorte!`);
            }
        }
    },
    poisonAttack: {
        name: 'Poison Attack',
        description: 'Envenena o inimigo causando 1 de dano por turno.',
        triggers: ['onAttack'],
        apply: (hero, target) => {
            console.log(`${hero.name} envenena ${target.name}!`);
            target.takeDamage(hero.attack, hero);
            target.applyStatusEffect({
                type: 'poison',
                duration: Infinity,
                effect: (target) => {
                    console.log(`${target.name} recebe 1 de dano por veneno!`); 
                    target.takeDamage(1);
                }
            });
        }
    }
};

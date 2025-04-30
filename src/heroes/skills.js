export const skills = {
  absorbRoots: {
    apply: (hero, target) => {
      if(target){
        target.takeDamage(hero.attack, hero);
        hero.heal(hero.stats.attack);
      }
    },
    description: 'Recupera vida equivalente ao dano causado.',
    name: 'Absorb Roots',
    triggers: ['onAttack']
  },
  autoDefense: {
    apply: () => {
      //
    },
    description: 'Recebe 1 ponto a menos de dano ao sofrer contra-ataques.',
    name: 'Auto Defense',
    triggers: ['']
  },
  beyondFront: {
    apply: (hero, target) => {
      const board = hero.scene.board;
        
      const fromHex = board.getHexByLabel(hero.state.position);
      const toHex = board.getHexByLabel(target.state.position);
        
      const hits = [target];
      const line = board.getHexesInLine(fromHex, toHex, 2);
        
      for (const hex of line) {
        const maybeHero = board.heroes[hex.label];
        if (
          maybeHero &&
                    maybeHero !== hero &&
                    maybeHero.state.isAlive &&
                    maybeHero.playerId !== hero.playerId
        ) {
          hits.push(maybeHero);
        } else {
          break;
        }
      }
        
      hits.forEach((h, index) => {
        const dmg = index === 0 ? hero.stats.attack : Math.floor(hero.stats.attack * 0.5);
        h.takeDamage(dmg, hero);
      });
    },
    description: 'Ataca até 3 casas em linha reta na direção do ataque, se estiverem ocupadas.',
    name: 'Beyond Front',
    triggers: ['onAttack']
  },
  brokenDefense: {
    apply: (hero, target) => {
      if (target.ability === 'Taunt') {
        const bonusDamage = hero.stats.attack + 2;
        console.log(`${hero.name} causa dano extra a ${target.name} devido a "Broken Defense"!`);
        target.takeDamage(bonusDamage, hero);
      } else {
        console.log(`${hero.name} ataca ${target.name} normalmente.`);
        target.takeDamage(hero.stats.attack, hero);
      }
    },
    description: 'Causa +2 de dano contra inimigos com o status "Taunt".',
    name: 'Broken Defense',
    triggers: ['onAttack']
  },  
  firstPunch: {
    apply: (hero, target = null) => {
      if (!hero.state.firstPunchApplied && hero.state.isAlive && !hero.state.hasPunched && target === null) {
        hero.increaseAttack(2);
        hero.state.firstPunchApplied = true;
        console.log(`${hero.name} prepara um soco poderoso! (+2 ataque)`);
        return;
      }

      if (target && !hero.state.hasPunched) {
        console.log(`${hero.name} usa seu First Punch causando dano adicional!`);
        target.takeDamage(hero.stats.attack, hero);
        hero.increaseAttack(-2);
        hero.state.hasPunched = true;
        return;
      } 

      if (target && hero.state.hasPunched) {
        target.takeDamage(hero.attack, hero);
        return;
      }
    },
    description: 'O primeiro ataque do herói na partida causa +2 de dano.',
    name: 'First Punch',
    triggers: ['onTurnStart', 'onAttack']
  },
  goodLuck: {
    apply: async (hero, target) => {
      if (!target) {
        const roomId = hero.scene.gameManager.roomId;

        const gotLucky = await new Promise(resolve => {
          hero.socket.once('GOOD_LUCK_RESULT', resolve);
          hero.socket.emit('CHECK_GOOD_LUCK', { roomId });
        });
  
        if (gotLucky) {
          console.log(`${hero.name} teve sorte! (+1 ataque)`);
          hero.increaseAttack(1);
        } else {
          console.log(`${hero.name} não teve sorte!`);
        }
      }
  
      if (target) {
        target.takeDamage(hero.stats.attack, hero);
      }
    },
    description: 'Tem 50% de chance de ganhar +1 de ataque ao mudar o turno.',
    name: 'Good Luck',
    triggers: ['onTurnEnd', 'onAttack']
  },  
  poisonAttack: {
    apply: (hero, target) => {
      console.log(`${hero.name} envenena ${target.name}!`);
      target.takeDamage(hero.attack, hero);
        
      const alreadyPoisoned = target.state.statusEffects?.some(
        (effect) => effect.type === 'poison'
      );
        
      if (!alreadyPoisoned) {
        target.applyStatusEffect({
          duration: Infinity,
          effect: (target) => {
            console.log(`${target.name} recebe 1 de dano por veneno!`); 
            target.takeDamage(1);
          },
          type: 'poison'
        });
      }
    },
    description: 'Envenena o inimigo causando 1 de dano por turno.',
    name: 'Poison Attack',
    triggers: ['onAttack']        
  },
  trustInTeam: {
    apply: (hero) => {
      const board = hero.scene.board;
      const allies = board.getAlliesInRange(hero, 1);

      const baseAttack = hero.attack;
      const buffed = hero.stats.attack > baseAttack;

      if (allies.length > 0 && !buffed) {
        console.log(`${hero.name} está com aliados próximos! (+1 ataque)`);
        hero.increaseAttack(1);
      } else if (allies.length === 0 && buffed) {
        console.log(`${hero.name} não tem aliados próximos! (-1 ataque)`);
        hero.increaseAttack(-1);
      }
    },
    description: 'Recebe +1 de ataque ao ter aliados em casas adjacentes.',
    name: 'Trusted in Team',
    triggers: ['onMove', 'onTurnStart']
  }
};

export const skills = {
  absorbRoots: {
    apply: ({hero}) => {
        hero.heal(hero.stats.attack);
    },
    triggers: ['onAttack', 'onCounterAttack']
  },
  beyondFront: {
    apply: ({hero, target, scene}) => {
      const board = hero.scene.board;
        
      const fromHex = board.getHexByLabel(hero.state.position);
      const toHex = board.getHexByLabel(target.state.position);
        
      const hits = [target];
      const line = board.getHexesInLine(fromHex, toHex, 2);
        
      for (const hex of line) {
        const maybeHero = board.gameManager.getHeroByPosition(hex.label);
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
        
      hits.slice(1).forEach((h) => {
        h.takeDamage(hero.stats.attack, hero);
      });

      if(hits.length > 1) {
        scene.uiManager.heroTalk(hero, 'Hiay!');
      }
    },
    triggers: ['onAttack']
  },
  brokenDefense: {
    apply: ({hero, target, isCounterAttack, scene}) => {
      if (target.ability === 'Taunt') {
        const bonusDamage = hero.stats.attack + 1;
        console.log(`${hero.name} causa dano extra a ${target.name} devido a "Broken Defense"!`);
        scene.uiManager.heroTalk(hero, 'Dano extra!');
        target.takeDamage(bonusDamage, hero, isCounterAttack);
        hero.damageApplied = true;
      } else {
        console.log(`${hero.name} ataca ${target.name} normalmente.`);
        target.takeDamage(hero.stats.attack, hero, isCounterAttack);
        hero.damageApplied = true;
      }
    },
    triggers: ['onAttack']
  },  
  firstPunch: {
    apply: ({hero, target, isCounterAttack, scene}) => {
      if (!hero.firstAttack && target === null) {
        if (!hero.firstPunchApplied && hero.stats.attack === 3) {
          hero.increaseAttack(2);
          hero.firstPunchApplied = true;
          console.log(`${hero.name} prepara um soco poderoso! (+2 ataque)`);
          scene.uiManager.heroTalk(hero, 'Ta na hora do fight!');
        }
        return;
      }

      if (target && !hero.firstAttack) {
        console.log(`${hero.name} usa seu First Punch causando dano adicional!`);
        scene.uiManager.heroTalk(hero, 'Soco carregado!');
        target.takeDamage(hero.stats.attack, hero, isCounterAttack);
        hero.damageApplied = true;
        hero.increaseAttack(-2);
        return;
      }
    },
    triggers: ['onTurnStart', 'onAttack', 'onCounterAttack']
  },
  goodLuck: {
    apply: async ({hero, scene}) => {
      const roomId = hero.scene.gameManager.roomId;

      const gotLucky = await new Promise(resolve => {
        hero.socket.once('GOOD_LUCK_RESULT', resolve);
        hero.socket.emit('CHECK_GOOD_LUCK', { roomId });
      });

      if (gotLucky) {
        console.log(`${hero.name} teve sorte! (+1 ataque)`);
        scene.uiManager.heroTalk(hero, 'Ouro!');
        hero.increaseAttack(1);
      } else {
        scene.uiManager.heroTalk(hero, 'Nada...');
        console.log(`${hero.name} não teve sorte!`);
      }
    },
    triggers: ['onTurnEnd']
  },  
  poisonAttack: {
    apply: ({hero, target, isCounterAttack, scene}) => {
      console.log(`${hero.name} envenena ${target.name}!`);

      const poisonEffect = target.state.statusEffects?.find(
        (effect) => effect.type === 'poison'
      );
        
      if(poisonEffect){
        const bonusDamage = hero.stats.attack + 2;
  
        poisonEffect.duration = 3;
        target.effectSprites.poison.setFrame(0);

        scene.uiManager.heroTalk(hero, 'Dano extra!');
        target.takeDamage(bonusDamage, hero, isCounterAttack);
        hero.damageApplied = true;
      }

      if (!poisonEffect) {
        scene.uiManager.heroTalk(hero, 'Veneno!');
        target.applyStatusEffect({
          duration: 3,
          effect: (target) => {
            console.log(`${target.name} recebe 1 de dano por veneno!`); 
            target.takeDamage(1);
          },
          type: 'poison'
        });
      }
    },
    triggers: ['onAttack', 'onCounterAttack']        
  },
  trustInTeam: {
    apply: ({hero, scene}) => {
      const board = hero.scene.board;
      const allies = board.getAlliesInRange(hero, 1);

      const baseAttack = hero.attack;
      const buffed = hero.stats.attack > baseAttack;

      if (allies.length > 0 && !buffed) {
        console.log(`${hero.name} está com aliados próximos! (+1 ataque)`);
        scene.uiManager.heroTalk(hero, 'Aliado próximo!');
        hero.increaseAttack(1);
      } else if (allies.length === 0 && buffed) {
        console.log(`${hero.name} não tem aliados próximos! (-1 ataque)`);
        scene.uiManager.heroTalk(hero, 'Estou sozinho...');
        hero.increaseAttack(-1);
      }
    },
    triggers: ['onMove', 'onTurnStart']
  },
  aloneIsBetter: {
    apply: ({hero, target, isCounterAttack, scene}) => {
      const board = hero.scene.board;
      const isAlone = board.getAlliesInRange(target, 1);

      if (isAlone.length === 0) {
        scene.uiManager.heroTalk(hero, 'Muahauhauhaua!');
        target.takeDamage(hero.stats.attack * 2, hero, isCounterAttack);
        hero.damageApplied = true;
      }
    },
    triggers: ['onAttack', 'onCounterAttack']
  }, 
  health: {
    apply: ({hero, scene}) => {
      const board = scene.board;
      const allies = board.getAlliesInRange(hero, 1);

      allies.forEach(ally => {
        let target = ally.occupiedBy;

        if(target.state.isAlive && target.stats.currentHealth < target.stats.maxHealth) {
          target.heal(2);
          console.log(`${target.name} recebe cura de 2 ponto!`);
          scene.uiManager.spriteAnimation(target);
          scene.uiManager.spriteAnimation(hero);
        }
      });
    },
    triggers: ['onTurnEnd']
  },
  clean: {
    apply: ({hero, scene}) => {
      const board = scene.board;
      const allies = board.getAlliesInRange(hero, 1);

      if (allies.length === 0) return;

      allies.forEach(ally => {
        let target = ally.occupiedBy;

        if (target.state.statusEffects?.length > 0) {
          target.clearStatusEffects();
          console.log(`${target.name} teve seus efeitos negativos removidos!`);
          scene.uiManager.spriteAnimation(target, 0xffffff);
          scene.uiManager.spriteAnimation(hero, 0xffffff);
        }
      });
    },
    triggers: ['onAttack']
  },
  rage: {
    apply: ({hero, target, scene}) => {
      const board = scene.board;
      const fromHex = board.getHexByLabel(hero.state.position);
      const toHex = board.getHexByLabel(target.state.position);
      const line = board.getHexesInLine(fromHex, toHex, 1);
      const nextHex = line[0];

      if (nextHex == undefined || nextHex.occupied) {
        const bonusDamage = hero.stats.attack + 1;
        target.takeDamage(bonusDamage, hero);
        hero.damageApplied = true;
      } else {
        board.moveHero(target, nextHex);
      }
    },
    triggers: ['onAttack']
  }
};

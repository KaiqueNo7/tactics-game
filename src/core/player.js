export default class Player {
  constructor(name, heroes = [], id, isBot = false) {
    this.id = id;
    this.name = name;
    this.heroes = heroes;
    this.isBot = isBot;
  }

  addHeroes(heroes){
    heroes.forEach(hero => {
      hero.addPlayerId(this.id);
      this.heroes.push(hero);
    });
  }

  toJSON() {
    return {
      heroes: this.heroes.map(char => char.toJSON()),
      id: this.id,
      name: this.name,
    };
  }
}

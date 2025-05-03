export default class Player {
  constructor(name, heroes = [], id, index) {
    this.id = id;
    this.name = name;
    this.heroes = heroes;
    this.index = index;
  }

  addHeroes(heroes){
    heroes.forEach(hero => {
      hero.addPlayerId(this.id);
      this.heroes.push(hero);
    });
  }

  getPlayerById(id) {
    return this.id === id ? this : null;
  }

  toJSON() {
    return {
      heroes: this.heroes.map(char => char.toJSON()),
      id: this.id,
      name: this.name,
      index: this.index
    };
  }
}

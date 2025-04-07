export default class Player {
  constructor(name, heros = []) {
      this.id = Date.now() + Math.random();
      this.name = name;
      this.heros = heros;
      this.strategy = 'default';
      this.color = 0x000000;
  }

  addHero(heros) {
      this.heros.push(heros);
  }

  removeHero(herosId) {
      this.heros = this.heros.filter(char => char.id !== herosId);
  }

  getAliveheros() {
      return this.heros.filter(char => char.state.isAlive);
  }

  toJSON() {
      return {
          id: this.id,
          name: this.name,
          heros: this.heros.map(char => char.toJSON())
      };
  }
}

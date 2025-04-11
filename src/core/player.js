export default class Player {
  constructor(name, heros = []) {
      this.id = Date.now() + Math.random();
      this.name = name;
      this.heros = heros;
      this.color = 0x000000;
      this.number = 1;
  }

  toJSON() {
      return {
          id: this.id,
          name: this.name,
          heros: this.heros.map(char => char.toJSON())
      };
  }
}

export default class BoardScene extends Phaser.Scene {
  constructor() {
      super('BoardScene');
      this.hexRadius = 40;
      this.columns = [6, 7, 6, 7, 6];
      this.columnLabels = ["A", "B", "C", "D", "E"];
  }

  preload() {
      // Carregar assets se necessário
  }

  create() {
      this.initializeBoard();
  }

  initializeBoard() {
      let xOffset = 100;
      for (let col = 0; col < this.columns.length; col++) {
          let yOffset = 100;
          if (col % 2 !== 0) { 
              yOffset -= this.hexRadius * Math.sqrt(3) / 2;
          }
          for (let row = 0; row < this.columns[col]; row++) {
              let label = this.columnLabels[col] + (row + 1);
              this.drawHexagon(xOffset, yOffset, label);
              yOffset += this.hexRadius * Math.sqrt(3);
          }
          xOffset += this.hexRadius * 1.5;
      }
  }

  drawHexagon(x, y, label) {
      const hexPath = new Phaser.Geom.Polygon(this.calculateHexagonPoints(x, y));
      const hex = this.add.polygon(x, y, hexPath.points, 0xcccccc);
      hex.setStrokeStyle(2, 0x000000);
      
      // Adicionar texto de label
      this.add.text(x, y, label, { 
          fontSize: '16px', 
          fill: '#000',
          align: 'center'
      }).setOrigin(0.5);

      // Adicionar interatividade
      hex.setInteractive();
      hex.on('pointerdown', () => {
          console.log(`Hexágono ${label} clicado`);
      });
  }

  calculateHexagonPoints(x, y) {
      const points = [];
      for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i + Math.PI / 3;
          points.push({
              x: x + this.hexRadius * Math.cos(angle),
              y: y + this.hexRadius * Math.sin(angle)
          });
      }
      return points;
  }
}
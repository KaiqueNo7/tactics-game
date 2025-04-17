export default class GameUI {
  constructor(scene) {
    this.scene = scene;
    this.messageQueue = [];
    this.isShowingMessage = false;

    this.container = this.scene.add.container(this.scene.scale.width / 2, -50);
        
    this.background = this.scene.add.image(0, 0, 'ui_box_brown')
      .setOrigin(0.5)
      .setScale(2, 1);

    this.text = this.scene.add.text(0, 0, '', {
      color: '#000',
      fontSize: '16px',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.container.add([this.background, this.text]);

    this.finalY = 150;
  }

  showMessage(message) {
    this.messageQueue.push(message);
    if (!this.isShowingMessage) {
      this.displayNextMessage();
    }
  }

  displayNextMessage() {
    if (this.messageQueue.length === 0) {
      this.isShowingMessage = false;
      return;
    }

    const message = this.messageQueue.shift();
    this.isShowingMessage = true;

    this.text.setText(message);
    this.container.setY(-50);
    this.container.setAlpha(0);
    this.container.setDepth(100);

    this.scene.tweens.add({
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.time.delayedCall(1200, () => {
          this.scene.tweens.add({
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              this.isShowingMessage = false;
              this.displayNextMessage();
            },
            targets: this.container,
            y: this.finalY - 20
          });
        });
      },
      targets: this.container,
      y: this.finalY
    });
  }
}

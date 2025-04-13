export default class GameUI {
    constructor(scene) {
        this.scene = scene;

        this.container = this.scene.add.container(this.scene.scale.width / 2, -50);
        
        this.background = this.scene.add.image(0, 0, 'ui_box_brown')
            .setOrigin(0.5)
            .setScale(2, 1);

        this.text = this.scene.add.text(0, 0, '', {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000',
        }).setOrigin(0.5);

        this.container.add([this.background, this.text]);

        this.finalY = 150;
    }

    showMessage(message) {
        this.text.setText(message);
        
        this.container.setY(-50);
        this.container.setAlpha(0);
        this.container.setDepth(100);

        this.scene.tweens.add({
            targets: this.container,
            y: this.finalY,
            alpha: 1,
            ease: 'Power2',
            duration: 400,
            onComplete: () => {
                this.scene.time.delayedCall(1200, () => {
                    this.scene.tweens.add({
                        targets: this.container,
                        y: this.finalY - 20,
                        alpha: 0,
                        ease: 'Power2',
                        duration: 400
                    });
                });
            }
        });        
    }
}

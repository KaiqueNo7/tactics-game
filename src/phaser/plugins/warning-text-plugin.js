class WarningTextPlugin extends Phaser.Plugins.ScenePlugin {

    constructor(scene, pluginManager) {
        super(scene, pluginManager);
        this.warningText = null;  // Inicializa como null
    }

    boot() {
        // Garante que o texto só é criado quando a cena está totalmente carregada
        this.systems.events.on('create', this.createText, this);
    }

    createText() {
        if (!this.warningText) {
            const canvasWidth = this.scene.cameras.main.width;
    
            this.warningText = this.scene.add.text(
                canvasWidth - 20, // Posição X - Próxima da borda direita
                70, // Posição Y
                '', 
                { 
                    font: 'bold 25px Arial', // Fonte e tamanho
                    fill: 'black',           // Cor do texto
                    wordWrap: { width: 300 }  // Quebra de linha automática
                }
            );
    
            // Ajusta a origem para alinhar à direita
            this.warningText.setOrigin(1, 0.5); // 1 significa alinhamento à direita, 0.5 centralizado verticalmente
            
            // Esconde o texto inicialmente
            this.warningText.setVisible(false);
        }
    }
    

    showTemporaryMessage(message, duration = 3000) {
        if (!this.warningText) this.createText(); // Garante que o texto foi inicializado
        
        this.warningText.setText(message);
        this.warningText.setVisible(true);

        this.scene.time.delayedCall(duration, () => {
            this.warningText.setVisible(false);
        });
    }
}

export default WarningTextPlugin;

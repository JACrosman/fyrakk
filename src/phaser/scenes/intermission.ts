import Phaser from "phaser";

import orbies from "../../assets/orbies.png";
import fyrakk from "../../assets/fyrakk.png";
import bg from "../../assets/ground.jpg";

export interface IntermissionConfig {
  speed: number;
  showLabels: boolean;
  minOrbs: number;
  maxOrbs: number;
}

export class Intermission extends Phaser.Scene {
  public fyrakk: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  public orbyGroup: Phaser.Physics.Arcade.Group;
  public orbies: any[] = [];
  public config: IntermissionConfig;

  preload() {
    this.load.spritesheet("orbies", orbies, {
      frameWidth: 66,
      frameHeight: 67,
    });
    this.load.image("fyrakk", fyrakk);
    this.load.image("background", bg);
  }

  update() {
    for (const orby of this.orbies) {
      orby.getData("text")?.setPosition(orby.x, orby.y);
    }
  }

  create() {
    const backgroundImage = this.add.image(0, 0, "background");
    backgroundImage.setScale(
      this.game.config.width / backgroundImage.width,
      this.game.config.height / backgroundImage.height
    );

    this.cameras.main.centerOn(0, 0);
    this.fyrakk = this.physics.add.staticImage(0, 0, "fyrakk").setCircle(50);
  }

  generate(config: IntermissionConfig) {
    this.config = config;
    this.orbies = this.generateOrbies();
    // this.start();
  }

  generateOrbies() {
    this.stop();

    this.orbyGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      allowGravity: false,
    });

    // Create an array to store the last two colors chosen
    const prevColors: string[] = [];
    const colorCounts = {
      leftRedCount: 0,
      rightRedCount: 0,
      leftPurpleCount: 0,
      rightPurpleCount: 0,
    };

    // Function to randomly choose a ball color
    function getRandomBallColor() {
      const colors = ["red", "purple"];
      let color;

      // Ensure that the same color is not chosen more than twice in a row
      do {
        // Randomly select a color from the colors array
        color = Phaser.Utils.Array.GetRandom(colors);
      } while (
        prevColors?.[prevColors.length - 1] === color &&
        prevColors?.[prevColors.length - 2] === color
      );

      // Update the lastTwoColors array
      prevColors.push(color);

      return color;
    }

    // Create balls around an object
    const numBalls = Phaser.Math.Between(
      this.config.minOrbs,
      this.config.maxOrbs
    );

    const ballRefs = [];

    const centerCount = Math.floor(numBalls / 2);
    const middleStart = numBalls % 2 === 0 ? centerCount - 1 : centerCount;
    const middleEnd = numBalls % 2 === 0 ? middleStart + 2 : middleStart + 1;

    for (let i = 0; i < middleStart; i++) {
      ballRefs.push(
        this.generateOrby(getRandomBallColor(), numBalls, i, colorCounts)
      );
    }

    for (let i = middleStart; i < middleEnd; i++) {
      ballRefs.push(
        this.generateOrby(getRandomBallColor(), numBalls, i, colorCounts, true)
      );
    }

    for (let i = numBalls - 1; i >= middleEnd; i--) {
      ballRefs.push(
        this.generateOrby(getRandomBallColor(), numBalls, i, colorCounts)
      );
    }

    return ballRefs;
  }

  generateOrby(
    ballColor: string,
    numBalls: number,
    index: number,
    colorCounts: any,
    isMiddle = false
  ) {
    const centerCount = Math.floor(numBalls / 2);
    // Define the center position of the semicircle
    const centerX = this.fyrakk.getCenter().x; // Example center X coordinate
    const centerY = this.fyrakk.getCenter().y - 125; // Example center Y coordinate

    // Define the radius of the semicircle
    const radius = 350; // Example radius

    // Calculate the angle between each ball
    const angleIncrement = Math.PI / (numBalls + 1);

    // Calculate the angle for this ball
    const angle = Math.PI - angleIncrement * (index + 1);

    // Calculate the position of the ball along the circumference of the semicircle
    const ballX = centerX + radius * Math.cos(angle);
    const ballY = centerY + radius * Math.sin(angle);

    // Create a ball sprite
    const ball = this.orbyGroup.create(ballX, ballY, "orbies");
    ball.setFrame(ballColor === "red" ? 0 : 1); // Set frame based on color
    ball.setScale(0.75);
    ball.setInteractive();

    if (this.config.showLabels) {
      let text = "";

      if (isMiddle) {
        if (ballColor === "red") {
          text = `MID O`;
        } else {
          text = `MID P`;
        }
      } else if (index < centerCount) {
        if (ballColor === "red") {
          text = `L${++colorCounts.leftRedCount} O`;
        } else {
          text = `L${++colorCounts.leftPurpleCount} P`;
        }
      } else {
        if (ballColor === "red") {
          text = `R${++colorCounts.rightRedCount} O`;
        } else {
          text = `R${++colorCounts.rightPurpleCount} P`;
        }
      }

      const textObj = this.add.text(ballX, ballY, text, { fontSize: "16px" });
      textObj.setOrigin(0.5);
      ball.setData("text", textObj);
    }

    ball.on("pointerdown", () => {
      this.stop();
    });

    return ball;
  }

  start() {
    for (const ball of this.orbyGroup.getChildren()) {
      this.physics.moveToObject(ball, this.fyrakk, this.config.speed);
    }
  }

  stop() {
    if (this.orbyGroup) {
      this.orbies.forEach((orby) => {
        orby.getData("text")?.destroy();
      });

      this.orbyGroup.clear(true, true);
      this.orbies = [];
    }
  }
}

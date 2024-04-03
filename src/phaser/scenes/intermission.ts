import Phaser from "phaser";

import orbies from "../../assets/orbies.png";
import fyrakk from "../../assets/fyrakk.png";
import bg from "../../assets/ground2.jpg";

export interface IntermissionConfig {
  speed: number;
  showLabels: boolean;
  minOrbs: number;
  maxOrbs: number;
  time: number;
  onSelection: (results: IntermissionResults) => void;
}

export interface IntermissionResults {
  win: boolean;
  outOfTime?: boolean;
  selected?: string;
}

export class Intermission extends Phaser.Scene {
  public fyrakk!: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  public orbyGroup!: Phaser.Physics.Arcade.Group;
  public orbies: any[] = [];
  public config!: IntermissionConfig;
  public selection: any;

  public timerText!: Phaser.GameObjects.Text;
  public timedEvent!: Phaser.Time.TimerEvent;
  public currentTime: number = 0;
  public isRunning: boolean = false;

  preload() {
    this.load.spritesheet("orbies", orbies, {
      frameWidth: 66,
      frameHeight: 67,
    });
    this.load.image("fyrakk", fyrakk);
    this.load.image("background", bg);
  }

  update(time: number, delta: number) {
    if (this.isRunning) {
      this.currentTime -= delta;

      if (this.currentTime <= 0) {
        console.log(time);
        this.currentTime = 0;
        this.pause();
        this.config.onSelection({ win: false, outOfTime: true });
      }

      this.timerText.setText("Time: " + this.formatTime(this.currentTime)); // Update the text
    }

    for (const orby of this.orbies) {
      orby.getData("text")?.setPosition(orby.x, orby.y);
    }
  }

  create() {
    const backgroundImage = this.add.image(0, 0, "background");
    backgroundImage.setScale(
      this.game.config.width as number / backgroundImage.width,
      this.game.config.height as number / backgroundImage.height
    );

    // Create a text object to display the countdown timer
    this.timerText = this.add.text(200, -350, "Time: " + this.formatTime(this.currentTime), {
      fontSize: "32px",
      color: "#ffffff",
    });
    this.timerText.setOrigin(0, 0);

    this.cameras.main.centerOn(0, 0);
    this.fyrakk = this.physics.add.staticImage(0, 0, "fyrakk").setCircle(50);
  }

  showLabels(on: boolean) {
    for (const orby of this.orbies) {
      orby.getData("text")?.setVisible(on);
    }
  }

  generate(config: IntermissionConfig) {
    this.config = config;
    this.orbies = this.generateOrbies();
    this.currentTime = this.config.time;
    this.isRunning = true;
    this.showLabels(this.config.showLabels);
    this.start();


    return this.selection;
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

    let leftSpeedModifier = 2;
    for (let i = 0; i < middleStart; i++) {
      ballRefs.push(
        this.generateOrby(getRandomBallColor(), numBalls, i, colorCounts, false, leftSpeedModifier)
      );
      leftSpeedModifier -= 0.15;
    }

    for (let i = middleStart; i < middleEnd; i++) {
      ballRefs.push(
        this.generateOrby(getRandomBallColor(), numBalls, i, colorCounts, true, 1.25)
      );
    }

    let rightSpeedModifier = 2;
    for (let i = numBalls - 1; i >= middleEnd; i--) {
      ballRefs.push(
        this.generateOrby(getRandomBallColor(), numBalls, i, colorCounts, false, rightSpeedModifier)
      );
      rightSpeedModifier -= 0.15;
    }

    const randomOrb = Phaser.Utils.Array.GetRandom(ballRefs);

    this.selection = randomOrb.getData("value");

    return ballRefs;
  }

  generateOrby(
    ballColor: string,
    numBalls: number,
    index: number,
    colorCounts: any,
    isMiddle = false,
    speedModifier: number = 1
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
    ball.setData('speed', speedModifier);

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
    ball.setData("value", text);

    const textObj = this.add.text(ballX, ballY, text.replace(' O', "").replace(' P', ""), { fontSize: "16px" });
    textObj.setOrigin(0.5);
    ball.setData("text", textObj);

    ball.on("pointerdown", () => {
      if (this.isRunning) {
        this.pause();
        console.log(text);
        this.config.onSelection({ win: this.selection === text, selected: text });
      }
    });

    return ball;
  }

  start() {
    this.physics.resume();
    for (const ball of this.orbyGroup.getChildren()) {
      this.physics.moveToObject(ball, this.fyrakk, this.config.speed * (ball.getData('speed') || 1));
    }

    // Create a countdown event that updates every second
    // this.timedEvent = this.time.addEvent({
    //   delay: 1000,
    //   callback: this.onTimerTick,
    //   callbackScope: this,
    //   loop: true,
    // });
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

  pause() {
    this.physics.pause();
    this.isRunning = false;
  }

  // Function to format the time in MM:SS format
  formatTime(milliseconds: number) {
    const seconds = milliseconds / 1000;
    return seconds.toFixed(2); // Format to two decimal places
  }
}

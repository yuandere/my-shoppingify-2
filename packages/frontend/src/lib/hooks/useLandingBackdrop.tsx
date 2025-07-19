import { useEffect } from "react";
import Matter from "matter-js";
import { debounce } from "@/lib/utils";

export function useLandingBackdrop(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.2 },
    });
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
        pixelRatio: window.devicePixelRatio,
      },
    });

    // Shared configuration
    const pegRadius = 5;
    const pegRows = 12;
    const pegSpacing = 55;
    // const startY = 425;

    // Create pegs in the shape of a shopping cart
    const createPegs = () => {
      const newPegs: Matter.Body[] = [];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 2 / 3;

      const cartWidth = pegRows * pegSpacing * 0.8;
      const cartHeight = cartWidth * 0.6;
      const handleHeight = cartHeight * 0.4;
      const wheelRadius = cartWidth * 0.08;

      const basketTopY = centerY - cartHeight / 2;
      const basketBottomY = centerY + cartHeight / 2;
      const basketLeftX = centerX - cartWidth / 2;
      const basketRightX = centerX + cartWidth / 2;

      const createPeg = (x: number, y: number) =>
        Matter.Bodies.circle(x, y, pegRadius, {
          isStatic: true,
          render: {
            fillStyle: "#6366f1",
            opacity: 0.3,
          },
          friction: 0.1,
          restitution: 0.5,
        });

      // Basket (a trapezoid)
      const topPegs = 10;
      const bottomPegs = 8;
      const basketRows = 6;

      for (let i = 0; i < basketRows; i++) {
        const t = i / (basketRows - 1);
        const currentY = basketTopY + t * cartHeight;
        const currentWidth = cartWidth - t * (cartWidth * 0.2);
        const numPegsInRow = Math.round(topPegs - t * (topPegs - bottomPegs));

        for (let j = 0; j < numPegsInRow; j++) {
          const u = j / (numPegsInRow - 1 || 1);
          const currentX =
            centerX - currentWidth / 2 + u * currentWidth;
          newPegs.push(createPeg(currentX, currentY));
        }
      }

      // Handle
      const handleX = basketRightX + cartWidth * 0.1;
      const handleTopY = basketTopY - handleHeight;

      for (let i = 0; i < 3; i++) {
        const t = i / 3;
        newPegs.push(createPeg(handleX, basketTopY - t * handleHeight));
      }
      for (let i = 0; i < 3; i++) {
        const t = i / 2;
        newPegs.push(
          createPeg(handleX - t * (cartWidth * 0.15), handleTopY)
        );
      }

      // Wheels
      const wheelY = basketBottomY + wheelRadius * 1.2;
      const wheelStructureRadius = pegSpacing / 3.5;

      const createWheel = (centerX: number, centerY: number) => {
        // A small diamond shape for the wheel
        newPegs.push(createPeg(centerX, centerY - wheelStructureRadius)); // Top
        newPegs.push(createPeg(centerX + wheelStructureRadius, centerY)); // Right
        newPegs.push(createPeg(centerX, centerY + wheelStructureRadius)); // Bottom
        newPegs.push(createPeg(centerX - wheelStructureRadius, centerY)); // Left
      };

      // Create left and right wheels
      createWheel(basketLeftX + wheelRadius, wheelY);
      createWheel(basketRightX - wheelRadius, wheelY);

      return newPegs;
    };

    // Initial peg creation
    const pegs = createPegs();

    // Add walls - only side walls, no bottom wall to let emojis fall through
    const wallThickness = 60;
    const walls = [
      // Left
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight,
        {
          isStatic: true,
          render: { fillStyle: "transparent" },
        }
      ),
      // Right
      Matter.Bodies.rectangle(
        window.innerWidth + wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight,
        {
          isStatic: true,
          render: { fillStyle: "transparent" },
        }
      ),
    ];

    Matter.Composite.add(engine.world, [...pegs, ...walls]);

    // Emoji configuration
    const emojis = [
      "🍎",
      "🥑",
      "🧅",
      "🍇",
      "🍌",
      "🥕",
      "🛒",
      "📝",
      "🥓",
      "🍕",
      "🥨",
      "🍪",
      "🍭",
      "🥩",
      "🍖",
      "🥖",
      "🥚",
    ];
    const emojiSize = 16;

    // Function to create emoji bodies
    const createEmoji = () => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const startX = window.innerWidth / 2 - (pegRows * pegSpacing) / 2;
      const x = startX + Math.random() * pegSpacing * (pegRows - 1);

      const emoji = Matter.Bodies.circle(x, -50, emojiSize / 2, {
        restitution: 0.5,
        friction: 0.02,
        frictionAir: 0.001,
        density: 0.001,
        render: {
          fillStyle: "transparent",
          opacity: 0.6,
        },
        label: randomEmoji,
        // @ts-expect-error extending with additional property
        timeCreated: Date.now(),
      });

      // Add some random initial velocity
      Matter.Body.setVelocity(emoji, {
        x: (Math.random() - 0.5) * 1.5,
        y: 0,
      });

      Matter.Composite.add(engine.world, emoji);
    };

    // Global cleanup check
    Matter.Events.on(engine, "afterUpdate", () => {
      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        if (body.label && emojis.includes(body.label)) {
          if (
            body.position.y > window.innerHeight - 50 ||
            // @ts-expect-error extended with additional property
            Date.now() - body.timeCreated > 10000
          ) {
            Matter.Composite.remove(engine.world, body);
          }
        }
      });
    });

    // Custom render function to draw emojis and enhance pegs
    Matter.Events.on(render, "afterRender", () => {
      const context = render.context;
      const bodies = Matter.Composite.allBodies(engine.world);

      // Draw peg glow with reduced opacity
      pegs.forEach((peg) => {
        const { x, y } = peg.position;
        const gradient = context.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          pegRadius * 3
        );
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.05)");
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

        context.beginPath();
        context.fillStyle = gradient;
        context.arc(x, y, pegRadius * 3, 0, Math.PI * 2);
        context.fill();
      });

      // Draw emojis with slight fade-out at bottom
      context.font = `${emojiSize * 2}px -apple-system, "Segoe UI Emoji", Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      bodies.forEach((body) => {
        if (body.label && emojis.includes(body.label)) {
          const { x, y } = body.position;
          const angle = body.angle;

          // Calculate opacity based on vertical position
          const fadeStart = window.innerHeight - 150;
          const opacity =
            y > fadeStart ? Math.max(0, 0.5 - (y - fadeStart) / 150) : 0.5;

          // Save context state
          context.save();

          // Translate and rotate for emoji
          context.translate(x, y);
          context.rotate(angle);

          // Draw emoji with opacity
          context.globalAlpha = opacity;
          context.fillText(body.label, 0, 0);

          // Restore context state
          context.restore();
        }
      });
    });

    // Start the engine and renderer
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Create new emojis more frequently
    const interval = setInterval(createEmoji, 300);

    // Handle window resize
    const handleResize = () => {
      if (!render) return;

      // Update render bounds and canvas dimensions
      render.bounds.max.x = window.innerWidth;
      render.bounds.max.y = window.innerHeight;
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Render.setPixelRatio(render, window.devicePixelRatio);

      // Remove old pegs
      Matter.Composite.remove(engine.world, pegs);
      pegs.length = 0;

      // Create and add new pegs
      const newPegs = createPegs();
      pegs.push(...newPegs);
      Matter.Composite.add(engine.world, pegs);

      // Update wall positions
      Matter.Body.setPosition(walls[0], {
        x: -wallThickness / 2,
        y: window.innerHeight / 2,
      });
      Matter.Body.setPosition(walls[1], {
        x: window.innerWidth + wallThickness / 2,
        y: window.innerHeight / 2,
      });
    };

    const debouncedHandleResize = debounce(handleResize, 250);
    window.addEventListener("resize", debouncedHandleResize);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", debouncedHandleResize);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      // @ts-expect-error Matter.js types are incorrect
      Matter.Events.off(engine);
    };
  }, [canvasRef]);
}

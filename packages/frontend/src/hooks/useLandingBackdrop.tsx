import { useEffect } from "react";
import Matter from "matter-js";

const initDebugger = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("eruda") === "true") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.body.appendChild(script);
    script.onload = () => {
      // @ts-expect-error eruda is present after loading
      window.eruda.init();
    };
  }
};

export function useLandingBackdrop(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  useEffect(() => {
    if (!canvasRef.current) return;
    // Initialize eruda debugger if URL param is present
    initDebugger();

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.3 },
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
    const startY = 425;

    // Create pegs in a triangular pattern
    const createPegs = () => {
      const startX = window.innerWidth / 2 - (pegRows * pegSpacing) / 2;
      const newPegs: Matter.Body[] = [];
      for (let row = 0; row < pegRows; row++) {
        const numPegsInRow = pegRows - row;
        for (let col = 0; col < numPegsInRow; col++) {
          const peg = Matter.Bodies.circle(
            startX + col * pegSpacing + (row * pegSpacing) / 2,
            startY + row * pegSpacing,
            pegRadius,
            {
              isStatic: true,
              render: {
                fillStyle: "#6366f1",
                opacity: 0.3,
              },
              friction: 0.1,
              restitution: 0.5,
            }
          );
          newPegs.push(peg);
        }
      }
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
            y > fadeStart ? Math.max(0, 1 - (y - fadeStart) / 150) : 1;

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
      // Update canvas dimensions
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Render.setPixelRatio(render, window.devicePixelRatio);

      // Remove old pegs
      pegs.forEach((peg) => {
        Matter.Composite.remove(engine.world, peg);
      });

      // Create and add new pegs
      const newPegs = createPegs();
      Matter.Composite.add(engine.world, newPegs);
      pegs.length = 0;
      pegs.push(...newPegs);

      // Update wall positions
      walls[1].position.x = window.innerWidth + wallThickness / 2;
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      // @ts-expect-error Matter.js types are incorrect
      Matter.Events.off(engine);
    };
  }, [canvasRef]);
}

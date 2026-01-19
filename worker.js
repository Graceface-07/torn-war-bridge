async function sendSpiesData(spies) {
  try {
    const response = await fetch("https://torn-war-bridge.tmecf.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ spies })
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Worker response:", data);
    return data;
  } catch (err) {
    console.error("Failed to send spies data:", err);
    return null;
  }
}

// Example usage:
const mySpies = [
  { player_id: 12345, name: "Spy A", strength: 10, defense: 12, speed: 8, dexterity: 9, total: 39 },
  { player_id: 67890, name: "Spy B", strength: 15, defense: 11, speed: 10, dexterity: 12, total: 48 }
];

{}

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST only" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    let written = 0;
    let failed = 0;
    let progress = [];

    try {
      const body = await request.json();
      const spies = body.spies || [];

      for (let i = 0; i < spies.length; i++) {
        const s = spies[i];

        if (!s.player_id) {
          failed++;
          continue;
        }

        try {
          await env.ROTATOR.put(
            "spy_" + s.player_id,
            JSON.stringify({
              name: s.name || "",
              strength: s.strength || 0,
              defense: s.defense || 0,
              speed: s.speed || 0,
              dexterity: s.dexterity || 0,
              total: s.total || 0,
              updated: Date.now()
            })
          );
          written++;

          if (written % 50 === 0) {
            progress.push({ written });
          }
        } catch {
          failed++;
        }
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response(
      JSON.stringify({ status: "ok", written, failed, progress }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  
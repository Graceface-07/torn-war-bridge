var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*" 
    };

    // --- RECEIVE DATA FROM GOOGLE SHEET ---
    if (request.method === "POST" && url.pathname === "/update-bridge") {
      const data = await request.json();
      // Store the whole batch in KV
      await env.ROTATOR.put("tactical_data", JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- SERVE DATA TO TACTICAL COMMAND PAGE ---
    if (url.pathname === "/get-tactical") {
      const data = await env.ROTATOR.get("tactical_data");
      return new Response(data || "[]", { headers });
    }

    return new Response("Bridge Active", { headers });
  }
};

export { worker_default as default };